This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This project is configured for easy deployment on Vercel. Follow these steps:

1. Create a Vercel account at [vercel.com](https://vercel.com) if you don't have one
2. Install the Vercel CLI: `npm install -g vercel`
3. Run `vercel login` and follow the prompts to log in
4. From the project root directory, run `vercel` to deploy
5. Configure the following environment variables in the Vercel dashboard:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secure random string for JWT authentication
   - `NEXTAUTH_SECRET`: Secure random string for NextAuth
   - `NEXTAUTH_URL`: Your production URL
   - `SMTP_USER` and `SMTP_PASS`: For email notifications
   - Payment gateway credentials (Razorpay/Stripe)

6. Set up a PostgreSQL database (Vercel Postgres, Supabase, or any other provider)
7. Run the database migrations: `npx prisma migrate deploy`

For more details, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
