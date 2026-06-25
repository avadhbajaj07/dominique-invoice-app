'use client'
// app/services/page.tsx

import { useEffect, useState } from 'react'
import type { Service } from '@/types'
import { formatCurrency } from '@/lib/helpers'
import { CLIENT } from '@/config/client'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => { setServices(d); setLoading(false) })
  }, [])

  const handleAdd = async () => {
    if (!name || !price) return
    setSaving(true)
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc, price: parseFloat(price), currency: CLIENT.invoice.defaultCurrency }),
    })
    const s = await res.json()
    setServices(prev => [...prev, s])
    setName(''); setDesc(''); setPrice('')
    setShowForm(false); setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold">Service Library</h1>
          <p className="text-xs text-gray-500">These appear as quick-add options when creating invoices</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#C17A7A' }}>
          + Add Service
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-brand-accent rounded-xl p-4 mb-4 space-y-3">
          <h2 className="font-medium text-sm">New Service</h2>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Service name *" className="field-input" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)" className="field-input" />
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder={`Price (${CLIENT.invoice.defaultCurrency}) *`} className="field-input" min={0} />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !name || !price} className="flex-1 py-2 rounded-lg text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#C17A7A' }}>
              {saving ? 'Saving…' : 'Save Service'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-brand-accent text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-accent overflow-hidden">
          {services.map((s, i) => (
            <div key={s.id} className={`px-4 py-3 flex items-center justify-between ${i < services.length - 1 ? 'border-b border-brand-accent' : ''}`}>
              <div>
                <p className="font-medium text-sm">{s.name}</p>
                {s.description && <p className="text-xs text-gray-400">{s.description}</p>}
              </div>
              <p className="font-semibold text-sm" style={{ color: '#C17A7A' }}>
                {formatCurrency(s.price, s.currency as any)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
