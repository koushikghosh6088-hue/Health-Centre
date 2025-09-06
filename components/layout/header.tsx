'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Phone, Mail, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { JWTPayload } from '@/lib/auth'
import { AuthButtons } from './auth-buttons'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<JWTPayload | null>(null)
  const router = useRouter()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'Tests', href: '/tests' },
    { name: 'About', href: '/about' },
    { name: 'Testimonials', href: '/testimonials' },
    { name: 'Contact', href: '/contact' },
  ]

  useEffect(() => {
    // Check for user on mount and after any navigation
    checkUser()
  }, [])

  useEffect(() => {
    // Add event listener for route changes
    const handleRouteChange = () => {
      checkUser()
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  const checkUser = async () => {
    try {
      console.log('Header - Checking user authentication')
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      })
      
      console.log('Header - /me response status:', response.status)
      const result = await response.json()
      console.log('Header - /me response:', result)
      
      if (result.success) {
        console.log('Header - Setting user state:', result.data)
        setUser(result.data)
      } else {
        console.log('Header - Clearing user state')
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setUser(null)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      {/* Top bar with contact info */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container-custom">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1 text-secondary">
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-1 text-secondary">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@healthcarediagnostic.com</span>
              </div>
            </div>
            <div className="text-secondary">
              Mon - Sat: 8:00 AM - 8:00 PM
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
                <span className="font-bold text-xl text-white">HC</span>
              </div>
              <div>
                <div className="font-bold text-xl text-gradient">HealthCare</div>
                <div className="text-sm text-secondary">Diagnostic Centre</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-link relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center space-x-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/doctors">Book Appointment</Link>
              </Button>
              <Button asChild size="sm" variant="default">
                <Link href="/tests">Book Test</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg">
            <div className="container-custom py-4">
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="nav-link px-4 py-2 hover:bg-primary/5 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex flex-col space-y-2 px-4 pt-2 border-t border-gray-100">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/doctors">Book Appointment</Link>
                  </Button>
                  <Button asChild variant="default" className="w-full">
                    <Link href="/tests">Book Test</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 backdrop-blur bg-white/70">
            <div className="py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-2 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 space-y-2">
                <Button asChild size="sm" variant="outline" className="w-full rounded-full">
                  <Link href="/doctors">Book Appointment</Link>
                </Button>
                <Button asChild size="sm" className="w-full btn-modern btn-gradient rounded-full">
                  <Link href="/tests">Book Test</Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="w-full rounded-full">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
