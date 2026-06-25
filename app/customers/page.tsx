'use client'
// app/customers/page.tsx

import { useEffect, useState } from 'react'
import type { Customer } from '@/types'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => { setCustomers(d); setLoading(false) })
  }, [])

  const handleAdd = async () => {
    if (!name.trim()) return
    setSaving(true)
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, address }),
    })
    const c = await res.json()
    setCustomers(prev => [...prev, c])
    setName(''); setEmail(''); setPhone(''); setAddress('')
    setShowForm(false); setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Clients</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-white text-sm"
          style={{ backgroundColor: '#C17A7A' }}
        >
          + Add Client
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white border border-brand-accent rounded-xl p-4 mb-4 space-y-3">
          <h2 className="font-medium text-sm">New Client</h2>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name *" className="field-input" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="field-input" type="email" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="field-input" />
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" className="field-input" />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !name} className="flex-1 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#C17A7A' }}>
              {saving ? 'Saving…' : 'Save Client'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-brand-accent text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Client list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No clients yet — add your first one above.</div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-accent overflow-hidden">
          {customers.map((c, i) => (
            <div key={c.id} className={`px-4 py-3 flex items-center justify-between ${i < customers.length - 1 ? 'border-b border-brand-accent' : ''}`}>
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                {c.address && <p className="text-xs text-gray-400">{c.address}</p>}
              </div>
              {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
