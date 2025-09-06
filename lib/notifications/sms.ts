/**
 * SMS notification utility using Twilio
 * Provides a centralized service for sending SMS messages
 */

import { Twilio } from 'twilio'
import { notificationConfig } from '@/lib/config'

export interface SmsData {
  to: string
  message: string
}

export interface SmsResult {
  success: boolean
  messageId?: string
  error?: string
}

class SmsService {
  private client: Twilio | null = null
  private isConfigured = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    if (!notificationConfig.sms.enabled) {
      console.log('📱 SMS notifications are disabled')
      return
    }

    const { accountSid, authToken, phoneNumber } = notificationConfig.sms.twilio

    if (!accountSid || !authToken || !phoneNumber) {
      console.warn('⚠️  SMS configuration incomplete - notifications will not be sent')
      return
    }

    this.client = new Twilio(accountSid, authToken)
    this.isConfigured = true
    console.log('📱 SMS service initialized')
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters except '+'
    const cleaned = phone.replace(/[^\d+]/g, '')
    
    // If it starts with '91' and is 12 digits, add '+'
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return '+' + cleaned
    }
    
    // If it doesn't start with '+' or country code, add '+91' for India
    if (!cleaned.startsWith('+') && cleaned.length === 10) {
      return '+91' + cleaned
    }
    
    // If it already starts with '+', return as-is
    if (cleaned.startsWith('+')) {
      return cleaned
    }
    
    return cleaned
  }

  async sendSms(smsData: SmsData): Promise<SmsResult> {
    if (notificationConfig.features.dryRun) {
      console.log('📱 [DRY RUN] SMS would be sent:', {
        to: smsData.to,
        message: smsData.message.substring(0, 50) + (smsData.message.length > 50 ? '...' : ''),
      })
      return { success: true, messageId: 'dry-run-sms-' + Date.now() }
    }

    if (!this.client || !this.isConfigured) {
      return { success: false, error: 'SMS service not configured' }
    }

    try {
      const formattedPhone = this.formatPhoneNumber(smsData.to)
      
      const message = await this.client.messages.create({
        body: smsData.message,
        from: notificationConfig.sms.twilio.phoneNumber,
        to: formattedPhone,
      })

      console.log('📱 SMS sent successfully:', message.sid)
      
      return {
        success: true,
        messageId: message.sid,
      }
    } catch (error) {
      console.error('Failed to send SMS:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async sendSmsWithRetry(smsData: SmsData, maxRetries?: number): Promise<SmsResult> {
    const retries = maxRetries || notificationConfig.features.retryAttempts
    let lastError: string = 'Unknown error'

    for (let attempt = 1; attempt <= retries; attempt++) {
      console.log(`📱 SMS attempt ${attempt}/${retries}`)
      
      const result = await this.sendSms(smsData)
      
      if (result.success) {
        return result
      }

      lastError = result.error || 'Unknown error'
      
      if (attempt < retries) {
        const delay = notificationConfig.features.retryDelay * attempt // Exponential backoff
        console.log(`📱 Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return { success: false, error: `Failed after ${retries} attempts: ${lastError}` }
  }

  // Template helper for creating SMS messages
  createMessage(template: string, variables: Record<string, string>): string {
    let message = template
    
    // Replace placeholders like {{name}} with actual values
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      message = message.replace(new RegExp(placeholder, 'g'), value)
    })
    
    return message
  }

  // Validate phone number
  isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/[^\d+]/g, '')
    // Basic validation for Indian numbers
    return cleaned.length >= 10 && cleaned.length <= 15
  }
}

// Export singleton instance
export const smsService = new SmsService()

// Convenience export for direct usage
export async function sendSms(smsData: SmsData): Promise<SmsResult> {
  return smsService.sendSmsWithRetry(smsData)
}
