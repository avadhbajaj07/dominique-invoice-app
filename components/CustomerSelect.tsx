'use client'
// components/CustomerSelect.tsx
// Searchable dropdown from Supabase customers table.
// Can add a new customer inline.

import { useEffect, useState, useRef } from 'react'
import type { Customer } from '@/types'

interface Props {
  value: Customer | null
  onChange: (c: Customer) => void
}

export default function CustomerSelect({ value, onChange }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Load customers
  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.email?.toLowerCase().includes(query.toLowerCase())
  )

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, email: newEmail, phone: newPhone, address: newAddress }),
    })
    const customer = await res.json()
    setCustomers(prev => [...prev, customer])
    onChange(customer)
    setShowAdd(false)
    setNewName(''); setNewEmail(''); setNewPhone(''); setNewAddress('')
    setSaving(false)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setQuery('') }}
        className="field-input text-left flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? value.name : 'Select a client…'}
        </span>
        <span className="text-gray-400">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-brand-accent rounded-xl shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-brand-accent">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search clients…"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-brand-accent focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* List */}
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">No clients found</li>
            )}
            {filtered.map(c => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => { onChange(c); setOpen(false) }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-brand-light transition-colors"
                >
                  <span className="font-medium">{c.name}</span>
                  {c.email && <span className="text-gray-400 ml-2 text-xs">{c.email}</span>}
                </button>
              </li>
            ))}
          </ul>

          {/* Add new */}
          <div className="border-t border-brand-accent">
            {!showAdd ? (
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="w-full px-3 py-2 text-sm text-brand-primary hover:bg-brand-light text-left font-medium"
              >
                + Add new client
              </button>
            ) : (
              <div className="p-3 space-y-2">
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name *" className="field-input" />
                <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" className="field-input" type="email" />
                <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Phone" className="field-input" />
                <input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Address" className="field-input" />
                <div className="flex gap-2">
                  <button onClick={handleAdd} disabled={saving || !newName} className="flex-1 py-1.5 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#C17A7A' }}>
                    {saving ? 'Saving…' : 'Add client'}
                  </button>
                  <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-lg text-sm border border-brand-accent text-gray-500">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
