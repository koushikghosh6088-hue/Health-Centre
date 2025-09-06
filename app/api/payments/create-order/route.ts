import { NextRequest, NextResponse } from 'next/server'
import { createRazorpayOrder } from '@/lib/payments/razorpay'
import { db } from '@/lib/db'
import { z } from 'zod'

const createOrderSchema = z.object({
  type: z.enum(['APPOINTMENT', 'TEST_BOOKING']),
  bookingId: z.string(),
  amount: z.number().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, bookingId, amount } = createOrderSchema.parse(body)

    // Verify booking exists and get details
    let booking: any = null
    let description = ''
    let customerDetails = {
      name: '',
      email: '',
      phone: ''
    }

    if (type === 'APPOINTMENT') {
      booking = await db.appointment.findUnique({
        where: { id: bookingId },
        include: {
          doctor: { select: { name: true, specialization: true } },
          patient: { select: { name: true, email: true, phone: true } }
        }
      })
      
      if (!booking) {
        return NextResponse.json(
          { success: false, error: 'Appointment not found' },
          { status: 404 }
        )
      }

      description = `Doctor appointment with ${booking.doctor.name} (${booking.doctor.specialization})`
      customerDetails = {
        name: booking.patient.name,
        email: booking.patient.email,
        phone: booking.patient.phone || ''
      }
    } else if (type === 'TEST_BOOKING') {
      booking = await db.testBooking.findUnique({
        where: { id: bookingId },
        include: {
          tests: {
            include: {
              test: { select: { name: true } }
            }
          },
          patient: { select: { name: true, email: true, phone: true } }
        }
      })
      
      if (!booking) {
        return NextResponse.json(
          { success: false, error: 'Test booking not found' },
          { status: 404 }
        )
      }

      const testNames = booking.tests.map((t: any) => t.test.name).slice(0, 3).join(', ')
      const additionalCount = Math.max(0, booking.tests.length - 3)
      description = `Diagnostic tests: ${testNames}${additionalCount > 0 ? ` and ${additionalCount} more` : ''}`
      
      customerDetails = {
        name: booking.patient.name,
        email: booking.patient.email,
        phone: booking.patient.phone || ''
      }
    }

    // Verify amount matches
    if (Math.round(booking.totalAmount * 100) !== Math.round(amount * 100)) {
      return NextResponse.json(
        { success: false, error: 'Amount mismatch' },
        { status: 400 }
      )
    }

    // Check if payment is already completed
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json(
        { success: false, error: 'Payment already completed' },
        { status: 409 }
      )
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(amount * 100), // Convert to paise
      notes: {
        type,
        bookingId,
        patientId: booking.patientId,
      }
    })

    // Update booking with payment order ID
    if (type === 'APPOINTMENT') {
      await db.appointment.update({
        where: { id: bookingId },
        data: { paymentId: razorpayOrder.id }
      })
    } else if (type === 'TEST_BOOKING') {
      await db.testBooking.update({
        where: { id: bookingId },
        data: { paymentId: razorpayOrder.id }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        description,
        customerDetails,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      }
    })
  } catch (error) {
    console.error('Error creating payment order:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data provided', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
