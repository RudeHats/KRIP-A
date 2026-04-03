import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AQI Dashboard | Real-time Air Quality Monitoring',
  description: 'Monitor real-time air quality index, pollutant levels, and health advisories with our beautiful glassmorphism dashboard. Get AI-powered insights and recommendations.',
  generator: 'v0.app',
  keywords: ['air quality', 'AQI', 'pollution', 'health', 'environment', 'dashboard', 'monitoring'],
  authors: [{ name: 'AQI Dashboard' }],
  openGraph: {
    title: 'AQI Dashboard | Real-time Air Quality Monitoring',
    description: 'Monitor real-time air quality with AI-powered insights',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
