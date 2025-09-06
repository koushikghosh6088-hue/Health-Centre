/**
 * API route for sending appointment reminders
 * Can be called by cron jobs or manual triggers
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notificationService, type AppointmentData } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    // Check authorization (simple API key or admin check)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET || 'default-cron-secret'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { hoursAhead = 24 } = body // Default to 24-hour reminders

    // Calculate the target date range for reminders
    const now = new Date()
    const targetStart = new Date(now.getTime() + (hoursAhead - 1) * 60 * 60 * 1000) // hoursAhead - 1 hour
    const targetEnd = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000) // hoursAhead

    console.log(`🔔 Looking for appointments between ${targetStart.toISOString()} and ${targetEnd.toISOString()}`)

    // Find confirmed appointments in the target time window
    const appointments = await db.appointment.findMany({
      where: {
        appointmentDate: {
          gte: targetStart,
          lte: targetEnd,
        },
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      },
      include: {
        patient: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        },
        doctor: {
          select: {
            name: true,
            specialization: true,
            consultationFee: true,
          }
        }
      }
    })

    console.log(`📋 Found ${appointments.length} appointments for reminders`)

    // Send reminders for each appointment
    const reminderResults = []
    
    for (const appointment of appointments) {
      try {
        const reminderData: AppointmentData = {
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

        const result = await notificationService.sendAppointmentReminder(reminderData, hoursAhead)
        
        reminderResults.push({
          appointmentId: appointment.id,
          patientEmail: appointment.patient.email,
          success: true,
          emailSent: result.email?.success || false,
          smsSent: result.sms?.success || false,
        })

        console.log(`✅ Reminder sent for appointment ${appointment.id}`)
      } catch (error) {
        console.error(`❌ Failed to send reminder for appointment ${appointment.id}:`, error)
        
        reminderResults.push({
          appointmentId: appointment.id,
          patientEmail: appointment.patient.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successCount = reminderResults.filter(r => r.success).length
    const failureCount = reminderResults.length - successCount

    return NextResponse.json({
      success: true,
      message: `Processed ${appointments.length} appointments for ${hoursAhead}h reminders`,
      summary: {
        total: appointments.length,
        successful: successCount,
        failed: failureCount,
      },
      details: reminderResults,
    })

  } catch (error) {
    console.error('Error sending appointment reminders:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process appointment reminders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check upcoming appointments (for testing)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hoursAhead = parseInt(searchParams.get('hoursAhead') || '24')

    const now = new Date()
    const targetStart = new Date(now.getTime() + (hoursAhead - 1) * 60 * 60 * 1000)
    const targetEnd = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)

    const appointments = await db.appointment.findMany({
      where: {
        appointmentDate: {
          gte: targetStart,
          lte: targetEnd,
        },
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      },
      include: {
        patient: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        },
        doctor: {
          select: {
            name: true,
            specialization: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Found ${appointments.length} appointments in ${hoursAhead}h window`,
      timeWindow: {
        start: targetStart.toISOString(),
        end: targetEnd.toISOString(),
      },
      appointments: appointments.map(apt => ({
        id: apt.id,
        patientName: apt.patient.name,
        patientEmail: apt.patient.email,
        doctorName: apt.doctor.name,
        appointmentDate: apt.appointmentDate.toISOString(),
        timeSlot: apt.timeSlot,
      })),
    })

  } catch (error) {
    console.error('Error fetching upcoming appointments:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch upcoming appointments' 
      },
      { status: 500 }
    )
  }
}
