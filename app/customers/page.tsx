'use client'
// app/customers/page.tsx
// Clients list with client invoice history side-drawer modal

import { useEffect, useState } from 'react'
import type { Customer, Invoice } from '@/types'
import { formatCurrency, formatDate, statusColor, statusLabel } from '@/lib/helpers'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/invoices').then(r => r.json())
    ]).then(([custs, invs]) => {
      setCustomers(custs || [])
      setInvoices(invs || [])
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
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

  const handleDownload = async (invoiceId: string) => {
    setDownloadingId(invoiceId)
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId }),
      })
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(err.message ?? 'Error downloading PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  const clientInvoices = selectedCustomer
    ? invoices.filter(inv => inv.customer_id === selectedCustomer.id)
    : []

  const totalInvoices = clientInvoices.length
  const totalPaid = clientInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)
  const totalUnpaid = clientInvoices
    .filter(inv => inv.status === 'unpaid')
    .reduce((sum, inv) => sum + inv.total, 0)

  return (
    <div className="relative">
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
        <div className="bg-white border border-brand-accent rounded-xl p-4 mb-4 space-y-3 shadow-sm">
          <h2 className="font-semibold text-sm text-gray-700">New Client</h2>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name *" className="field-input" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="field-input" type="email" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="field-input" />
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" className="field-input" />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !name} className="flex-1 py-2 rounded-lg text-white text-sm disabled:opacity-50 font-medium" style={{ backgroundColor: '#C17A7A' }}>
              {saving ? 'Saving…' : 'Save Client'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-brand-accent text-gray-500 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Client list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border border-brand-accent rounded-xl bg-white">
          No clients yet — add your first client using the button above.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-accent overflow-hidden shadow-sm">
          {customers.map((c, i) => {
            const count = invoices.filter(inv => inv.customer_id === c.id).length
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-brand-bg transition-colors duration-150 ${i < customers.length - 1 ? 'border-b border-brand-accent' : ''}`}
              >
                <div>
                  <p className="font-semibold text-sm text-gray-800">{c.name}</p>
                  {c.email && <p className="text-xs text-gray-400 mt-0.5">{c.email}</p>}
                  {c.address && <p className="text-xs text-gray-400">{c.address}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-brand-accent/30 text-brand-primary px-2 py-0.5 rounded-full font-medium">
                    {count} {count === 1 ? 'invoice' : 'invoices'}
                  </span>
                  {c.phone && <p className="text-xs text-gray-500 hidden sm:block">{c.phone}</p>}
                  <span className="text-gray-400 text-sm">→</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Slide-over details modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-[#FAF5F0] h-full flex flex-col shadow-2xl transition-transform duration-300">
            {/* Header */}
            <div className="p-5 border-b border-brand-accent bg-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">Client Profile</h2>
                <p className="text-xs text-gray-500 mt-0.5">Invoice and payment history</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none p-1"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-brand-accent p-4 space-y-3 shadow-sm">
                <h3 className="text-lg font-bold" style={{ color: '#C17A7A' }}>{selectedCustomer.name}</h3>
                <div className="space-y-1.5 text-xs text-gray-600 font-sans">
                  {selectedCustomer.email && (
                    <p><strong>Email:</strong> <a href={`mailto:${selectedCustomer.email}`} className="text-brand-primary hover:underline">{selectedCustomer.email}</a></p>
                  )}
                  {selectedCustomer.phone && (
                    <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                  )}
                  {selectedCustomer.address && (
                    <p><strong>Address:</strong> {selectedCustomer.address}</p>
                  )}
                </div>
              </div>

              {/* Financial Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-brand-accent p-3 text-center shadow-sm">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Total</p>
                  <p className="text-base font-bold text-gray-800 mt-1">{totalInvoices}</p>
                </div>
                <div className="bg-white rounded-xl border border-brand-accent p-3 text-center shadow-sm">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Paid</p>
                  <p className="text-base font-bold text-green-600 mt-1">CHF {totalPaid.toFixed(0)}</p>
                </div>
                <div className="bg-white rounded-xl border border-brand-accent p-3 text-center shadow-sm">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Unpaid</p>
                  <p className="text-base font-bold text-amber-600 mt-1">CHF {totalUnpaid.toFixed(0)}</p>
                </div>
              </div>

              {/* Invoice List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">Invoices ({clientInvoices.length})</h4>
                {clientInvoices.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No invoices created for this client yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {clientInvoices.map(inv => (
                      <div key={inv.id} className="bg-white rounded-xl border border-brand-accent p-3 flex items-center justify-between shadow-sm hover:border-brand-primary transition-all">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-gray-800">#{inv.invoice_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(inv.status)}`}>
                              {statusLabel(inv.status)}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">Created: {formatDate(inv.issue_date)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-800">
                            {formatCurrency(inv.total, inv.currency as any)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownload(inv.id)
                            }}
                            disabled={downloadingId === inv.id}
                            className="p-1.5 rounded bg-gray-50 border border-brand-accent hover:border-brand-primary text-gray-600 hover:text-brand-primary transition-colors disabled:opacity-50"
                            title="Download PDF"
                          >
                            {downloadingId === inv.id ? '...' : '📥'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-brand-accent flex gap-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 rounded-lg text-sm border border-brand-accent text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
