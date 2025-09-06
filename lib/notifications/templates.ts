/**
 * Notification templates for email and SMS
 * Contains all templates for various booking and payment scenarios
 */

import { emailService } from './email'
import { smsService } from './sms'
import { notificationConfig } from '@/lib/config'

// Type definitions for template data
export interface AppointmentData {
  appointmentId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  doctorName: string
  doctorSpecialization: string
  appointmentDate: string
  timeSlot: string
  consultationFee: number
  notes?: string
  status: string
}

export interface TestBookingData {
  bookingId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  tests: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  preferredDate?: string
  preferredTime?: string
  isHomeCollection: boolean
  address?: string
  notes?: string
  status: string
}

export interface PaymentData {
  bookingId: string
  patientName: string
  amount: number
  paymentId: string
  paymentStatus: string
  bookingType: 'appointment' | 'test-booking'
}

// Email Templates
export class EmailTemplates {
  // Appointment booking confirmation
  static appointmentConfirmation(data: AppointmentData): { subject: string; html: string; text: string } {
    const subject = `Appointment Confirmed - Dr. ${data.doctorName}`
    
    const content = `
      <h2>Your Appointment is Confirmed! 🎉</h2>
      
      <div class="alert alert-success">
        <strong>Appointment Details:</strong>
      </div>
      
      <table style="width: 100%; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Doctor:</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            Dr. ${data.doctorName} (${data.doctorSpecialization})
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Date & Time:</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            ${new Date(data.appointmentDate).toLocaleDateString()} at ${data.timeSlot}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Consultation Fee:</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            ₹${data.consultationFee}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Appointment ID:</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            ${data.appointmentId}
          </td>
        </tr>
      </table>

      ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
      
      <div class="alert alert-info">
        <strong>Important:</strong> Please arrive 15 minutes before your appointment time.
      </div>
      
      <a href="${notificationConfig.app.url}/appointments/${data.appointmentId}" class="button">
        View Appointment Details
      </a>
      
      <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
    `

    const text = `
Your Appointment is Confirmed!

Doctor: Dr. ${data.doctorName} (${data.doctorSpecialization})
Date & Time: ${new Date(data.appointmentDate).toLocaleDateString()} at ${data.timeSlot}
Consultation Fee: ₹${data.consultationFee}
Appointment ID: ${data.appointmentId}

Please arrive 15 minutes before your appointment time.
If you need to reschedule or cancel, please contact us at least 24 hours in advance.

View details: ${notificationConfig.app.url}/appointments/${data.appointmentId}
    `

    return {
      subject,
      html: emailService.createBaseTemplate(content),
      text: text.trim(),
    }
  }

