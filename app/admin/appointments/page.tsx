'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Appointment {
  id: string
  appointmentDate: string
  timeSlot: string
  status: string
  totalAmount: number
  paymentStatus: string
  notes?: string
  doctor: {
    id: string
    name: string
    specialization: string
  }
  patient: {
    id: string
    name: string
    email: string
    phone: string
  }
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/appointments')
      const result = await response.json()
      
      if (result.success) {
        setAppointments(result.data || [])
      } else {
        toast.error('Failed to fetch appointments')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.status.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
          <p className="text-gray-600">View and manage patient appointments</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No appointments found
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-lg font-semibold flex items-center">
                        <User className="mr-2 h-5 w-5 text-gray-500" />
                        {appointment.patient.name}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-500">
                        <p className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          {appointment.patient.email}
                        </p>
                        <p className="flex items-center">
                          <Phone className="mr-2 h-4 w-4" />
                          {appointment.patient.phone}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center justify-end">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {formatDate(new Date(appointment.appointmentDate))}
                        </span>
                      </div>
                      <div className="flex items-center justify-end mt-1">
                        <Clock className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm">{appointment.timeSlot}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <p className="text-sm font-medium">Doctor</p>
                        <p className="text-sm text-gray-600">{appointment.doctor.name}</p>
                        <p className="text-xs text-gray-500">{appointment.doctor.specialization}</p>
                      </div>
                      
                      <div className="mt-3 md:mt-0 md:text-right">
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeClass(appointment.paymentStatus)}`}>
                            {appointment.paymentStatus}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium flex items-center md:justify-end">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(appointment.totalAmount)}
                        </p>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p className="font-medium">Notes:</p>
                        <p>{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}