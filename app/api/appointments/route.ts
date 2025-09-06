import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { notificationService, type AppointmentData } from '@/lib/notifications'

const appointmentSchema = z.object({
  doctorId: z.string(),
  appointmentDate: z.string(),
  timeSlot: z.string(),
  patientName: z.string(),
  patientEmail: z.string().email(),
  patientPhone: z.string(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = appointmentSchema.parse(body)

    // Check if doctor exists and is active
    const doctor = await db.doctor.findUnique({
      where: { 
        id: validatedData.doctorId,
        isActive: true 
      },
    })

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found or not available' },
        { status: 404 }
      )
    }

    // Check if the time slot is already booked
    const appointmentDateTime = new Date(`${validatedData.appointmentDate}T${validatedData.timeSlot.split('-')[0]}:00`)
    const existingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: validatedData.doctorId,
        appointmentDate: appointmentDateTime,
        timeSlot: validatedData.timeSlot,
        status: {
          not: 'CANCELLED'
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked' },
        { status: 409 }
      )
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

    // Create appointment
    const appointment = await db.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: validatedData.doctorId,
        appointmentDate: appointmentDateTime,
        timeSlot: validatedData.timeSlot,
        notes: validatedData.notes,
        totalAmount: doctor.consultationFee,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
            consultationFee: true,
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
    const notificationData: AppointmentData = {
      appointmentId: appointment.id,
      patientName: appointment.patient.name,
      patientEmail: appointment.patient.email,
      patientPhone: appointment.patient.phone || '',
      doctorName: appointment.doctor.name,
      doctorSpecialization: appointment.doctor.specialization,
      appointmentDate: appointment.appointmentDate.toISOString(),
      timeSlot: appointment.timeSlot,
      consultationFee: appointment.doctor.consultationFee,
      notes: appointment.notes || undefined,
      status: appointment.status,
    }

    // Fire and forget - don't await to avoid blocking response
    notificationService.sendAppointmentConfirmation(notificationData).catch(error => {
      console.error('Failed to send appointment notifications:', error)
    })

    return NextResponse.json({
      success: true,
      data: appointment,
      message: 'Appointment booked successfully',
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data provided', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to book appointment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    // Build where clause
    const where = {
      ...(doctorId && { doctorId }),
      ...(patientId && { patientId }),
      ...(status && { status: status as any }),
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          doctor: {
            select: {
              name: true,
              specialization: true,
              consultationFee: true,
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
          { appointmentDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      db.appointment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
