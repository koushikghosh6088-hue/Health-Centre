/**
 * Main notification service
 * Coordinates email and SMS notifications for various events
 */

import { sendEmail, EmailRecipient } from './email'
import { sendSms } from './sms'
import { EmailTemplates, SmsTemplates, AdminTemplates } from './templates'
import type { AppointmentData, TestBookingData, PaymentData } from './templates'
import { notificationConfig } from '@/lib/config'

// Admin email addresses (can be moved to env variables)
const ADMIN_EMAILS: EmailRecipient[] = [
  { email: 'admin@diagnosticcentre.com', name: 'Admin' }
]

interface NotificationResult {
  email?: { success: boolean; error?: string }
  sms?: { success: boolean; error?: string }
  admin?: { success: boolean; error?: string }
}

export class NotificationService {
  // Appointment booking confirmation
  async sendAppointmentConfirmation(data: AppointmentData): Promise<NotificationResult> {
    const results: NotificationResult = {}

    try {
      // Send email to patient
      if (notificationConfig.email.enabled) {
        const emailTemplate = EmailTemplates.appointmentConfirmation(data)
        const emailResult = await sendEmail({
          to: { email: data.patientEmail, name: data.patientName },
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        })
        results.email = emailResult
      }

      // Send SMS to patient
      if (notificationConfig.sms.enabled && data.patientPhone) {
        const smsMessage = SmsTemplates.appointmentConfirmation(data)
        const smsResult = await sendSms({
          to: data.patientPhone,
          message: smsMessage,
        })
        results.sms = smsResult
      }

      // Send admin alert
      if (notificationConfig.email.enabled && ADMIN_EMAILS.length > 0) {
        const adminTemplate = AdminTemplates.newBookingAlert('appointment', data.patientName, data.appointmentId)
        const adminResult = await sendEmail({
          to: ADMIN_EMAILS,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
        })
        results.admin = adminResult
      }

      console.log('✅ Appointment confirmation notifications sent:', data.appointmentId)
    } catch (error) {
      console.error('❌ Error sending appointment confirmation:', error)
    }

    return results
  }

  // Test booking confirmation
  async sendTestBookingConfirmation(data: TestBookingData): Promise<NotificationResult> {
    const results: NotificationResult = {}

    try {
      // Send email to patient
      if (notificationConfig.email.enabled) {
        const emailTemplate = EmailTemplates.testBookingConfirmation(data)
        const emailResult = await sendEmail({
          to: { email: data.patientEmail, name: data.patientName },
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        })
        results.email = emailResult
      }

      // Send SMS to patient
      if (notificationConfig.sms.enabled && data.patientPhone) {
        const smsMessage = SmsTemplates.testBookingConfirmation(data)
        const smsResult = await sendSms({
          to: data.patientPhone,
          message: smsMessage,
        })
        results.sms = smsResult
      }

      // Send admin alert
      if (notificationConfig.email.enabled && ADMIN_EMAILS.length > 0) {
        const adminTemplate = AdminTemplates.newBookingAlert('test-booking', data.patientName, data.bookingId)
        const adminResult = await sendEmail({
          to: ADMIN_EMAILS,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
        })
        results.admin = adminResult
      }

      console.log('✅ Test booking confirmation notifications sent:', data.bookingId)
    } catch (error) {
      console.error('❌ Error sending test booking confirmation:', error)
    }

    return results
  }

  // Payment success notification
  async sendPaymentConfirmation(data: PaymentData, patientEmail: string, patientPhone?: string): Promise<NotificationResult> {
    const results: NotificationResult = {}

    try {
      // Send email to patient
      if (notificationConfig.email.enabled) {
        const emailTemplate = EmailTemplates.paymentSuccess(data)
        const emailResult = await sendEmail({
          to: { email: patientEmail, name: data.patientName },
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        })
        results.email = emailResult
      }

      // Send SMS to patient
      if (notificationConfig.sms.enabled && patientPhone) {
        const smsMessage = SmsTemplates.paymentSuccess(data)
        const smsResult = await sendSms({
          to: patientPhone,
          message: smsMessage,
        })
        results.sms = smsResult
      }

      console.log('✅ Payment confirmation notifications sent:', data.paymentId)
    } catch (error) {
      console.error('❌ Error sending payment confirmation:', error)
    }

    return results
  }

  // Appointment reminder
  async sendAppointmentReminder(data: AppointmentData, hoursUntil: number): Promise<NotificationResult> {
    const results: NotificationResult = {}

    try {
      // Send email reminder
      if (notificationConfig.email.enabled) {
        const emailTemplate = EmailTemplates.appointmentReminder(data, hoursUntil)
        const emailResult = await sendEmail({
          to: { email: data.patientEmail, name: data.patientName },
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        })
        results.email = emailResult
      }

      // Send SMS reminder
      if (notificationConfig.sms.enabled && data.patientPhone) {
        const smsMessage = SmsTemplates.appointmentReminder(data, hoursUntil)
        const smsResult = await sendSms({
          to: data.patientPhone,
          message: smsMessage,
        })
        results.sms = smsResult
      }

      console.log('✅ Appointment reminder notifications sent:', data.appointmentId)
    } catch (error) {
      console.error('❌ Error sending appointment reminder:', error)
    }

    return results
  }

  // Test send for admin purposes
  async sendTestNotification(type: 'email' | 'sms', recipient: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (type === 'email') {
        const result = await sendEmail({
          to: { email: recipient, name: 'Test User' },
          subject: `Test Email from ${notificationConfig.app.name}`,
          html: `
            <h2>Test Email</h2>
            <p>This is a test email to verify the notification system is working correctly.</p>
            <p>Sent at: ${new Date().toLocaleString()}</p>
          `,
          text: `Test Email\n\nThis is a test email to verify the notification system is working correctly.\n\nSent at: ${new Date().toLocaleString()}`,
        })
        return result
      } else {
        const result = await sendSms({
          to: recipient,
          message: `Test SMS from ${notificationConfig.app.name}. Sent at ${new Date().toLocaleString()}`,
        })
        return result
      }
    } catch (error) {
      console.error(`Error sending test ${type}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Convenience exports
export {
  EmailTemplates,
  SmsTemplates,
  AdminTemplates,
  type AppointmentData,
  type TestBookingData,
  type PaymentData,
}
