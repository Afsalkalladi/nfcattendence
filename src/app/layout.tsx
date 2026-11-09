import type { Metadata, Viewport } from 'next'
import './globals.css'
import { THEME_INIT_SCRIPT } from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Attendance · Admin',
  description: 'NFC attendance admin – employees, cards, readers and Zoho sync',
  icons: { icon: '/favicon.png' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#090b11' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
