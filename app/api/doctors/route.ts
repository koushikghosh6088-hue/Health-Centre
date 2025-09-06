import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/doctors - Get all doctors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const specialization = searchParams.get('specialization')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (specialization) {
      where.specialization = specialization
    }

    const [doctors, total] = await Promise.all([
      db.doctor.findMany({
        where,
        include: {
          availabilities: {
            where: { isActive: true },
            orderBy: { dayOfWeek: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.doctor.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        data: doctors,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}

// POST /api/doctors - Create new doctor
export async function POST(request: NextRequest) {
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

    const { name, specialization, qualification, experience, consultationFee, bio } = await request.json()

    if (!name || !specialization || !qualification || experience === undefined || consultationFee === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const doctor = await db.doctor.create({
      data: {
        name,
        specialization,
        qualification,
        experience: parseInt(experience),
        consultationFee: parseFloat(consultationFee),
        bio: bio || '',
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      doctor
    })
  } catch (error) {
    console.error('Error creating doctor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create doctor' },
      { status: 500 }
    )
  }
}