'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Test, ApiResponse, PaginatedResponse } from '@/types'
import { formatCurrency, formatDate, addDays } from '@/lib/utils'
import { 
  TestTube, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Plus,
  Minus,
  X,
  Home,
  Building
} from 'lucide-react'
import Link from 'next/link'

interface CartItem {
  test: Test;
  quantity: number;
}

export default function BookTestsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [tests, setTests] = useState<Test[]>([]) // Initialize as empty array
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    preferredDate: '',
    preferredTime: '',
    isHomeCollection: false,
    address: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  useEffect(() => {
    fetchTests()
    // Pre-select tests if coming from tests page
    const selectedTests = searchParams.get('selected')
    if (selectedTests) {
      const testIds = selectedTests.split(',')
      // We'll load these after tests are fetched
    }
  }, [])

  useEffect(() => {
    // Initialize preferred date to tomorrow
    const tomorrow = addDays(new Date(), 1)
    setFormData(prev => ({
      ...prev,
      preferredDate: tomorrow.toISOString().split('T')[0]
    }))
  }, [])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tests?limit=100')
      const result: ApiResponse<PaginatedResponse<Test> & { categories: string[] }> = await response.json()

      if (result.success && result.data && result.data.data) {
        const testsData = result.data.data || []
        setTests(testsData)
        
        // Pre-select tests if coming from tests page
        const selectedTests = searchParams.get('selected')
        if (selectedTests) {
          const testIds = selectedTests.split(',')
          const selectedItems: CartItem[] = testsData
            .filter(test => testIds.includes(test.id))
            .map(test => ({ test, quantity: 1 }))
          setCart(selectedItems)
        }
      } else {
        setTests([]) // Set empty array on failure
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
      setTests([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (test: Test) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.test.id === test.id)
      if (existingItem) {
        return prev.map(item =>
          item.test.id === test.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { test, quantity: 1 }]
    })
  }

  const updateQuantity = (testId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(testId)
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.test.id === testId 
          ? { ...item, quantity }
          : item
      )
    )
  }

  const removeFromCart = (testId: string) => {
    setCart(prev => prev.filter(item => item.test.id !== testId))
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.test.price * item.quantity), 0)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return

    setSubmitting(true)

    try {
      const bookingData = {
        tests: cart.map(item => ({
          testId: item.test.id,
          quantity: item.quantity,
          price: item.test.price
        })),
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        isHomeCollection: formData.isHomeCollection,
        address: formData.address,
        notes: formData.notes,
      }

      const response = await fetch('/api/test-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const result = await response.json()

      if (result.success) {
        setBookingComplete(true)
      } else {
        alert(result.error || 'Error booking tests. Please try again.')
      }
    } catch (error) {
      console.error('Error booking tests:', error)
      alert('Error booking tests. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Test Booking Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">
              Your diagnostic tests have been successfully booked. 
              {formData.isHomeCollection 
                ? ' Our team will contact you to schedule the home collection.'
                : ' Please visit our centre on your preferred date and time.'
              }
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">Booking Summary:</h3>
              <div className="space-y-2">
                <div className="text-sm text-blue-800">
                  <p><strong>Patient:</strong> {formData.patientName}</p>
                  <p><strong>Date:</strong> {formatDate(formData.preferredDate)}</p>
                  <p><strong>Time:</strong> {formData.preferredTime}</p>
                  <p><strong>Collection:</strong> {formData.isHomeCollection ? 'Home Collection' : 'Lab Visit'}</p>
                  <p><strong>Total Amount:</strong> {formatCurrency(getTotalAmount())}</p>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Selected Tests:</p>
                  {cart.map((item, index) => (
                    <p key={index} className="text-sm text-blue-800">
                      • {item.test.name} (Qty: {item.quantity}) - {formatCurrency(item.test.price * item.quantity)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-4 justify-center">
              <Button asChild>
                <Link href="/tests">Book More Tests</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/tests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Book Diagnostic Tests</h1>
          <p className="text-gray-600">Select tests and schedule your appointment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Selection */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="h-5 w-5 mr-2" />
                Available Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(!tests || tests.length === 0) ? (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tests available</p>
                  </div>
                ) : (
                  tests.map((test) => {
                    const inCart = cart.find(item => item.test.id === test.id)
                    return (
                      <div key={test.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{test.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {test.category && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {test.category}
                                </span>
                              )}
                              {test.duration && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {test.duration} min
                                </span>
                              )}
                            </div>
                            <div className="text-lg font-semibold text-green-600 mt-2">
                              {formatCurrency(test.price)}
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {inCart ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(test.id, inCart.quantity - 1)}
                                  className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{inCart.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(test.id, inCart.quantity + 1)}
                                  className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => addToCart(test)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cart & Booking Form */}
          <div className="space-y-6">
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Selected Tests
                  <span className="text-sm font-normal text-gray-500">
                    {cart.length} item{cart.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No tests selected
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.test.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.test.name}</h4>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(item.test.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm">
                            {formatCurrency(item.test.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.test.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total:</span>
                        <span className="text-green-600">{formatCurrency(getTotalAmount())}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Form */}
            {cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Name *
                      </label>
                      <input
                        type="text"
                        name="patientName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.patientName}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="patientEmail"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.patientEmail}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="patientPhone"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.patientPhone}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        required
                        min={addDays(new Date(), 1).toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.preferredDate}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Time
                      </label>
                      <select
                        name="preferredTime"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.preferredTime}
                        onChange={handleFormChange}
                      >
                        <option value="">Select Time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    <div className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          name="isHomeCollection"
                          id="homeCollection"
                          className="mt-1"
                          checked={formData.isHomeCollection}
                          onChange={handleFormChange}
                        />
                        <div>
                          <label htmlFor="homeCollection" className="block text-sm font-medium text-gray-900">
                            <Home className="h-4 w-4 inline mr-1" />
                            Home Sample Collection
                          </label>
                          <p className="text-xs text-gray-600">
                            Our technician will visit your location to collect samples (Additional charges may apply)
                          </p>
                        </div>
                      </div>
                    </div>

                    {formData.isHomeCollection && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address for Collection *
                        </label>
                        <textarea
                          name="address"
                          required={formData.isHomeCollection}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Please provide complete address with landmarks"
                          value={formData.address}
                          onChange={handleFormChange}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions
                      </label>
                      <textarea
                        name="notes"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Any special requirements or notes..."
                        value={formData.notes}
                        onChange={handleFormChange}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Book Tests - {formatCurrency(getTotalAmount())}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}