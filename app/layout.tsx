import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Orbitron, Rajdhani } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist",
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700"],
})

const rajdhani = Rajdhani({ 
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: 'FRIDAY Dashboard',
  description: 'A beautiful personal desktop dashboard with glassmorphism design',
  generator: 'v0.app',
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

export const viewport: Viewport = {
  themeColor: '#1a2a4a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${orbitron.variable} ${rajdhani.variable}`}>
      <body className="font-sans antialiased bg-[#1a2a4a] overflow-hidden">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
