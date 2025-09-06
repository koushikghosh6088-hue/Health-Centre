import nodemailer from 'nodemailer'
import { formatDate, formatCurrency } from './utils'

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

class NotificationService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private async initializeTransporter() {
    try {
      // Configure nodemailer transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      // Verify connection
      if (process.env.NODE_ENV !== 'production') {
        await this.transporter.verify()
        console.log('Email transporter initialized successfully')
      }
    } catch (error) {
      console.error('Failed to initialize email transporter:', error)
      // Create a mock transporter for development
      this.transporter = {
        sendMail: async (options: any) => {
          console.log('Mock Email Sent:', {
            to: options.to,
            subject: options.subject,
            text: options.text?.slice(0, 100) + '...',
          })
          return { messageId: 'mock-message-id' }
        }
      } as any
    }
  }

  async sendAppointmentConfirmation(data: AppointmentData): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized')
      return false
    }

    try {
      const appointmentDate = new Date(data.appointmentDate)
      const formattedDate = formatDate(appointmentDate)
      
      const subject = `Appointment Confirmation - ${data.doctorName}`
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Appointment Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Confirmed!</h1>
              <p>Your appointment has been successfully booked</p>
            </div>
            
            <div class="content">
              <p>Dear ${data.patientName},</p>
              
              <p>Thank you for booking an appointment with us. Your appointment has been confirmed with the following details:</p>
              
              <div class="appointment-details">
                <h3>Appointment Details</h3>
                <div class="detail-row">
                  <strong>Doctor:</strong>
                  <span>Dr. ${data.doctorName} (${data.doctorSpecialization})</span>
                </div>
                <div class="detail-row">
                  <strong>Date:</strong>
                  <span>${formattedDate}</span>
                </div>
                <div class="detail-row">
                  <strong>Time:</strong>
                  <span>${data.timeSlot}</span>
                </div>
                <div class="detail-row">
                  <strong>Consultation Fee:</strong>
                  <span>${formatCurrency(data.consultationFee)}</span>
                </div>
                <div class="detail-row">
                  <strong>Appointment ID:</strong>
                  <span>${data.appointmentId}</span>
                </div>
                ${data.notes ? `
                <div class="detail-row">
                  <strong>Notes:</strong>
                  <span>${data.notes}</span>
                </div>` : ''}
              </div>
              
              <h3>Important Information:</h3>
              <ul>
                <li>Please arrive 15 minutes before your appointment time</li>
                <li>Bring a valid ID and any previous medical reports</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                <li>Payment can be made at the time of consultation</li>
              </ul>
              
              <p>We look forward to seeing you on ${formattedDate}!</p>
            </div>
            
            <div class="footer">
              <p>Healthcare Diagnostic Centre</p>
              <p>Contact: +91 98765 43210 | Email: info@healthcarediagnostic.com</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `

      const textContent = `
        Appointment Confirmation
        
        Dear ${data.patientName},
        
        Your appointment has been confirmed with the following details:
        
        Doctor: Dr. ${data.doctorName} (${data.doctorSpecialization})
        Date: ${formattedDate}
        Time: ${data.timeSlot}
        Consultation Fee: ${formatCurrency(data.consultationFee)}
        Appointment ID: ${data.appointmentId}
        ${data.notes ? `Notes: ${data.notes}` : ''}
        
        Important Information:
        - Please arrive 15 minutes before your appointment time
        - Bring a valid ID and any previous medical reports
        - If you need to reschedule, please contact us at least 24 hours in advance
        - Payment can be made at the time of consultation
        
        We look forward to seeing you!
        
        Healthcare Diagnostic Centre
        Contact: +91 98765 43210
      `

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@healthcarediagnostic.com',
        to: data.patientEmail,
        subject,
        text: textContent,
        html: htmlContent,
      })

      console.log(`Appointment confirmation email sent to ${data.patientEmail}`)
      return true
    } catch (error) {
      console.error('Failed to send appointment confirmation email:', error)
      return false
    }
  }

  async sendTestBookingConfirmation(data: TestBookingData): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized')
      return false
    }

    try {
      const subject = `Test Booking Confirmation - ${data.tests.length} Test${data.tests.length > 1 ? 's' : ''}`
      
      const testsList = data.tests.map(test => `
        <li>${test.name} - ${formatCurrency(test.price)}</li>
      `).join('')

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .tests-list { background: #f0fdf4; padding: 15px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Test Booking Confirmed!</h1>
              <p>Your diagnostic tests have been successfully booked</p>
            </div>
            
            <div class="content">
              <p>Dear ${data.patientName},</p>
              
              <p>Thank you for booking diagnostic tests with us. Your booking has been confirmed with the following details:</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                <div class="detail-row">
                  <strong>Booking ID:</strong>
                  <span>${data.bookingId}</span>
                </div>
                ${data.preferredDate ? `
                <div class="detail-row">
                  <strong>Preferred Date:</strong>
                  <span>${formatDate(data.preferredDate)}</span>
                </div>` : ''}
                ${data.preferredTime ? `
                <div class="detail-row">
                  <strong>Preferred Time:</strong>
                  <span>${data.preferredTime}</span>
                </div>` : ''}
                <div class="detail-row">
                  <strong>Collection Type:</strong>
                  <span>${data.isHomeCollection ? 'Home Collection' : 'Lab Visit'}</span>
                </div>
                ${data.address ? `
                <div class="detail-row">
                  <strong>Address:</strong>
                  <span>${data.address}</span>
                </div>` : ''}
                
                <h4>Tests Booked:</h4>
                <div class="tests-list">
                  <ul>${testsList}</ul>
                  <div class="detail-row">
                    <strong>Total Amount:</strong>
                    <strong>${formatCurrency(data.totalAmount)}</strong>
                  </div>
                </div>
                
                ${data.notes ? `
                <div class="detail-row">
                  <strong>Notes:</strong>
                  <span>${data.notes}</span>
                </div>` : ''}
              </div>
              
              <h3>Next Steps:</h3>
              <ul>
                <li>Our team will contact you within 24 hours to confirm the schedule</li>
                ${data.isHomeCollection ? 
                  '<li>Our technician will visit your address at the scheduled time</li>' :
                  '<li>Please visit our lab at the scheduled time</li>'
                }
                <li>Ensure you follow any preparation instructions for your tests</li>
                <li>Keep this confirmation email for your records</li>
              </ul>
              
              <p>We'll process your tests and send you the results as soon as they're ready!</p>
            </div>
            
            <div class="footer">
              <p>Healthcare Diagnostic Centre</p>
              <p>Contact: +91 98765 43210 | Email: info@healthcarediagnostic.com</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@healthcarediagnostic.com',
        to: data.patientEmail,
        subject,
        html: htmlContent,
      })

      console.log(`Test booking confirmation email sent to ${data.patientEmail}`)
      return true
    } catch (error) {
      console.error('Failed to send test booking confirmation email:', error)
      return false
    }
  }

  async sendGenericEmail(to: string, subject: string, content: string): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized')
      return false
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@healthcarediagnostic.com',
        to,
        subject,
        text: content,
      })

      console.log(`Email sent to ${to}`)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService()
