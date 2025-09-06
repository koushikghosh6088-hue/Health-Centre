'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  User,
  Phone,
  Mail,
  Calendar,
  TestTube,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  role: string
  createdAt: string
  appointments: {
    id: string
    appointmentDate: string
    status: string
    totalAmount: number
  }[]
  testBookings: {
    id: string
    bookingDate: string
    status: string
    totalAmount: number
  }[]
}

export default function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      const result = await response.json()
      
      if (result.success) {
        setPatients(result.patients)
      } else {
        toast.error('Failed to fetch patients')
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Patients Management</h1>
          <p className="text-gray-600">View and manage patient information</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Patients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">{patient.name}</CardTitle>
              </div>
              <CardDescription>
                Patient since {formatDate(patient.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{patient.phone}</span>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Appointments: {patient.appointments.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TestTube className="h-4 w-4" />
                    <span className="font-medium">Test Bookings: {patient.testBookings.length}</span>
                  </div>
                </div>

                {patient.appointments.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">Recent Appointments:</p>
                    <div className="space-y-1">
                      {patient.appointments.slice(0, 2).map((appointment) => (
                        <div key={appointment.id} className="text-xs text-gray-600">
                          {formatDate(appointment.appointmentDate)} - {appointment.status} - ₹{appointment.totalAmount}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {patient.testBookings.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">Recent Test Bookings:</p>
                    <div className="space-y-1">
                      {patient.testBookings.slice(0, 2).map((booking) => (
                        <div key={booking.id} className="text-xs text-gray-600">
                          {formatDate(booking.bookingDate)} - {booking.status} - ₹{booking.totalAmount}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'No patients have registered yet'
            }
          </p>
        </div>
      )}
    </div>
  )
}


