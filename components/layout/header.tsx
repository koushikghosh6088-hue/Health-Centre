'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Phone, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { JWTPayload } from '@/lib/auth'
import { AuthButtons } from './auth-buttons'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<JWTPayload | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    checkUser()
    const handleRouteChange = () => checkUser()
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      const result = await response.json()
      if (result.success) {
        setUser(result.data)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setUser(null)
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-md border-b border-gray-200/80'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      {/* Top bar with contact info */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-primary/10">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-center py-2 text-sm text-center sm:text-left">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                <a href="tel:+919876543210" className="hover:underline">
                  +91 98765 43210
                </a>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-secondary hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:info@healthcarediagnostic.com"
                  className="hover:underline"
                >
                  info@healthcarediagnostic.com
                </a>
              </div>
            </div>
            <div className="text-secondary mt-1 sm:mt-0">Mon - Sat: 8:00 AM - 8:00 PM</div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg shadow-primary/20">
                <span className="font-bold text-2xl text-white">HC</span>
              </div>
              <div>
                <div className="font-bold text-2xl text-gradient">
                  HealthCare
                </div>
                <div className="text-sm text-secondary -mt-1">
                  Diagnostic Centre
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-link text-gray-600 font-medium relative after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent hover:after:w-full after:transition-all after:duration-300"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center space-x-2 pl-4">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/doctors">Book Appointment</Link>
              </Button>
              <Button asChild size="sm" className="btn-gradient rounded-full">
                <Link href="/tests">Book Test</Link>
              </Button>
              <AuthButtons />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:bg-gray-200/60"
            >
              {isMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="container-custom py-6">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="nav-link text-lg font-medium text-gray-700 px-4 py-3 hover:bg-primary/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-3 px-4 pt-6 border-t border-gray-200">
                <Button asChild variant="outline" size="lg" className="w-full rounded-full">
                  <Link href="/doctors">Book Appointment</Link>
                </Button>
                <Button asChild size="lg" className="w-full btn-gradient rounded-full">
                  <Link href="/tests">Book Test</Link>
                </Button>
                <div className="w-full pt-2">
                  <AuthButtons />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main navigation */}
      <nav className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg shadow-primary/20">
                <span className="font-bold text-2xl text-white">HC</span>
              </div>
              <div>
                <div className="font-bold text-2xl text-gradient">
                  HealthCare
                </div>
                <div className="text-sm text-secondary -mt-1">
                  Diagnostic Centre
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-link text-gray-600 font-medium relative after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent hover:after:w-full after:transition-all after:duration-300"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center space-x-2 pl-4">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/doctors">Book Appointment</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full btn-gradient">
                <Link href="/tests">Book Test</Link>
              </Button>
              <AuthButtons />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:bg-gray-200/60"
            >
              {isMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl">
            <div className="container-custom py-6">
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="nav-link text-lg font-medium text-gray-700 px-4 py-3 hover:bg-primary/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex flex-col space-y-3 px-4 pt-6 border-t border-gray-200">
                  <Button asChild variant="outline" size="lg" className="w-full rounded-full">
                    <Link href="/doctors">Book Appointment</Link>
                  </Button>
                  <Button asChild size="lg" className="w-full btn-gradient rounded-full">
                    <Link href="/tests">Book Test</Link>
                  </Button>
                  <div className="w-full pt-2">
                    <AuthButtons />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