  // Test booking confirmation
  static testBookingConfirmation(data: TestBookingData): { subject: string; html: string; text: string } {
    const subject = `Test Booking Confirmed - Order #${data.bookingId.substring(0, 8)}`
    
    const testsHtml = data.tests.map(test => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${test.name}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">x${test.quantity}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">₹${test.price * test.quantity}</td>
      </tr>
    `).join('')

    const testsText = data.tests.map(test => `${test.name} x${test.quantity} - ₹${test.price * test.quantity}`).join('\n')
    
    const content = `
      <h2>Your Test Booking is Confirmed! 🧪</h2>
      
      <div class="alert alert-success">
        <strong>Booking Details:</strong>
      </div>
      
      <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      
      <h3>Tests Ordered:</h3>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px 8px; text-align: left;">Test</th>
            <th style="padding: 12px 8px; text-align: left;">Quantity</th>
            <th style="padding: 12px 8px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${testsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #f9fafb; font-weight: bold;">
            <td style="padding: 12px 8px;">Total</td>
            <td style="padding: 12px 8px;"></td>
            <td style="padding: 12px 8px; text-align: right;">₹${data.totalAmount}</td>
          </tr>
        </tfoot>
      </table>

      ${data.preferredDate ? `<p><strong>Preferred Date:</strong> ${new Date(data.preferredDate).toLocaleDateString()}</p>` : ''}
      ${data.preferredTime ? `<p><strong>Preferred Time:</strong> ${data.preferredTime}</p>` : ''}
      
      <div class="alert ${data.isHomeCollection ? 'alert-info' : 'alert-warning'}">
        <strong>${data.isHomeCollection ? '🏠 Home Collection' : '🏥 Lab Visit'}:</strong>
        ${data.isHomeCollection 
          ? `Our team will visit you at: ${data.address}` 
          : 'Please visit our lab for sample collection'
        }
      </div>
      
      <a href="${notificationConfig.app.url}/test-bookings/${data.bookingId}" class="button">
        View Booking Details
      </a>
    `

    const text = `
Your Test Booking is Confirmed!

Booking ID: ${data.bookingId}

Tests Ordered:
${testsText}

Total: ₹${data.totalAmount}

${data.preferredDate ? `Preferred Date: ${new Date(data.preferredDate).toLocaleDateString()}` : ''}
${data.preferredTime ? `Preferred Time: ${data.preferredTime}` : ''}

${data.isHomeCollection 
  ? `Home Collection Address: ${data.address}` 
  : 'Please visit our lab for sample collection'
}

View details: ${notificationConfig.app.url}/test-bookings/${data.bookingId}
    `

    return {
      subject,
      html: emailService.createBaseTemplate(content),
      text: text.trim(),
    }
  }

  // Payment success confirmation
  static paymentSuccess(data: PaymentData): { subject: string; html: string; text: string } {
    const subject = `Payment Confirmed - ₹${data.amount}`
    
    const content = `
      <h2>Payment Successful! 💳</h2>
      
      <div class="alert alert-success">
        <strong>Your payment has been processed successfully.</strong>
      </div>
      
      <table style="width: 100%; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Amount Paid:</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            ₹${data.amount}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Payment ID:</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            ${data.paymentId}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Booking Type:</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            ${data.bookingType === 'appointment' ? 'Doctor Appointment' : 'Test Booking'}
          </td>
        </tr>
      </table>
      
      <p>Your ${data.bookingType === 'appointment' ? 'appointment' : 'test booking'} is now confirmed and we'll contact you with further details.</p>
    `

    const text = `
Payment Successful!

Amount Paid: ₹${data.amount}
Payment ID: ${data.paymentId}
Booking Type: ${data.bookingType === 'appointment' ? 'Doctor Appointment' : 'Test Booking'}

Your ${data.bookingType === 'appointment' ? 'appointment' : 'test booking'} is now confirmed and we'll contact you with further details.
    `

    return {
      subject,
      html: emailService.createBaseTemplate(content),
      text: text.trim(),
    }
  }

  // Appointment reminder
  static appointmentReminder(data: AppointmentData, hoursUntil: number): { subject: string; html: string; text: string } {
    const subject = `Reminder: Appointment with Dr. ${data.doctorName} in ${hoursUntil} hours`
    
    const content = `
      <h2>Appointment Reminder ⏰</h2>
      
      <div class="alert alert-warning">
        <strong>Your appointment is in ${hoursUntil} hours!</strong>
      </div>
      
      <table style="width: 100%; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Doctor:</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            Dr. ${data.doctorName} (${data.doctorSpecialization})
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Date & Time:</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            ${new Date(data.appointmentDate).toLocaleDateString()} at ${data.timeSlot}
          </td>
        </tr>
      </table>
      
      <p>Please arrive 15 minutes before your scheduled time.</p>
    `

    const text = `
Appointment Reminder

Your appointment is in ${hoursUntil} hours!

Doctor: Dr. ${data.doctorName} (${data.doctorSpecialization})
Date & Time: ${new Date(data.appointmentDate).toLocaleDateString()} at ${data.timeSlot}

Please arrive 15 minutes before your scheduled time.
    `

    return {
      subject,
      html: emailService.createBaseTemplate(content),
      text: text.trim(),
    }
  }
}

// SMS Templates
export class SmsTemplates {
  static appointmentConfirmation(data: AppointmentData): string {
    return smsService.createMessage(
      'Appointment confirmed! Dr. {{doctorName}}, {{date}} at {{timeSlot}}. ID: {{appointmentId}}. Arrive 15 mins early.',
      {
        doctorName: data.doctorName,
        date: new Date(data.appointmentDate).toLocaleDateString(),
        timeSlot: data.timeSlot,
        appointmentId: data.appointmentId.substring(0, 8),
      }
    )
  }

  static testBookingConfirmation(data: TestBookingData): string {
    const testNames = data.tests.slice(0, 2).map(t => t.name).join(', ')
    const moreTests = data.tests.length > 2 ? ` +${data.tests.length - 2} more` : ''
    
    return smsService.createMessage(
      'Test booking confirmed! {{tests}}{{moreTests}}. Total: ₹{{amount}}. ID: {{bookingId}}. {{collectionType}}',
      {
        tests: testNames,
        moreTests,
        amount: data.totalAmount.toString(),
        bookingId: data.bookingId.substring(0, 8),
        collectionType: data.isHomeCollection ? 'Home collection arranged.' : 'Visit lab for collection.',
      }
    )
  }

  static paymentSuccess(data: PaymentData): string {
    return smsService.createMessage(
      'Payment successful! ₹{{amount}} paid for {{bookingType}}. Payment ID: {{paymentId}}. Your booking is confirmed.',
      {
        amount: data.amount.toString(),
        bookingType: data.bookingType === 'appointment' ? 'appointment' : 'test booking',
        paymentId: data.paymentId.substring(0, 12),
      }
    )
  }

  static appointmentReminder(data: AppointmentData, hoursUntil: number): string {
    return smsService.createMessage(
      'Reminder: Appointment with Dr. {{doctorName}} in {{hours}}h on {{date}} at {{timeSlot}}. Arrive 15 mins early.',
      {
        doctorName: data.doctorName,
        hours: hoursUntil.toString(),
        date: new Date(data.appointmentDate).toLocaleDateString(),
        timeSlot: data.timeSlot,
      }
    )
  }
}

// Admin notification templates
export class AdminTemplates {
  static newBookingAlert(type: 'appointment' | 'test-booking', patientName: string, bookingId: string): { subject: string; html: string } {
    const subject = `New ${type === 'appointment' ? 'Appointment' : 'Test Booking'} - ${patientName}`
    
    const content = `
      <h2>New ${type === 'appointment' ? 'Appointment' : 'Test Booking'} Alert 🔔</h2>
      
      <div class="alert alert-info">
        A new ${type === 'appointment' ? 'appointment' : 'test booking'} has been made.
      </div>
      
      <table style="width: 100%; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Patient:</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            ${patientName}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Booking ID:</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            ${bookingId}
          </td>
        </tr>
      </table>
      
      <a href="${notificationConfig.app.url}/admin/${type === 'appointment' ? 'appointments' : 'test-bookings'}" class="button">
        View in Admin Panel
      </a>
    `

    return {
      subject,
      html: emailService.createBaseTemplate(content),
    }
  }
}
