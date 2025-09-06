/**
 * API route for testing email and SMS notifications
 * For admin use to verify notification system is working
 */

import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notifications'
import { emailService } from '@/lib/notifications/email'
import { smsService } from '@/lib/notifications/sms'
import { notificationConfig, validateNotificationConfig } from '@/lib/config'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const testNotificationSchema = z.object({
  type: z.enum(['email', 'sms', 'both']),
  recipient: z.string(),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, recipient, phone } = testNotificationSchema.parse(body)

    const results: any = {}

    // Test email
    if (type === 'email' || type === 'both') {
      try {
        const emailResult = await notificationService.sendTestNotification('email', recipient)
        results.email = emailResult
      } catch (error) {
        results.email = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }

    // Test SMS
    if ((type === 'sms' || type === 'both') && phone) {
      try {
        const smsResult = await notificationService.sendTestNotification('sms', phone)
        results.sms = smsResult
      } catch (error) {
        results.sms = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test notifications processed',
      results,
    })

  } catch (error) {
    console.error('Error sending test notifications:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data provided', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send test notifications' },
      { status: 500 }
    )
  }
}

// GET endpoint to check notification system status
export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check configuration
    const configValidation = validateNotificationConfig()
    
    // Test email connection
    let emailStatus = { configured: false, connected: false, error: null }
    if (notificationConfig.email.enabled) {
      emailStatus.configured = true
      try {
        emailStatus.connected = await emailService.verifyConnection()
      } catch (error) {
        emailStatus.error = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // SMS status (basic check)
    let smsStatus = { 
      configured: notificationConfig.sms.enabled,
      ready: notificationConfig.sms.enabled && 
             notificationConfig.sms.twilio.accountSid && 
             notificationConfig.sms.twilio.authToken &&
             notificationConfig.sms.twilio.phoneNumber
    }

    return NextResponse.json({
      success: true,
      status: {
        configuration: {
          isValid: configValidation.isValid,
          errors: configValidation.errors,
        },
        features: {
          dryRun: notificationConfig.features.dryRun,
          retryAttempts: notificationConfig.features.retryAttempts,
          retryDelay: notificationConfig.features.retryDelay,
        },
        email: emailStatus,
        sms: smsStatus,
      },
    })

  } catch (error) {
    console.error('Error checking notification status:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to check notification status' },
      { status: 500 }
    )
  }
}
