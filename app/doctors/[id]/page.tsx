'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Doctor, ApiResponse } from '@/types'
import { formatCurrency, getDayName } from '@/lib/utils'
import { 
  Calendar, 
  Clock, 
  User, 
  GraduationCap,
  Award,
  ArrowLeft,
  Star,
  Shield,
  Phone,
  Mail
} from 'lucide-react'
import Link from 'next/link'

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.id as string

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (doctorId) {
      fetchDoctor()
    }
  }, [doctorId])

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

  const getAvailabilityText = (doctor: Doctor) => {
    if (!doctor.availabilities || doctor.availabilities.length === 0) {
      return 'Availability not set'
    }
    
    const days = doctor.availabilities.map(av => getDayName(av.dayOfWeek)).join(', ')
    const timeRange = `${doctor.availabilities[0]?.startTime} - ${doctor.availabilities[0]?.endTime}`
    return `${days}, ${timeRange}`
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
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Doctor not found</h1>
            <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/doctors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Doctors
            </Link>
          </Button>
        </div>

        {/* Doctor Profile Card */}
        <Card className="overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Doctor Avatar */}
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
              
              {/* Doctor Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{doctor.name}</h1>
                <p className="text-xl text-indigo-100 mb-4">{doctor.specialization}</p>
                <div className="flex items-center gap-4 text-indigo-100">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>{doctor.qualification}</span>
                  </div>
                  {doctor.experience && (
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Fee */}
              <div className="text-right">
                <div className="text-3xl font-bold">{formatCurrency(doctor.consultationFee)}</div>
                <div className="text-indigo-100">Consultation Fee</div>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Doctor Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-indigo-600" />
                    About Dr. {doctor.name.split(' ')[1] || doctor.name}
                  </h3>
                  {doctor.bio ? (
                    <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">No bio available for this doctor.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                    Availability
                  </h3>
                  <p className="text-gray-600">{getAvailabilityText(doctor)}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
                    Qualifications
                  </h3>
                  <p className="text-gray-600">{doctor.qualification}</p>
                </div>
              </div>

              {/* Right Column - Booking Section */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-600" />
                    Book an Appointment
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Schedule your consultation with Dr. {doctor.name.split(' ')[1] || doctor.name}
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Consultation Fee:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(doctor.consultationFee)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Duration:</span>
                      <span className="text-gray-600">30 minutes</span>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full mt-6 bg-green-600 hover:bg-green-700">
                    <Link href={`/doctors/${doctor.id}/book`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Link>
                  </Button>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-indigo-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>For urgent appointments, please call our main office.</p>
                    <p>Office Hours: Monday - Saturday, 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
