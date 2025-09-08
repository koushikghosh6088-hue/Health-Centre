import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/auth'

// Use Node.js runtime
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user and include role
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    // Generic error message to prevent user enumeration
    const invalidCredentialsResponse = NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    )

    // Check if user exists
    if (!user) {
      console.log('Login attempt failed: User not found', { email })
      return invalidCredentialsResponse
    }

    // Check if user is active - handle case where isActive might be null in existing records
    if (user.isActive === false) {
      console.log('Login attempt failed: Account inactive', { email })
      return NextResponse.json(
        { success: false, error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('Login attempt failed: Invalid password', { email })
      return invalidCredentialsResponse
    }

    console.log('Generating token for user:', { id: user.id, email: user.email, role: user.role })
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    })
    console.log('Generated token:', token)

    // Create the response
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
    
    // Set the cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
    
    console.log('Setting cookie with options:', cookieOptions)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}