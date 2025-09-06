import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/tests - Get all tests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    const [tests, total] = await Promise.all([
      db.test.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.test.count({ where })
    ])

    // Get unique categories
    const categories = await db.test.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    })

    return NextResponse.json({
      success: true,
      data: {
        data: tests,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        categories: categories.map(c => c.category).filter(Boolean)
      }
    })
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tests' },
      { status: 500 }
    )
  }
}

// POST /api/tests - Create new test
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

    const { name, description, price, category, duration, preparation } = await request.json()

    if (!name || !description || price === undefined || !category || duration === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const test = await db.test.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        duration: parseInt(duration),
        preparation: preparation || '',
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      test
    })
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create test' },
      { status: 500 }
    )
  }
}