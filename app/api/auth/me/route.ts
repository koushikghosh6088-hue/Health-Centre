import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

// Use Node.js runtime
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('ME endpoint - Checking authentication')
    
    const token = request.cookies.get('token')?.value
    console.log('ME endpoint - Token from cookies:', token ? 'present' : 'not present')

    if (!token) {
      console.log('ME endpoint - No token found')
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    console.log('ME endpoint - Token verification result:', payload ? 'valid' : 'invalid')
    
    if (!payload) {
      console.log('ME endpoint - Invalid token')
      // Clear invalid token
      const response = NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
      response.cookies.delete('token')
      return response
    }

    // Fetch fresh user data
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    console.error('Me endpoint error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
