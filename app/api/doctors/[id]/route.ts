import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/doctors/[id] - Get single doctor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctor = await db.doctor.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      },
      include: {
        availabilities: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' }
        }
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: doctor
    })
  } catch (error) {
    console.error('Error fetching doctor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctor' },
      { status: 500 }
    )
  }
}

// DELETE /api/doctors/[id] - Delete a doctor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First check if doctor exists
    const doctor = await db.doctor.findUnique({
      where: { id: params.id }
    })

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Delete doctor's availabilities first
    await db.doctorAvailability.deleteMany({
      where: { doctorId: params.id }
    })

    // Then delete the doctor
    await db.doctor.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Doctor deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting doctor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete doctor' },
      { status: 500 }
    )
  }
}