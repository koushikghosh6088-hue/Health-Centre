import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";
import { Suspense } from 'react'
import Loading from './loading'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthCare Diagnostic Centre - Professional Medical Testing Services",
  description: "Leading diagnostic centre offering comprehensive medical testing, expert consultations, and state-of-the-art healthcare services. Book appointments and tests online with trusted medical professionals.",
  keywords: "diagnostic centre, medical tests, doctor appointments, healthcare, blood tests, X-ray, MRI, CT scan, pathology",
  authors: [{ name: "HealthCare Diagnostic Centre" }],
  robots: "index, follow",
  openGraph: {
    title: "HealthCare Diagnostic Centre",
    description: "Professional Medical Testing Services & Expert Consultations",
    type: "website",
    locale: "en_US",
    siteName: "HealthCare Diagnostic Centre",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)]`}
      >
        <Suspense fallback={<Loading />}>
          <div className="relative min-h-screen">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_var(--surface-2)_0%,_transparent_50%)] z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_var(--surface-3)_0%,_transparent_50%)] z-0" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--surface-1)_0%,_transparent_50%,_var(--surface-1)_100%)] z-0" />
            <div className="relative z-10">
              <Header />
              <main className="min-h-[calc(100vh-4rem)] px-4 py-6 container mx-auto">
                {children}
              </main>
              <Footer />
            </div>
          </div>
          <Toaster position="top-right" />
        </Suspense>
      </body>
    </html>
  );
}
