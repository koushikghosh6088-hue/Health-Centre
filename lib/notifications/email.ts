/**
 * Email notification utility using Nodemailer
 * Provides a centralized service for sending emails with templates
 */

import nodemailer from 'nodemailer'
import { notificationConfig } from '@/lib/config'

export interface EmailRecipient {
  email: string
  name?: string
}

export interface EmailData {
  to: EmailRecipient | EmailRecipient[]
  subject: string
  html: string
  text?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private isConfigured = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    if (!notificationConfig.email.enabled) {
      console.log('📧 Email notifications are disabled')
      return
    }

    if (!notificationConfig.email.smtp.user || !notificationConfig.email.smtp.password) {
      console.warn('⚠️  Email configuration incomplete - notifications will not be sent')
      return
    }

    this.transporter = nodemailer.createTransporter({
      host: notificationConfig.email.smtp.host,
      port: notificationConfig.email.smtp.port,
      secure: notificationConfig.email.smtp.port === 465,
      auth: {
        user: notificationConfig.email.smtp.user,
        pass: notificationConfig.email.smtp.password,
      },
    })

    this.isConfigured = true
    console.log('📧 Email service initialized')
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter || !this.isConfigured) {
      return false
    }

    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('Email connection verification failed:', error)
      return false
    }
  }

  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    if (notificationConfig.features.dryRun) {
      console.log('📧 [DRY RUN] Email would be sent:', {
        to: emailData.to,
        subject: emailData.subject,
        preview: emailData.html.substring(0, 100) + '...',
      })
      return { success: true, messageId: 'dry-run-' + Date.now() }
    }

    if (!this.transporter || !this.isConfigured) {
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to]
      const toAddresses = recipients.map(r => r.name ? `"${r.name}" <${r.email}>` : r.email).join(', ')

      const mailOptions = {
        from: `"${notificationConfig.app.name}" <${notificationConfig.email.from}>`,
        to: toAddresses,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('📧 Email sent successfully:', info.messageId)
      
      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async sendEmailWithRetry(emailData: EmailData, maxRetries?: number): Promise<EmailResult> {
    const retries = maxRetries || notificationConfig.features.retryAttempts
    let lastError: string = 'Unknown error'

    for (let attempt = 1; attempt <= retries; attempt++) {
      console.log(`📧 Email attempt ${attempt}/${retries}`)
      
      const result = await this.sendEmail(emailData)
      
      if (result.success) {
        return result
      }

      lastError = result.error || 'Unknown error'
      
      if (attempt < retries) {
        const delay = notificationConfig.features.retryDelay * attempt // Exponential backoff
        console.log(`📧 Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return { success: false, error: `Failed after ${retries} attempts: ${lastError}` }
  }

  // Template helpers
  createBaseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${notificationConfig.app.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #3b82f6;
            margin: 0;
            font-size: 24px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 16px 0;
        }
        .button:hover {
            background-color: #2563eb;
        }
        .alert {
            padding: 12px;
            border-radius: 6px;
            margin: 16px 0;
        }
        .alert-info {
            background-color: #dbeafe;
            border: 1px solid #3b82f6;
            color: #1e40af;
        }
        .alert-success {
            background-color: #dcfce7;
            border: 1px solid #16a34a;
            color: #14532d;
        }
        .alert-warning {
            background-color: #fef3c7;
            border: 1px solid #d97706;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${notificationConfig.app.name}</h1>
        </div>
        ${content}
        <div class="footer">
            <p>
                This email was sent by ${notificationConfig.app.name}<br>
                If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
    `
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Convenience export for direct usage
export async function sendEmail(emailData: EmailData): Promise<EmailResult> {
  return emailService.sendEmailWithRetry(emailData)
}
