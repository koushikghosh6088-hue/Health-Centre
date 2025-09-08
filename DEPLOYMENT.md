# Deployment Guide for HealthCare Diagnostic Centre

This guide provides step-by-step instructions for deploying the HealthCare Diagnostic Centre application to Vercel.

## Prerequisites

1. A Vercel account (free tier available)
2. A PostgreSQL database (Vercel Postgres, Supabase, or any other provider)
3. Node.js and npm installed on your local machine

## Deployment Steps

### 1. Prepare Your Database

- Create a PostgreSQL database with your preferred provider
- Get your PostgreSQL connection string in the format: `postgresql://user:password@host:port/database`

### 2. Deploy to Vercel

#### Option 1: Using Vercel CLI (Recommended)

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to your project directory and deploy:
   ```bash
   cd diagnostic-centre
   vercel
   ```

4. Follow the prompts to configure your project

#### Option 2: Using Vercel Dashboard

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure project settings and click "Deploy"

### 3. Configure Environment Variables

In the Vercel dashboard, go to your project settings and add the following environment variables:

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://your-production-url.vercel.app

# Payment Gateways
RAZORPAY_KEY_ID=your-production-razorpay-key-id
RAZORPAY_KEY_SECRET=your-production-razorpay-key-secret

# Email Configuration
SMTP_FROM=noreply@healthcarediagnostic.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password

# Notification Configuration
NOTIFICATIONS_EMAIL_ENABLED=true
NOTIFICATIONS_SMS_ENABLED=true
NOTIFICATIONS_DRY_RUN=false

# App Configuration
NEXT_PUBLIC_APP_NAME=HealthCare Diagnostic Centre
NEXT_PUBLIC_APP_URL=https://your-production-url.vercel.app
```

### 4. Run Database Migrations

After deployment, you need to run the database migrations. You can do this using the Vercel CLI:

```bash
vercel env pull .env.production.local
npx prisma migrate deploy
```

Alternatively, you can set up a deployment hook in your Vercel project settings to run migrations automatically after each deployment.

### 5. Seed the Database (Optional)

If you want to seed your database with initial data:

```bash
vercel env pull .env.production.local
npm run seed
```

### 6. Verify Deployment

1. Visit your deployed application at the URL provided by Vercel
2. Test key functionality:
   - User registration and login
   - Appointment booking
   - Test booking
   - Payment processing
   - Email notifications

### 7. Set Up a Custom Domain (Optional)

1. In the Vercel dashboard, go to your project settings
2. Click on "Domains"
3. Add your custom domain and follow the instructions to configure DNS settings

## Troubleshooting

### Database Connection Issues

- Verify your DATABASE_URL is correct
- Ensure your database allows connections from Vercel's IP addresses
- Check that your database user has the necessary permissions

### Email Notification Issues

- Verify SMTP credentials are correct
- For Gmail, ensure you're using an App Password if 2FA is enabled
- Check that NOTIFICATIONS_EMAIL_ENABLED is set to true

### Payment Gateway Issues

- Verify API keys are correct
- Ensure you're using production API keys, not test keys

## Maintenance

### Updating Your Application

To update your deployed application, simply push changes to your repository or run `vercel` again from your project directory.

### Monitoring

Use Vercel's built-in analytics and logs to monitor your application's performance and errors.

---

For more information, refer to the [Vercel documentation](https://vercel.com/docs) and [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).