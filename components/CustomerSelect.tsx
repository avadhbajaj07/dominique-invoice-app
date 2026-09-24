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
    fetch('/api/customers')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data)
        else setCustomers([])
      })
      .catch(err => {
        console.error('Failed to load customers:', err)
        setCustomers([])
      })
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const safeCustomers = Array.isArray(customers) ? customers : []
  const filtered = safeCustomers.filter(c =>
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
      {/* Trigger: Select button + prominent New Client button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setOpen(!open); setShowAdd(false); setQuery('') }}
          className="field-input text-left flex-1 flex items-center justify-between bg-white"
        >
          <span className={value ? 'text-gray-900 font-medium truncate' : 'text-gray-400'}>
            {value ? value.name : 'Select a client…'}
          </span>
          <span className="text-gray-400 ml-2">▾</span>
        </button>
        <button
          type="button"
          onClick={() => { setOpen(true); setShowAdd(true) }}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg text-white whitespace-nowrap transition-opacity hover:opacity-90 flex items-center gap-1 shadow-sm"
          style={{ backgroundColor: '#C17A7A' }}
          title="Add a new client"
        >
          + New Client
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-brand-accent rounded-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          {!showAdd ? (
            <>
              {/* Search + Quick Add Bar */}
              <div className="p-2 border-b border-brand-accent bg-gray-50/50 space-y-2">
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search clients…"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-brand-accent bg-white focus:outline-none focus:border-brand-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowAdd(true)}
                  className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-dashed text-brand-primary font-semibold hover:bg-brand-light flex items-center justify-center gap-1 transition-colors"
                  style={{ borderColor: '#C17A7A', color: '#C17A7A' }}
                >
                  + Add new client
                </button>
              </div>

              {/* List */}
              <ul className="max-h-56 overflow-y-auto divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <li className="px-3 py-4 text-center text-xs text-gray-400">
                    No clients found matching &quot;{query}&quot;
                  </li>
                )}
                {filtered.map(c => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => { onChange(c); setOpen(false) }}
                      className="w-full px-3 py-2.5 text-left text-sm hover:bg-brand-light transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium text-gray-800 group-hover:text-brand-primary">{c.name}</span>
                      {c.email && <span className="text-gray-400 text-xs truncate max-w-[180px]">{c.email}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            /* Dedicated Add New Client View (Compact & Always Visible) */
            <div className="flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-brand-accent bg-brand-light">
                <span className="font-semibold text-xs text-gray-800 uppercase tracking-wider">New Client</span>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: '#C17A7A' }}
                >
                  ← Back to client list
                </button>
              </div>
              <div className="p-3 space-y-2.5 bg-white">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Full Name *</label>
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Catherine Dupont"
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Email (optional)</label>
                  <input
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="e.g. catherine@example.com"
                    type="email"
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Phone (optional)</label>
                  <input
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="e.g. +41 79 123 45 67"
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Address (optional)</label>
                  <input
                    value={newAddress}
                    onChange={e => setNewAddress(e.target.value)}
                    placeholder="e.g. Rue du Rhône 12, 1204 Genève"
                    className="field-input"
                  />
                </div>
                <div className="flex gap-2 pt-2 border-t border-brand-accent/50">
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={saving || !newName.trim()}
                    className="flex-1 py-2.5 rounded-lg text-white text-xs font-semibold disabled:opacity-50 transition-opacity shadow-sm"
                    style={{ backgroundColor: '#C17A7A' }}
                  >
                    {saving ? 'Saving…' : 'Save & Select Client'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAdd(false); setOpen(false) }}
                    className="px-4 py-2.5 rounded-lg text-xs font-semibold border border-brand-accent text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
