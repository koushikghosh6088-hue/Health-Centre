'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface User {
  name: string
  role: string
  email: string
}

export function AuthButtons() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return null // Or show a loading spinner
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium">{user.name}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Button 
        size="sm" 
        variant="ghost"
        onClick={() => router.push('/login')}
      >
        Login
      </Button>
      <Button
        size="sm" 
        variant="default"
        onClick={() => router.push('/signup')}
      >
        Sign Up
      </Button>
    </div>
  )
}
