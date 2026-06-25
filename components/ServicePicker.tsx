'use client'
// components/ServicePicker.tsx
// Shows saved services as quick-add chips.
// User can add new services — they save to Supabase and appear next time.

import { useEffect, useState } from 'react'
import type { Service } from '@/types'
import { formatCurrency } from '@/lib/helpers'
import { CLIENT } from '@/config/client'

interface Props {
  onAdd: (service: Service) => void
}

export default function ServicePicker({ onAdd }: Props) {
  const [services, setServices] = useState<Service[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices)
  }, [])

  const handleSaveNew = async () => {
    if (!newName || !newPrice) return
    setSaving(true)
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        description: newDesc,
        price: parseFloat(newPrice),
        currency: CLIENT.invoice.defaultCurrency,
      }),
    })
    const service = await res.json()
    setServices(prev => [...prev, service])
    onAdd(service)
    setNewName(''); setNewDesc(''); setNewPrice('')
    setShowNew(false)
    setSaving(false)
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-brand-accent">
      {/* Service chips */}
      <div className="flex min-w-0 flex-wrap gap-1.5 bg-brand-light p-2">
        {services.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => onAdd(s)}
            className="max-w-full rounded-full border border-brand-accent bg-white px-2.5 py-1 text-xs transition-colors hover:border-brand-primary hover:text-brand-primary"
            title={s.description ?? undefined}
          >
            {s.name} · {formatCurrency(s.price, s.currency as any)}
          </button>
        ))}

        {/* Add new chip */}
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="rounded-full border border-dashed border-brand-primary px-2.5 py-1 text-xs text-brand-primary transition-colors hover:bg-white"
        >
          + New service
        </button>
      </div>

      {/* New service form */}
      {showNew && (
        <div className="p-3 border-t border-brand-accent space-y-2">
          <p className="text-xs font-medium text-gray-600">
            New service saves to your library for future invoices
          </p>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Service name *"
            className="field-input"
          />
          <input
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="field-input"
          />
          <input
            type="number"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            placeholder={`Price (${CLIENT.invoice.defaultCurrency}) *`}
            className="field-input"
            min={0}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveNew}
              disabled={saving || !newName || !newPrice}
              className="flex-1 py-1.5 rounded-lg text-white text-sm disabled:opacity-50"
              style={{ backgroundColor: '#C17A7A' }}
            >
              {saving ? 'Saving…' : 'Save & add to invoice'}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-3 py-1.5 rounded-lg text-sm border border-brand-accent text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
