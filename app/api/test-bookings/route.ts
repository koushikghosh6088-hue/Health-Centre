import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { notificationService, type TestBookingData } from '@/lib/notifications'

const testBookingSchema = z.object({
  tests: z.array(z.object({
    testId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })),
  patientName: z.string(),
  patientEmail: z.string().email(),
  patientPhone: z.string(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  isHomeCollection: z.boolean().default(false),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = testBookingSchema.parse(body)

    if (validatedData.tests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No tests selected' },
        { status: 400 }
      )
    }

    // Validate that all tests exist and are active
    const testIds = validatedData.tests.map(t => t.testId)
    const existingTests = await db.test.findMany({
      where: {
        id: { in: testIds },
        isActive: true
      }
    })

    if (existingTests.length !== testIds.length) {
      return NextResponse.json(
        { success: false, error: 'One or more tests not found or not available' },
        { status: 404 }
      )
    }

    // Validate prices match
    for (const testItem of validatedData.tests) {
      const test = existingTests.find(t => t.id === testItem.testId)
      if (test && test.price !== testItem.price) {
        return NextResponse.json(
          { success: false, error: 'Test prices have changed. Please refresh and try again.' },
          { status: 409 }
        )
      }
    }

    // Find or create patient
    let patient = await db.user.findUnique({
      where: { email: validatedData.patientEmail }
    })

    if (!patient) {
      // Create new patient
      patient = await db.user.create({
        data: {
          email: validatedData.patientEmail,
          name: validatedData.patientName,
          phone: validatedData.patientPhone,
          role: 'PATIENT',
          password: '', // Will be set when user registers
        }
      })
    }

    // Calculate total amount
    const totalAmount = validatedData.tests.reduce((total, test) => {
      return total + (test.price * test.quantity)
    }, 0)

    // Create test booking with transaction
    const booking = await db.$transaction(async (prisma) => {
      // Create the main booking record
      const testBooking = await prisma.testBooking.create({
        data: {
          patientId: patient.id,
          preferredDate: validatedData.preferredDate ? new Date(validatedData.preferredDate) : null,
          preferredTime: validatedData.preferredTime,
          isHomeCollection: validatedData.isHomeCollection,
          address: validatedData.isHomeCollection ? validatedData.address : null,
          notes: validatedData.notes,
          totalAmount,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        }
      })

      // Create test booking items
      const testBookingItems = await Promise.all(
        validatedData.tests.map(testItem =>
          prisma.testBookingItem.create({
            data: {
              testBookingId: testBooking.id,
              testId: testItem.testId,
              quantity: testItem.quantity,
              price: testItem.price,
            }
          })
        )
      )

      return { testBooking, testBookingItems }
    })

    // Fetch the complete booking with related data
    const completeBooking = await db.testBooking.findUnique({
      where: { id: booking.testBooking.id },
      include: {
        tests: {
          include: {
            test: {
              select: {
                name: true,
                description: true,
                category: true,
              }
            }
          }
        },
        patient: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    })

    // Send notification emails/SMS in background
    const notificationData: TestBookingData = {
      bookingId: completeBooking!.id,
      patientName: completeBooking!.patient.name,
      patientEmail: completeBooking!.patient.email,
      patientPhone: completeBooking!.patient.phone || '',
      tests: completeBooking!.tests.map(item => ({
        name: item.test.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: completeBooking!.totalAmount,
      preferredDate: completeBooking!.preferredDate?.toISOString(),
      preferredTime: completeBooking!.preferredTime || undefined,
      isHomeCollection: completeBooking!.isHomeCollection,
      address: completeBooking!.address || undefined,
      notes: completeBooking!.notes || undefined,
      status: completeBooking!.status,
    }

    // Fire and forget - don't await to avoid blocking response
    notificationService.sendTestBookingConfirmation(notificationData).catch(error => {
      console.error('Failed to send test booking notifications:', error)
    })

    return NextResponse.json({
      success: true,
      data: completeBooking,
      message: 'Test booking created successfully',
    })
  } catch (error) {
    console.error('Error creating test booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data provided', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create test booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const isHomeCollection = searchParams.get('isHomeCollection')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    // Build where clause
    const where = {
      ...(patientId && { patientId }),
      ...(status && { status: status as any }),
      ...(isHomeCollection !== null && { isHomeCollection: isHomeCollection === 'true' }),
    }

    const [bookings, total] = await Promise.all([
      db.testBooking.findMany({
        where,
        include: {
          tests: {
            include: {
              test: {
                select: {
                  name: true,
                  description: true,
                  category: true,
                  preparation: true,
                }
              }
            }
          },
          patient: {
            select: {
              name: true,
              email: true,
              phone: true,
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      db.testBooking.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching test bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test bookings' },
      { status: 500 }
    )
  }
}
