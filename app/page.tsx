'use client'
// app/page.tsx — Dashboard: recent invoices + quick stats

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, statusColor, statusLabel } from '@/lib/helpers'
import type { Invoice } from '@/types'

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/invoices')
      .then(r => r.json())
      .then(data => { setInvoices(data); setLoading(false) })
  }, [])

  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + i.total, 0)
  const pending = invoices.filter(i => i.status === 'sent').length
  const drafts  = invoices.filter(i => i.status === 'draft').length

  return (
    <div>
      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Invoices" value={String(invoices.length)} />
        <StatCard label="Paid Revenue" value={`CHF ${totalRevenue.toFixed(0)}`} highlight />
        <StatCard label="Awaiting Payment" value={String(pending)} />
        <StatCard label="Drafts" value={String(drafts)} />
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Invoices</h1>
        <Link
          href="/invoices/new"
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: '#C17A7A' }}
        >
          + New Invoice
        </Link>
      </div>

      {/* ── Invoice List ── */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : invoices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-xl border border-brand-accent overflow-hidden">
          {/* Table header — desktop */}
          <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-xs font-medium text-gray-500 border-b border-brand-accent">
            <span>Client</span>
            <span>Invoice #</span>
            <span>Date</span>
            <span>Total</span>
            <span>Status</span>
            <span></span>
          </div>

          {invoices.map((inv, i) => (
            <div
              key={inv.id}
              className={`grid grid-cols-2 sm:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-2 sm:gap-4 px-4 py-3 items-center text-sm ${
                i < invoices.length - 1 ? 'border-b border-brand-accent' : ''
              }`}
            >
              <span className="font-medium truncate">{(inv as any).customer?.name ?? '—'}</span>
              <span className="text-gray-500 font-mono text-xs">{inv.invoice_number}</span>
              <span className="text-gray-500 text-xs hidden sm:block">{formatDate(inv.issue_date)}</span>
              <span className="font-semibold">{formatCurrency(inv.total, inv.currency as any)}</span>
              <span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(inv.status)}`}>
                  {statusLabel(inv.status)}
                </span>
              </span>
              <div className="flex gap-2 justify-end">
                <ActionBtn invoiceId={inv.id} onUpdate={() => {
                  setInvoices(prev => prev.map(x => x.id === inv.id ? { ...x, status: 'paid' } : x))
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-accent bg-white'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-brand-primary' : ''}`}>{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-brand-accent">
      <p className="text-gray-400 mb-3">No invoices yet</p>
      <Link
        href="/invoices/new"
        className="px-5 py-2 rounded-lg text-white text-sm"
        style={{ backgroundColor: '#C17A7A' }}
      >
        Create your first invoice
      </Link>
    </div>
  )
}

function ActionBtn({ invoiceId, onUpdate }: { invoiceId: string; onUpdate: () => void }) {
  const [sending, setSending] = useState(false)

  const handleDownload = async () => {
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
    }
  }

  const handleSend = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to send email')
      }
      onUpdate()
      alert('Email sent successfully!')
    } catch (err: any) {
      alert(err.message ?? 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex gap-1">
      <button onClick={handleDownload} className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">PDF</button>
      <button onClick={handleSend} disabled={sending} className="px-2 py-1 text-xs rounded text-white disabled:opacity-50" style={{ backgroundColor: '#C17A7A' }}>
        {sending ? '...' : 'Send'}
      </button>
    </div>
  )
}
