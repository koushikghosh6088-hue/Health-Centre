'use client'

/**
 * Admin notifications management page
 * Provides interface for testing notifications and viewing status
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface NotificationStatus {
  configuration: {
    isValid: boolean
    errors: string[]
  }
  features: {
    dryRun: boolean
    retryAttempts: number
    retryDelay: number
  }
  email: {
    configured: boolean
    connected: boolean
    error: string | null
  }
  sms: {
    configured: boolean
    ready: boolean
  }
}

export default function AdminNotificationsPage() {
  const [status, setStatus] = useState<NotificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testLoading, setTestLoading] = useState(false)
  const [reminderLoading, setReminderLoading] = useState(false)
  
  // Test form state
  const [testType, setTestType] = useState<'email' | 'sms' | 'both'>('email')
  const [testEmail, setTestEmail] = useState('')
  const [testPhone, setTestPhone] = useState('')
  
  // Results
  const [testResults, setTestResults] = useState<any>(null)
  const [reminderResults, setReminderResults] = useState<any>(null)

  // Load notification status
  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications/test')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.status)
      }
    } catch (error) {
      console.error('Failed to load status:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestNotification = async () => {
    try {
      setTestLoading(true)
      setTestResults(null)
      
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: testType,
          recipient: testEmail,
          phone: testPhone,
        }),
      })
      
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      console.error('Failed to send test notification:', error)
      setTestResults({
        success: false,
        error: 'Failed to send test notification'
      })
    } finally {
      setTestLoading(false)
    }
  }

  const triggerReminders = async (hoursAhead: number = 24) => {
    try {
      setReminderLoading(true)
      setReminderResults(null)
      
      const response = await fetch('/api/notifications/reminders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-secure-cron-secret-key' // In production, use proper auth
        },
        body: JSON.stringify({ hoursAhead }),
      })
      
      const data = await response.json()
      setReminderResults(data)
    } catch (error) {
      console.error('Failed to trigger reminders:', error)
      setReminderResults({
        success: false,
        error: 'Failed to trigger reminders'
      })
    } finally {
      setReminderLoading(false)
    }
  }

  const StatusIndicator = ({ status, label }: { status: boolean | null; label: string }) => (
    <div className="flex items-center gap-2">
      {status === null ? (
        <AlertCircle className="h-4 w-4 text-yellow-500" />
      ) : status ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className="text-sm">{label}</span>
      <Badge variant={status === null ? 'secondary' : status ? 'default' : 'destructive'}>
        {status === null ? 'Unknown' : status ? 'OK' : 'Error'}
      </Badge>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Notification Management</h1>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <>
              {/* Configuration Status */}
              <div className="space-y-2">
                <h3 className="font-semibold">Configuration</h3>
                <StatusIndicator 
                  status={status.configuration.isValid} 
                  label="Configuration Valid" 
                />
                {status.configuration.errors.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {status.configuration.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h3 className="font-semibold">Features</h3>
                <div className="flex gap-4">
                  <Badge variant={status.features.dryRun ? 'secondary' : 'default'}>
                    {status.features.dryRun ? 'Dry Run Mode' : 'Live Mode'}
                  </Badge>
                  <Badge variant="outline">
                    {status.features.retryAttempts} Retries
                  </Badge>
                  <Badge variant="outline">
                    {status.features.retryDelay}ms Delay
                  </Badge>
                </div>
              </div>

              {/* Email Status */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Service
                </h3>
                <StatusIndicator 
                  status={status.email.configured} 
                  label="Email Configured" 
                />
                <StatusIndicator 
                  status={status.email.connected} 
                  label="SMTP Connection" 
                />
                {status.email.error && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{status.email.error}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* SMS Status */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS Service
                </h3>
                <StatusIndicator 
                  status={status.sms.configured} 
                  label="SMS Configured" 
                />
                <StatusIndicator 
                  status={status.sms.ready} 
                  label="SMS Ready" 
                />
              </div>
            </>
          )}

          <Button onClick={loadStatus} variant="outline" size="sm">
            Refresh Status
          </Button>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="email">Email Only</option>
                <option value="sms">SMS Only</option>
                <option value="both">Both Email & SMS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                disabled={testType === 'sms'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                disabled={testType === 'email'}
              />
            </div>
          </div>
          
          <Button
            onClick={sendTestNotification}
            disabled={testLoading || (!testEmail && testType !== 'sms') || (!testPhone && testType !== 'email')}
          >
            {testLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Test Notification
          </Button>

          {testResults && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Result:</strong> {testResults.success ? 'Success' : 'Failed'}</p>
                  {testResults.results?.email && (
                    <p><strong>Email:</strong> {testResults.results.email.success ? 'Sent' : `Failed - ${testResults.results.email.error}`}</p>
                  )}
                  {testResults.results?.sms && (
                    <p><strong>SMS:</strong> {testResults.results.sms.success ? 'Sent' : `Failed - ${testResults.results.sms.error}`}</p>
                  )}
                  {testResults.error && (
                    <p className="text-red-600"><strong>Error:</strong> {testResults.error}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Reminder System */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Manually trigger appointment reminders for testing purposes.
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={() => triggerReminders(24)}
              disabled={reminderLoading}
              variant="outline"
            >
              {reminderLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send 24h Reminders
            </Button>
            <Button
              onClick={() => triggerReminders(2)}
              disabled={reminderLoading}
              variant="outline"
            >
              {reminderLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send 2h Reminders
            </Button>
          </div>

          {reminderResults && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Result:</strong> {reminderResults.success ? 'Success' : 'Failed'}</p>
                  {reminderResults.summary && (
                    <div>
                      <p><strong>Summary:</strong></p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Total appointments: {reminderResults.summary.total}</li>
                        <li>Successful: {reminderResults.summary.successful}</li>
                        <li>Failed: {reminderResults.summary.failed}</li>
                      </ul>
                    </div>
                  )}
                  {reminderResults.error && (
                    <p className="text-red-600"><strong>Error:</strong> {reminderResults.error}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
