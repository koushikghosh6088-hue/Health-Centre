import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";

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
  viewport: "width=device-width, initial-scale=1",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
