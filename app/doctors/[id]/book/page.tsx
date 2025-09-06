'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Doctor, ApiResponse, DayAvailability, TimeSlot } from '@/types'
import { formatCurrency, formatDate, getDayName, generateTimeSlots, addDays, isWeekend } from '@/lib/utils'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function BookAppointmentPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.id as string

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [availableDates, setAvailableDates] = useState<DayAvailability[]>([])
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  useEffect(() => {
    if (doctorId) {
      fetchDoctor()
    }
  }, [doctorId])

  useEffect(() => {
    if (doctor) {
      generateAvailableDates()
    }
  }, [doctor])

  const fetchDoctor = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/doctors/${doctorId}`)
      const result: ApiResponse<Doctor> = await response.json()

      if (result.success && result.data) {
        setDoctor(result.data)
      } else {
        // Redirect to doctors page if doctor not found
        router.push('/doctors')
      }
    } catch (error) {
      console.error('Error fetching doctor:', error)
      router.push('/doctors')
    } finally {
      setLoading(false)
    }
  }

  const generateAvailableDates = () => {
    if (!doctor?.availabilities) return

    const dates: DayAvailability[] = []
    const today = new Date()
    
    // Generate next 14 days
    for (let i = 1; i <= 14; i++) {
      const date = addDays(today, i)
      const dayOfWeek = date.getDay()
      
      // Skip weekends if doctor not available
      const availability = doctor.availabilities.find(av => av.dayOfWeek === dayOfWeek && av.isActive)
      if (!availability) continue

      const dateStr = date.toISOString().split('T')[0]
      const timeSlots = generateTimeSlots(availability.startTime, availability.endTime, 30)
        .map(slot => ({
          time: slot,
          isAvailable: true,
          isBooked: false // In real app, check against existing bookings
        }))

      dates.push({
        date: dateStr,
        dayOfWeek,
        timeSlots
      })
    }

    setAvailableDates(dates)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTimeSlot('') // Reset time slot selection
  }

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTimeSlot || !doctor) return

    setSubmitting(true)

    try {
      const appointmentData = {
        doctorId: doctor.id,
        appointmentDate: selectedDate,
        timeSlot: selectedTimeSlot,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        notes: formData.notes,
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Appointment booked successfully!')
        setBookingComplete(true)
      } else {
        toast.error(result.error || 'Error booking appointment. Please try again.')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error('Error booking appointment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getSelectedDateSlots = (): TimeSlot[] => {
    const selectedDateData = availableDates.find(d => d.date === selectedDate)
    return selectedDateData?.timeSlots || []
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Doctor Not Found</h1>
            <p className="text-gray-600 mb-6">
              The doctor you're looking for could not be found.
            </p>
            <Button asChild>
              <Link href="/doctors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Doctors
              </Link>
            </Button>
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
              Appointment Booked Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Your appointment with Dr. {doctor.name} has been confirmed for{' '}
              {formatDate(selectedDate)} at {selectedTimeSlot}.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">Appointment Details:</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Doctor:</strong> {doctor.name}</p>
                <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
                <p><strong>Time:</strong> {selectedTimeSlot}</p>
                <p><strong>Fee:</strong> {formatCurrency(doctor.consultationFee)}</p>
                <p><strong>Patient:</strong> {formData.patientName}</p>
              </div>
            </div>
            <div className="flex space-x-4 justify-center">
              <Button asChild>
                <Link href="/doctors">Book Another Appointment</Link>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Button variant="outline" asChild className="mb-6 rounded-full">
            <Link href="/doctors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Doctors
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Book Appointment</h1>
          <p className="text-lg md:text-xl text-gray-600">Schedule your consultation with our expert doctor</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Information */}
          <Card className="lg:col-span-1 modern-card">
            <CardHeader>
              <CardTitle>Doctor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-3">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-blue-600">{doctor.specialization}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Qualification:</strong> {doctor.qualification}</p>
                  {doctor.experience && (
                    <p><strong>Experience:</strong> {doctor.experience} years</p>
                  )}
                  <p><strong>Consultation Fee:</strong> {formatCurrency(doctor.consultationFee)}</p>
                </div>

                {doctor.bio && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">{doctor.bio}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card className="lg:col-span-2 modern-card">
            <CardHeader>
              <CardTitle>Schedule Your Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Select Date
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableDates.map((dateData) => (
                      <button
                        key={dateData.date}
                        type="button"
                        className={`p-3 text-sm rounded-xl border transition-all shadow-sm hover:shadow ${
                          selectedDate === dateData.date
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent scale-[1.02]'
                            : 'bg-white/80 hover:bg-white border-gray-200 backdrop-blur'
                        }`}
                        onClick={() => handleDateSelect(dateData.date)}
                      >
                        <div className="font-medium">
                          {getDayName(dateData.dayOfWeek)}
                        </div>
                        <div className="text-xs">
                          {formatDate(dateData.date).split(' ').slice(0, 2).join(' ')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot Selection */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Select Time Slot
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {getSelectedDateSlots().map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.isAvailable || slot.isBooked}
                          className={`p-2.5 text-sm rounded-xl border transition-all shadow-sm hover:shadow ${
                            selectedTimeSlot === slot.time
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent scale-[1.02]'
                              : slot.isAvailable && !slot.isBooked
                                ? 'bg-white/80 hover:bg-white border-gray-200 backdrop-blur'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }`}
                          onClick={() => handleTimeSlotSelect(slot.time)}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patient Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      required
                      className="modern-input w-full px-4 py-3 text-gray-700 placeholder-gray-400"
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
                      className="modern-input w-full px-4 py-3 text-gray-700 placeholder-gray-400"
                      value={formData.patientEmail}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="patientPhone"
                    required
                    className="modern-input w-full px-4 py-3 text-gray-700 placeholder-gray-400"
                    value={formData.patientPhone}
                    onChange={handleFormChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="modern-input w-full px-4 py-3 text-gray-700 placeholder-gray-400"
                    placeholder="Any specific concerns or symptoms you'd like to discuss..."
                    value={formData.notes}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Summary */}
                {selectedDate && selectedTimeSlot && (
                  <div className="border-gradient rounded-2xl p-5 bg-white/80 backdrop-blur">
                    <h3 className="font-semibold text-gray-900 mb-2">Appointment Summary:</h3>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><strong>Doctor:</strong> {doctor.name}</p>
                      <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
                      <p><strong>Time:</strong> {selectedTimeSlot}</p>
                      <p><strong>Consultation Fee:</strong> {formatCurrency(doctor.consultationFee)}</p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!selectedDate || !selectedTimeSlot || submitting}
                  className="w-full btn-modern btn-gradient rounded-full py-6"
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
                      Book Appointment - {formatCurrency(doctor.consultationFee)}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
