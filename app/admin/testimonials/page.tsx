'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Star,
  User,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface Testimonial {
  id: string
  name: string
  message: string
  rating: number
  isActive: boolean
  createdAt: string
  patient: {
    id: string
    name: string
    email: string
  }
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials')
      const result = await response.json()
      
      if (result.success) {
        setTestimonials(result.testimonials)
      } else {
        toast.error('Failed to fetch testimonials')
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast.error('Failed to fetch testimonials')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (testimonialId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Testimonial ${isActive ? 'approved' : 'rejected'} successfully`)
        fetchTestimonials()
      } else {
        toast.error(result.error || 'Failed to update testimonial status')
      }
    } catch (error) {
      console.error('Error updating testimonial:', error)
      toast.error('Failed to update testimonial status')
    }
  }

  const handleDelete = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Testimonial deleted successfully')
        fetchTestimonials()
      } else {
        toast.error(result.error || 'Failed to delete testimonial')
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      toast.error('Failed to delete testimonial')
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="h-4 w-4" />
      : <Clock className="h-4 w-4" />
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = 
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && testimonial.isActive) ||
      (statusFilter === 'PENDING' && !testimonial.isActive)
    
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
          <h1 className="text-2xl font-bold text-gray-900">Testimonials Management</h1>
          <p className="text-gray-600">Review and manage patient testimonials</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search testimonials..."
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
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {filteredTestimonials.map((testimonial) => (
          <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    {testimonial.patient.name} ({testimonial.patient.email})
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(testimonial.isActive)}>
                    {getStatusIcon(testimonial.isActive)}
                    <span className="ml-1">{testimonial.isActive ? 'Active' : 'Pending'}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex">
                    {renderStars(testimonial.rating)}
                  </div>
                  <span className="text-sm text-gray-600">({testimonial.rating}/5)</span>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Testimonial:</p>
                  <p className="text-gray-600 italic">"{testimonial.message}"</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Submitted on {formatDate(testimonial.createdAt)}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                {!testimonial.isActive && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(testimonial.id, true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
                {testimonial.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(testimonial.id, false)}
                    className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Unapprove
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(testimonial.id)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filter criteria' 
              : 'No testimonials have been submitted yet'
            }
          </p>
        </div>
      )}
    </div>
  )
}
