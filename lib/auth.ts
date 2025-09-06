import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'STAFF' | 'PATIENT'
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    if (!user.password) {
      return { success: false, error: 'Password not set. Please contact admin.' }
    }

    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid password' }
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }

    const token = generateToken(payload)

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

export async function createUser(data: {
  email: string
  name: string
  password: string
  phone?: string
  role?: 'ADMIN' | 'STAFF' | 'PATIENT'
}) {
  try {
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return { success: false, error: 'User already exists' }
    }

    const hashedPassword = await hashPassword(data.password)

    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role || 'PATIENT',
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error('User creation error:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export function requireAuth(requiredRoles: ('ADMIN' | 'STAFF' | 'PATIENT')[] = []) {
  return (token: string | null) => {
    if (!token) {
      return { success: false, error: 'No token provided' }
    }

    const payload = verifyToken(token)
    if (!payload) {
      return { success: false, error: 'Invalid token' }
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    return { success: true, user: payload }
  }
}

export function isAdmin(user: JWTPayload): boolean {
  return user.role === 'ADMIN'
}

export function isStaff(user: JWTPayload): boolean {
  return user.role === 'STAFF' || user.role === 'ADMIN'
}
