'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Phone, Mail } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'Tests', href: '/tests' },
    { name: 'About', href: '/about' },
    { name: 'Testimonials', href: '/testimonials' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-white/20 shadow">
      {/* Top bar with contact info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-blue-700">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-700">
                <Mail className="h-4 w-4" />
                <span>info@healthcarediagnostic.com</span>
              </div>
            </div>
            <div className="text-blue-700">
              Mon - Sat: 8:00 AM - 8:00 PM
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <span className="font-bold text-xl">HC</span>
              </div>
              <div>
                <div className="font-bold text-xl text-gray-900">HealthCare</div>
                <div className="text-sm text-gray-600">Diagnostic Centre</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-indigo-600 transition-colors font-medium relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-indigo-500 hover:after:w-full after:transition-all"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center space-x-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/doctors">Book Appointment</Link>
              </Button>
              <Button asChild size="sm" className="btn-modern btn-gradient rounded-full">
                <Link href="/tests">Book Test</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
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
