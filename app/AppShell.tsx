'use client'
// app/AppShell.tsx
// Client-side wrapper that includes the nav and password gate.

import Link from 'next/link'
import { CLIENT } from '@/config/client'
import PasswordGate from '@/components/PasswordGate'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PasswordGate>
      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-brand-accent bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl min-w-0 items-center justify-between gap-2 px-2 sm:px-6">

          {/* Logo / Name */}
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: '#C17A7A' }}
            >
              V
            </div>
            <span className="font-semibold text-sm hidden sm:block">{CLIENT.company}</span>
          </Link>

          {/* Nav links */}
          <div className="flex min-w-0 items-center gap-0.5 sm:gap-2">
            <NavLink href="/">Invoices</NavLink>
            <NavLink href="/customers">Clients</NavLink>
            <NavLink href="/services">Services</NavLink>
            <Link
              href="/invoices/new"
              className="ml-1 rounded-lg px-2 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:ml-2 sm:px-3"
              style={{ backgroundColor: '#C17A7A' }}
            >
              + New
            </Link>
          </div>

        </div>
      </nav>

      {/* ── Page Content ── */}
      <main className="mx-auto max-w-7xl overflow-x-hidden px-2 py-6 sm:px-6">
        {children}
      </main>
    </PasswordGate>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-brand-light hover:text-gray-900 sm:px-3"
    >
      {children}
    </Link>
  )
}
