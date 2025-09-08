import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/patients - Get all patients
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'STAFF')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const patients = await db.user.findMany({
      where: {
        role: 'PATIENT'
      },
      include: {
        appointments: {
          select: {
            id: true,
            appointmentDate: true,
            status: true,
            totalAmount: true
          },
          orderBy: {
            appointmentDate: 'desc'
          },
          take: 5
        },
        testBookings: {
          select: {
            id: true,
            bookingDate: true,
            status: true,
            totalAmount: true
          },
          orderBy: {
            bookingDate: 'desc'
          },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      patients
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}





