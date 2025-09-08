'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  TestTube, 
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface TestBooking {
  id: string
  patientId: string
  bookingDate: string
  preferredDate?: string
  preferredTime?: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  notes?: string
  address?: string
  isHomeCollection: boolean
  createdAt: string
  patient: {
    id: string
    name: string
    email: string
    phone: string
  }
  tests: {
    id: string
    test: {
      id: string
      name: string
      price: number
    }
    quantity: number
    price: number
  }[]
}

export default function AdminTestBookings() {
  const [bookings, setBookings] = useState<TestBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchTestBookings()
  }, [])

  const fetchTestBookings = async () => {
    try {
      const response = await fetch('/api/test-bookings')
      const result = await response.json()
      
      if (result.success) {
        setBookings(result.data)
      } else {
        toast.error('Failed to fetch test bookings')
      }
    } catch (error) {
      console.error('Error fetching test bookings:', error)
      toast.error('Failed to fetch test bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/test-bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Test booking status updated successfully')
        fetchTestBookings()
      } else {
        toast.error(result.error || 'Failed to update test booking status')
      }
    } catch (error) {
      console.error('Error updating test booking:', error)
      toast.error('Failed to update test booking status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tests.some(test => test.test.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Bookings Management</h1>
          <p className="text-gray-600">View and manage test bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search test bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Test Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{booking.patient.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <TestTube className="h-4 w-4" />
                    {booking.preferredDate ? formatDate(booking.preferredDate) : 'No preferred date'}
                    {booking.preferredTime && ` at ${booking.preferredTime}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1">{booking.status}</span>
                  </Badge>
                  <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                    {booking.paymentStatus}
                  </Badge>
                  {booking.isHomeCollection && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <MapPin className="h-3 w-3 mr-1" />
                      Home Collection
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{booking.patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{booking.patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Total Amount:</span>
                    <span>₹{booking.totalAmount}</span>
                  </div>
                  {booking.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-600">{booking.address}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Booked:</span>
                    <span>{formatDate(booking.createdAt)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Tests ({booking.tests.length}):</span>
                    <div className="mt-1 space-y-1">
                      {booking.tests.map((test, index) => (
                        <div key={index} className="text-gray-600">
                          {test.test.name} (Qty: {test.quantity}) - ₹{test.price}
                        </div>
                      ))}
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="text-sm">
                      <span className="font-medium">Notes:</span>
                      <p className="text-gray-600 mt-1">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                {booking.status === 'PENDING' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {booking.status === 'CONFIRMED' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(booking.id, 'IN_PROGRESS')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Start Processing
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {booking.status === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark Completed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No test bookings found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filter criteria' 
              : 'No test bookings have been made yet'
            }
          </p>
        </div>
      )}
    </div>
  )
}





