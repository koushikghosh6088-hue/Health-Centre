'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Calendar, 
  TestTube, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Plus
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface DashboardStats {
  totalAppointments: number
  totalTestBookings: number
  totalRevenue: number
  totalPatients: number
  todayAppointments: number
  todayTestBookings: number
  pendingAppointments: number
  pendingTestBookings: number
}

interface RecentActivity {
  id: string
  type: 'appointment' | 'test_booking'
  patientName: string
  description: string
  amount: number
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    totalTestBookings: 0,
    totalRevenue: 0,
    totalPatients: 0,
    todayAppointments: 0,
    todayTestBookings: 0,
    pendingAppointments: 0,
    pendingTestBookings: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [addingDemoData, setAddingDemoData] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch appointments
      const appointmentsRes = await fetch('/api/appointments?limit=1000')
      const appointmentsData = await appointmentsRes.json()
      
      // Fetch test bookings
      const testBookingsRes = await fetch('/api/test-bookings?limit=1000')
      const testBookingsData = await testBookingsRes.json()

      if (appointmentsData.success && testBookingsData.success) {
        const appointments = appointmentsData.data.data || []
        const testBookings = testBookingsData.data.data || []
        
        // Calculate stats
        const today = new Date().toDateString()
        
        const todayAppointments = appointments.filter((apt: any) => 
          new Date(apt.appointmentDate).toDateString() === today
        ).length
        
        const todayTestBookings = testBookings.filter((booking: any) => 
          booking.preferredDate && new Date(booking.preferredDate).toDateString() === today
        ).length
        
        const totalRevenue = 
          appointments.reduce((sum: number, apt: any) => sum + apt.totalAmount, 0) +
          testBookings.reduce((sum: number, booking: any) => sum + booking.totalAmount, 0)
        
        const uniquePatientIds = new Set([
          ...appointments.map((apt: any) => apt.patientId),
          ...testBookings.map((booking: any) => booking.patientId)
        ])

        setStats({
          totalAppointments: appointments.length,
          totalTestBookings: testBookings.length,
          totalRevenue,
          totalPatients: uniquePatientIds.size,
          todayAppointments,
          todayTestBookings,
          pendingAppointments: appointments.filter((apt: any) => apt.status === 'PENDING').length,
          pendingTestBookings: testBookings.filter((booking: any) => booking.status === 'PENDING').length,
        })

        // Recent activity
        const recentAppointments: RecentActivity[] = appointments.slice(0, 5).map((apt: any) => ({
          id: apt.id,
          type: 'appointment' as const,
          patientName: apt.patient?.name || 'Unknown',
          description: `Appointment with ${apt.doctor?.name} (${apt.doctor?.specialization})`,
          amount: apt.totalAmount,
          status: apt.status,
          createdAt: apt.createdAt,
        }))

        const recentTestBookings: RecentActivity[] = testBookings.slice(0, 5).map((booking: any) => ({
          id: booking.id,
          type: 'test_booking' as const,
          patientName: booking.patient?.name || 'Unknown',
          description: `${booking.tests?.length || 0} diagnostic test${booking.tests?.length !== 1 ? 's' : ''}`,
          amount: booking.totalAmount,
          status: booking.status,
          createdAt: booking.createdAt,
        }))

        const allActivity = [...recentAppointments, ...recentTestBookings]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)

        setRecentActivity(allActivity)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addDemoData = async () => {
    try {
      setAddingDemoData(true)
      const response = await fetch('/api/admin/demo-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Demo data added successfully!')
        // Refresh dashboard data
        fetchDashboardData()
      } else {
        toast.error(result.error || 'Failed to add demo data')
      }
    } catch (error) {
      console.error('Error adding demo data:', error)
      toast.error('Failed to add demo data')
    } finally {
      setAddingDemoData(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to your healthcare management dashboard</p>
          </div>
          <Button 
            onClick={addDemoData} 
            disabled={addingDemoData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {addingDemoData ? 'Adding...' : 'Add Demo Data'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From appointments & tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Unique patients served
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayAppointments} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Bookings</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTestBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayTestBookings} today
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest bookings and appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'appointment' ? (
                        <Calendar className="h-5 w-5 text-blue-500" />
                      ) : (
                        <TestTube className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.patientName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(activity.amount)}
                        </span>
                        {getStatusIcon(activity.status)}
                        <span className="text-xs text-gray-400">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">Pending Appointments</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">
                  {stats.pendingAppointments}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TestTube className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Pending Test Bookings</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {stats.pendingTestBookings}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Today's Appointments</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {stats.todayAppointments}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Today's Tests</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {stats.todayTestBookings}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
