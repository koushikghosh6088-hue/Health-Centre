# Notification System Guide

This guide covers the notification system implemented in the HealthCare Diagnostic Centre application, including email/SMS notifications, appointment reminders, and cron job setup.

## Features

### ✅ Implemented Features
- Email notifications using Nodemailer (SMTP)
- SMS notifications using Twilio
- Booking confirmation notifications (appointments & test bookings)
- Payment confirmation notifications
- Appointment reminders (24h & 2h before)
- Admin notification alerts
- Dry-run mode for development
- Retry mechanism with exponential backoff
- Admin panel for testing and monitoring

### 📧 Email Templates
- Appointment booking confirmation
- Test booking confirmation
- Payment success confirmation
- Appointment reminders
- Admin booking alerts

### 📱 SMS Templates
- Appointment booking confirmation
- Test booking confirmation
- Payment success confirmation
- Appointment reminders

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Notification Configuration
NOTIFICATIONS_EMAIL_ENABLED=true
NOTIFICATIONS_SMS_ENABLED=false
NOTIFICATIONS_DRY_RUN=true
NOTIFICATIONS_RETRY_ATTEMPTS=3
NOTIFICATIONS_RETRY_DELAY=5000

# Email Configuration (SMTP)
EMAIL_FROM="noreply@diagnosticcentre.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# Cron/Scheduler Configuration
CRON_SECRET="your-secure-cron-secret-key"
```

### Email Setup (Gmail Example)

1. Enable 2FA on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `SMTP_PASSWORD`

### SMS Setup (Twilio)

1. Create a Twilio account
2. Get Account SID and Auth Token from dashboard
3. Purchase a phone number
4. Add credentials to environment variables

## API Endpoints

### Notification Testing
- `GET /api/notifications/test` - Check notification system status
- `POST /api/notifications/test` - Send test notifications

### Appointment Reminders
- `GET /api/notifications/reminders?hoursAhead=24` - Check upcoming appointments
- `POST /api/notifications/reminders` - Send appointment reminders

## Automatic Notifications

### Booking Flow Notifications

Notifications are automatically sent when:

1. **Appointment Booked** (`POST /api/appointments`)
   - Email & SMS to patient
   - Email alert to admin

2. **Test Booking Created** (`POST /api/test-bookings`)
   - Email & SMS to patient  
   - Email alert to admin

3. **Payment Confirmed** (`POST /api/payments/verify`)
   - Email & SMS to patient

### Admin Panel

Access the notification management panel at `/admin/notifications` to:
- View system status
- Test email/SMS functionality
- Manually trigger appointment reminders
- Monitor notification delivery

## Setting Up Cron Jobs

### For Production (Linux/Unix servers)

Add these cron jobs to send automatic reminders:

```bash
# Edit crontab
crontab -e

# Send 24-hour reminders every day at 9 AM
0 9 * * * curl -X POST https://yourdomain.com/api/notifications/reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secure-cron-secret-key" \
  -d '{"hoursAhead": 24}'

# Send 2-hour reminders every hour during business hours (8 AM - 6 PM)
0 8-18 * * * curl -X POST https://yourdomain.com/api/notifications/reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secure-cron-secret-key" \
  -d '{"hoursAhead": 2}'
```

### For Development/Testing

Use the admin panel at `/admin/notifications` to manually trigger reminders.

### Using External Cron Services

Services like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com) can be used:

1. Create a new cron job
2. Set URL: `https://yourdomain.com/api/notifications/reminders`
3. Method: POST
4. Headers:
   ```
   Content-Type: application/json
   Authorization: Bearer your-secure-cron-secret-key
   ```
5. Body: `{"hoursAhead": 24}` or `{"hoursAhead": 2}`

## Monitoring and Logging

### Console Logs

The system logs all notification activities:

```
📧 Email service initialized
📱 SMS service initialized
🔔 Looking for appointments between 2024-01-01T00:00:00.000Z and 2024-01-01T01:00:00.000Z
✅ Appointment confirmation notifications sent: clxy1234567890
❌ Failed to send reminder for appointment clxy1234567890: SMTP connection failed
```

### Error Handling

- Automatic retry with exponential backoff
- Graceful degradation if services are unavailable
- Detailed error logging for troubleshooting

### Admin Dashboard

Monitor notification status and performance through the admin panel:
- Configuration validation
- Connection status for email/SMS services
- Test notification functionality
- Manual reminder triggers

## Security Considerations

### Environment Variables
- Keep all secrets in environment variables
- Use strong passwords and API keys
- Rotate secrets regularly

### API Security
- Cron endpoints protected with secret tokens
- Admin endpoints require authentication
- Input validation on all endpoints

### Data Privacy
- Minimal patient data in notifications
- Secure transmission of sensitive information
- Option to disable notifications per patient (future enhancement)

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP credentials
   - Verify email provider settings
   - Check firewall/security restrictions

2. **SMS not sending**
   - Verify Twilio credentials
   - Check phone number format (+91XXXXXXXXXX)
   - Ensure sufficient Twilio balance

3. **Dry run mode enabled**
   - Set `NOTIFICATIONS_DRY_RUN=false` in production
   - Restart application after config changes

### Testing

1. Use the admin panel to test notifications
2. Check browser console and server logs
3. Start with dry-run mode to verify templates
4. Test with small batches before production

### Support

For additional support:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test individual services (email/SMS) separately
4. Use the notification status endpoint for diagnostics

## Future Enhancements

Potential improvements for the notification system:

- Patient notification preferences
- WhatsApp integration
- Push notifications for mobile app
- Advanced scheduling (custom reminder times)
- Notification analytics and reporting
- Multi-language support
- Notification templates management UI
