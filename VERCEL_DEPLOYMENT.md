# Deploying to Vercel

This guide provides step-by-step instructions for deploying your Diagnostic Centre application to Vercel.

## Prerequisites

1. A GitHub account (or GitLab/Bitbucket)
2. Your project code pushed to a GitHub repository
3. A Vercel account (created in the steps below)

## Creating a Vercel Account

1. Go to [Vercel's website](https://vercel.com/)
2. Click on "Start Deploying" or "Sign Up"
3. Choose "Continue with GitHub" to connect your GitHub account
4. Complete the sign-up process by following the on-screen instructions

## Deploying Your Application

### Method 1: Deploy via Vercel Dashboard

1. After creating your Vercel account, go to the [Vercel dashboard](https://vercel.com/dashboard)
2. Click on "Add New..." → "Project"
3. Import your GitHub repository (you may need to install Vercel for GitHub if prompted)
4. Configure your project:
   - Vercel will automatically detect that you have a Next.js app
   - You can use default values for most settings
   - Framework Preset: Make sure it's set to "Next.js"
   - Root Directory: Leave as default (if your project is in the root)
   - Build Command: Leave as default (Vercel will use `next build`)
   - Output Directory: Leave as default
   - Install Command: Leave as default
5. Configure environment variables:
   - Add all the environment variables from your `.env.production` file
   - Make sure to add the `DATABASE_URL` for your PostgreSQL database
   - Add all other required environment variables (authentication, payment, email, SMS, etc.)
6. Click "Deploy"

### Method 2: Deploy via Vercel CLI

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Navigate to your project directory and run:
   ```bash
   vercel login
   ```

3. Follow the authentication process to link your Vercel account

4. Deploy your application:
   ```bash
   vercel
   ```

5. Follow the interactive prompts:
   - Set up and deploy: Yes
   - Link to existing project: No (for first deployment)
   - Project name: Accept default or provide a custom name
   - Framework preset: Next.js
   - Root directory: ./ (default)
   - Override settings: No (default)

6. After deployment, configure environment variables through the Vercel dashboard

## Setting Up PostgreSQL Database

1. Create a PostgreSQL database using a service like:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Supabase](https://supabase.com/)
   - [Railway](https://railway.app/)
   - [Neon](https://neon.tech/)

2. Get your PostgreSQL connection string

3. Add the connection string as `DATABASE_URL` in your Vercel project environment variables

## Running Database Migrations

After deployment, you need to run Prisma migrations on your production database:

1. From the Vercel dashboard, go to your project
2. Navigate to "Deployments" → select your latest deployment
3. Click on "Functions" tab → "Console"
4. Run the following command in the console:
   ```bash
   npx prisma migrate deploy
   ```

## Seeding the Database (Optional)

If you need to seed your database with initial data:

1. Access the console as described above
2. Run:
   ```bash
   npx prisma db seed
   ```

## Verifying Your Deployment

1. Once deployment is complete, Vercel will provide you with a URL (e.g., `https://your-project-name.vercel.app`)
2. Visit the URL to ensure your application is working correctly
3. Test all major features to confirm functionality

## Setting Up a Custom Domain (Optional)

1. From your Vercel project dashboard, click on "Domains"
2. Click "Add" and enter your domain name
3. Follow the instructions to configure your DNS settings
4. Vercel will automatically provision an SSL certificate for your domain

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs in the Vercel dashboard
2. Ensure all environment variables are correctly set
3. Verify your database connection string is correct
4. Check that your Prisma schema is compatible with PostgreSQL
5. Review the Vercel deployment documentation for specific errors

## Maintenance and Updates

To update your deployed application:

1. Push changes to your connected GitHub repository
2. Vercel will automatically trigger a new deployment
3. Monitor the deployment in the Vercel dashboard

For manual deployments using the CLI:

```bash
vercel --prod
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)