'use client'
// components/PasswordGate.tsx
// Full-screen password gate that protects the app.
// Stores auth in sessionStorage (clears when tab closes).

import { useState, useEffect } from 'react'
import { CLIENT } from '@/config/client'

const AUTH_KEY = 'invoice_app_auth'

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY)
    setAuthenticated(stored === 'true')
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CLIENT.appPassword) {
      sessionStorage.setItem(AUTH_KEY, 'true')
      setAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password')
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  // Still loading (checking sessionStorage)
  if (authenticated === null) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: '#FAF5F0' }}>
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C17A7A', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  // Authenticated — render app
  if (authenticated) return <>{children}</>

  // Password screen
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" style={{ backgroundColor: '#FAF5F0' }}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #C17A7A 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <form
        onSubmit={handleSubmit}
        className={`relative w-full max-w-sm bg-white rounded-2xl border p-8 shadow-xl transition-transform ${shaking ? 'animate-shake' : ''}`}
        style={{ borderColor: '#E8D5C4' }}
      >
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg"
            style={{ backgroundColor: '#C17A7A' }}
          >
            V
          </div>
          <h1 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
            {CLIENT.company}
          </h1>
          <p className="text-xs text-gray-400 mt-1">Invoice Studio — Enter password to continue</p>
        </div>

        {/* Password input */}
        <div className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder="Password"
            autoFocus
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
            style={{
              borderColor: error ? '#ef4444' : '#E8D5C4',
              backgroundColor: '#FDFBF9',
            }}
            onFocus={e => { e.target.style.borderColor = '#C17A7A'; e.target.style.boxShadow = '0 0 0 3px rgba(193,122,122,0.15)' }}
            onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : '#E8D5C4'; e.target.style.boxShadow = 'none' }}
          />
          {error && (
            <p className="text-xs text-red-500 text-center font-medium">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#C17A7A' }}
          >
            Unlock
          </button>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-gray-300 text-center mt-5">
          © {new Date().getFullYear()} {CLIENT.company}
        </p>
      </form>

      {/* Shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
