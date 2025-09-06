import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Configure the runtime to not use edge
export const runtime = 'nodejs'

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('token')?.value

  // Get current path and origin
  const path = request.nextUrl.pathname
  const origin = request.nextUrl.origin

  // Public routes that should always be accessible
  const publicRoutes = ['/login', '/signup', '/', '/about', '/contact', '/doctors', '/tests', '/testimonials']
  
  // If it's a public route, allow access
  if (publicRoutes.includes(path)) {
    return NextResponse.next()
  }

  // Define protected routes that require authentication
  const protectedRoutes = ['/admin']
  
  // Verify token only if needed
  const payload = token ? verifyToken(token) : null

  // Log authentication info
  console.log('Middleware - Current path:', path)
  console.log('Middleware - Token from cookies:', token ? 'present' : 'not present')
  console.log('Middleware - Token verification result:', payload ? 'valid' : 'invalid')
  if (payload) {
    console.log('Middleware - User role:', payload.role)
  }

  // If accessing admin routes, check for admin role
  if (path.startsWith('/admin')) {
    if (!payload || payload.role !== 'ADMIN') {
      console.log('Middleware - Admin access denied')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // If already logged in and trying to access login/signup, redirect to home
  if ((path === '/login' || path === '/signup') && payload) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If accessing protected route without valid token, redirect to login
  if (protectedRoutes.some(route => path.startsWith(route)) && !payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Default: allow the request
  return NextResponse.next()
}

// Configure which routes to run middleware on
// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
