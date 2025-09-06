'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Testimonial, ApiResponse, PaginatedResponse } from '@/types'
import { formatDate } from '@/lib/utils'
import { 
  Star, 
  Quote,
  MessageCircle,
  ThumbsUp,
  Users
} from 'lucide-react'

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]) // Initialize as empty array
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/testimonials?limit=20')
      const result: ApiResponse<PaginatedResponse<Testimonial>> = await response.json()

      if (result.success && result.data) {
        setTestimonials(result.data.data || []) // Fallback to empty array
      } else {
        setTestimonials([]) // Set empty array on failure
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      setTestimonials([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Patient Testimonials
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Real experiences from our valued patients who trust us with their healthcare needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Share Your Experience
            </Button>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2" />
              <span className="font-medium">Over 50,000+ Happy Patients</span>
            </div>
          </div>
        </div>

        {/* Testimonial Submission Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Share Your Experience</h3>
              <TestimonialForm onSubmit={() => setShowForm(false)} />
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Patient Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">4.8/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Happy Patients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">15+</div>
              <div className="text-gray-600">Years of Service</div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        {(!testimonials || testimonials.length === 0) ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials yet</h3>
            <p className="text-gray-500">
              Be the first to share your experience with our healthcare services.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                      <div className="flex items-center mt-1">
                        {renderStars(testimonial.rating)}
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDate(testimonial.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Quote className="h-6 w-6 text-blue-200" />
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-700 italic">
                    "{testimonial.message}"
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span>Verified Patient</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Experience Quality Healthcare?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied patients who trust us with their health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <a href="/doctors">Book Doctor Appointment</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
              <a href="/tests">Book Diagnostic Tests</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Testimonial Form Component
function TestimonialForm({ onSubmit }: { onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rating: 5,
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        alert('Thank you for your testimonial! It will be reviewed before publication.')
        setFormData({
          name: '',
          email: '',
          phone: '',
          rating: 5,
          message: ''
        })
        onSubmit()
      } else {
        alert('Error submitting testimonial. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error)
      alert('Error submitting testimonial. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rating *
        </label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= formData.rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {formData.rating} star{formData.rating !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Experience *
        </label>
        <textarea
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell us about your experience with our services..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? 'Submitting...' : 'Submit Testimonial'}
        </Button>
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
      </div>
    </form>
  )
}