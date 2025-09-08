/**
 * Configuration loader for notification services
 * Provides typed access to environment variables with safe defaults
 */

export interface NotificationConfig {
  email: {
    enabled: boolean
    from: string
    smtp: {
      host: string
      port: number
      user: string
      password: string
    }
  }
  sms: {
    enabled: boolean
    provider: 'twilio'
    twilio: {
      accountSid: string
      authToken: string
      phoneNumber: string
    }
  }
  features: {
    dryRun: boolean
    retryAttempts: number
    retryDelay: number
  }
  app: {
    name: string
    url: string
  }
}

function getEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue
}

function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}

function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

export const notificationConfig: NotificationConfig = {
  email: {
    enabled: getBooleanEnv('NOTIFICATIONS_EMAIL_ENABLED', true),
    from: getEnvVar('EMAIL_FROM', 'noreply@diagnosticcentre.com'),
    smtp: {
      host: getEnvVar('SMTP_HOST', 'smtp.gmail.com'),
      port: getNumberEnv('SMTP_PORT', 587),
      user: getEnvVar('SMTP_USER'),
      password: getEnvVar('SMTP_PASS'),
    },
  },
  sms: {
    enabled: getBooleanEnv('NOTIFICATIONS_SMS_ENABLED', false), // Disabled by default
    provider: 'twilio',
    twilio: {
      accountSid: getEnvVar('TWILIO_ACCOUNT_SID'),
      authToken: getEnvVar('TWILIO_AUTH_TOKEN'),
      phoneNumber: getEnvVar('TWILIO_PHONE_NUMBER'),
    },
  },
  features: {
    dryRun: getBooleanEnv('NOTIFICATIONS_DRY_RUN', process.env.NODE_ENV === 'development'),
    retryAttempts: getNumberEnv('NOTIFICATIONS_RETRY_ATTEMPTS', 3),
    retryDelay: getNumberEnv('NOTIFICATIONS_RETRY_DELAY', 5000), // 5 seconds
  },
  app: {
    name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'HealthCare Diagnostic Centre'),
    url: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  },
}

// Validation helper
export function validateNotificationConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (notificationConfig.email.enabled) {
    if (!notificationConfig.email.smtp.user) {
      errors.push('SMTP_USER is required when email notifications are enabled')
    }
    if (!notificationConfig.email.smtp.password) {
      errors.push('SMTP_PASS is required when email notifications are enabled')
    }
  }

  if (notificationConfig.sms.enabled) {
    if (!notificationConfig.sms.twilio.accountSid) {
      errors.push('TWILIO_ACCOUNT_SID is required when SMS notifications are enabled')
    }
    if (!notificationConfig.sms.twilio.authToken) {
      errors.push('TWILIO_AUTH_TOKEN is required when SMS notifications are enabled')
    }
    if (!notificationConfig.sms.twilio.phoneNumber) {
      errors.push('TWILIO_PHONE_NUMBER is required when SMS notifications are enabled')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
