import type { Metadata, Viewport } from 'next'

export const metadata = {
  title: 'Our Doctors | Healthcare Diagnostic Centre',
  description: 'Meet our experienced team of doctors and specialists. Book appointments online.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function DoctorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
