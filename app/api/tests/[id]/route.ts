import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// DELETE /api/tests/[id] - Delete test
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // First check if test exists
    const test = await db.test.findUnique({
      where: { id: params.id }
    })

    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      )
    }

    // Delete test's bookings first
    await db.testBookingItem.deleteMany({
      where: { testId: params.id }
    })

    // Then delete the test
    await db.test.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Test deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting test:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete test' },
      { status: 500 }
    )
  }
}

// PUT /api/tests/[id] - Update test
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const test = await db.test.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        duration: parseInt(duration),
        preparation: preparation || ''
      }
    })

    return NextResponse.json({
      success: true,
      test
    })
  } catch (error) {
    console.error('Error updating test:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update test' },
      { status: 500 }
    )
  }
}





