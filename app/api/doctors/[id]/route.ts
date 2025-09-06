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