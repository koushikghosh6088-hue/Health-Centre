'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Doctor, ApiResponse, PaginatedResponse } from '@/types'
import { formatCurrency, getDayName } from '@/lib/utils'
import { getDoctorAvatar } from '@/lib/constants'
import { 
  Calendar, 
  Clock, 
  Star, 
  MapPin, 
  Search, 
  Filter,
  User,
  GraduationCap,
  Award
} from 'lucide-react'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [specializations, setSpecializations] = useState<string[]>([])

  useEffect(() => {
    fetchDoctors()
  }, [searchTerm, selectedSpecialization])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedSpecialization) params.append('specialization', selectedSpecialization)
      params.append('limit', '20')

      const response = await fetch(`/api/doctors?${params.toString()}`)
      const result: ApiResponse<PaginatedResponse<Doctor>> = await response.json()

      if (result.success && result.data && result.data.data) {
        const doctorsData = result.data.data || []
        setDoctors(doctorsData)
        
        // Extract unique specializations
        const uniqueSpecs = Array.from(new Set(doctorsData.map(d => d.specialization)))
        setSpecializations(uniqueSpecs)
      } else {
        setDoctors([])
        setSpecializations([])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setDoctors([])
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4 w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-1/2 mx-auto"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="pt-20 pb-12 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 font-medium text-sm mb-6">
            <User className="h-4 w-4 mr-2" />
            Expert Medical Professionals
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Meet Our <span className="text-gradient">Expert</span> Doctors
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Connect with our world-class medical professionals. Each doctor brings years of experience 
            and specialization to provide you with the highest quality of care.
          </p>
        </div>

        {/* Modern Filters */}
        <div className="modern-card p-8 mb-12 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-indigo-600" />
            Find Your Perfect Doctor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                className="modern-input w-full pl-12 pr-4 py-4 text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="modern-select w-full pl-12 pr-4 py-4 text-gray-700"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modern Doctors Grid */}
        {(!doctors || doctors.length === 0) ? (
          <div className="text-center py-20">
            <div className="modern-card p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-6 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No doctors found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters to find the perfect doctor for you.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {doctors.map((doctor, index) => {
              const specializationColors = {
                'Cardiologist': 'from-red-500 to-pink-600',
                'General Medicine': 'from-blue-500 to-indigo-600', 
                'Gynecologist': 'from-purple-500 to-pink-600',
                'Endocrinologist': 'from-green-500 to-emerald-600',
                'Dermatologist': 'from-orange-500 to-yellow-600'
              }
              
              const bgGradient = specializationColors[doctor.specialization as keyof typeof specializationColors] || 'from-gray-500 to-gray-600'
              
              return (
                <div key={doctor.id} className="modern-card p-8 group animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  {/* Doctor Avatar & Header */}
                  <div className="relative mb-6">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image
                        src={getDoctorAvatar(index)}
                        alt={doctor.name}
                        width={96}
                        height={96}
                        className="rounded-full object-cover shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 ring-2 ring-white"
                      />
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">
                        {doctor.name}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100">
                        {doctor.specialization}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-3 text-indigo-500" />
                      <span className="text-sm">{doctor.qualification}</span>
                    </div>
                    
                    {doctor.experience && (
                      <div className="flex items-center text-gray-600">
                        <Award className="h-4 w-4 mr-3 text-green-500" />
                        <span className="text-sm">{doctor.experience} years of experience</span>
                      </div>
                    )}
                    
                    <div className="flex items-start text-gray-600">
                      <Clock className="h-4 w-4 mr-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{getAvailabilityText(doctor)}</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-bold text-green-700">
                          Consultation: {formatCurrency(doctor.consultationFee)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {doctor.bio && (
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-2">
                      {doctor.bio}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button asChild className="w-full btn-modern btn-gradient">
                      <Link href={`/doctors/${doctor.id}/book`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full group-hover:bg-indigo-50 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all duration-200">
                      <Link href={`/doctors/${doctor.id}`}>
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}