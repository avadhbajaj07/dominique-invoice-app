// app/layout.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { CLIENT } from '@/config/client'
import './globals.css'
import AppShell from './AppShell'

export const metadata: Metadata = {
  title: `Invoice Studio — ${CLIENT.company}`,
  description: `Invoice management for ${CLIENT.company}`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-brand-bg font-sans text-brand-text">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

