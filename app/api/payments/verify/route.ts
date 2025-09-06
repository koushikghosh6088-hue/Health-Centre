import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpayPayment, getRazorpayPayment } from '@/lib/payments/razorpay'
import { db } from '@/lib/db'
import { z } from 'zod'
import { notificationService, type PaymentData } from '@/lib/notifications'

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verifyPaymentSchema.parse(body)

    // Verify the payment signature
    const isSignatureValid = await verifyRazorpayPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isSignatureValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Get payment details from Razorpay
    const paymentDetails = await getRazorpayPayment(razorpay_payment_id)

    if (paymentDetails.status !== 'captured') {
      return NextResponse.json(
        { success: false, error: 'Payment not captured' },
        { status: 400 }
      )
    }

    // Find the booking associated with this payment
    let booking: any = null
    let updateData: any = {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
    }

    // Try to find appointment first
    booking = await db.appointment.findFirst({
      where: { paymentId: razorpay_order_id }
    })

    if (booking) {
      // Update appointment
      await db.appointment.update({
        where: { id: booking.id },
        data: updateData
      })

      // Get updated booking with relations
      booking = await db.appointment.findUnique({
        where: { id: booking.id },
        include: {
          doctor: { select: { name: true, specialization: true } },
          patient: { select: { name: true, email: true, phone: true } }
        }
      })
    } else {
      // Try to find test booking
      booking = await db.testBooking.findFirst({
        where: { paymentId: razorpay_order_id }
      })

      if (booking) {
        // Update test booking
        await db.testBooking.update({
          where: { id: booking.id },
          data: updateData
        })

        // Get updated booking with relations
        booking = await db.testBooking.findUnique({
          where: { id: booking.id },
          include: {
            tests: {
              include: {
                test: { select: { name: true } }
              }
            },
            patient: { select: { name: true, email: true, phone: true } }
          }
        })
      }
    }

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found for this payment' },
        { status: 404 }
      )
    }

    // Send payment confirmation notifications
    const paymentData: PaymentData = {
      bookingId: booking.id,
      patientName: booking.patient.name,
      amount: paymentDetails.amount / 100, // Convert from paise to rupees
      paymentId: razorpay_payment_id,
      paymentStatus: 'PAID',
      bookingType: booking.tests ? 'test-booking' : 'appointment',
    }

    // Fire and forget - don't await to avoid blocking response
    notificationService.sendPaymentConfirmation(
      paymentData,
      booking.patient.email,
      booking.patient.phone
    ).catch(error => {
      console.error('Failed to send payment notifications:', error)
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      data: {
        bookingId: booking.id,
        paymentId: razorpay_payment_id,
        amount: paymentDetails.amount / 100, // Convert from paise to rupees
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      }
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data provided', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
