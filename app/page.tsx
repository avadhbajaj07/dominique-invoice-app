'use client'
// app/page.tsx — Dashboard: recent invoices + quick stats
// Status dropdown (Draft/Unpaid/Paid) + Email sent tracking

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, statusColor, statusLabel } from '@/lib/helpers'
import type { Invoice, InvoiceStatus } from '@/types'

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    fetch('/api/invoices')
      .then(r => r.json())
      .then(data => { setInvoices(data); setLoading(false) })
  }

  useEffect(() => { refresh() }, [])

  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + i.total, 0)
  const unpaid = invoices.filter(i => i.status === 'unpaid').length
  const drafts  = invoices.filter(i => i.status === 'draft').length

  return (
    <div>
      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Invoices" value={String(invoices.length)} />
        <StatCard label="Paid Revenue" value={`CHF ${totalRevenue.toFixed(0)}`} highlight />
        <StatCard label="Unpaid" value={String(unpaid)} />
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
            <InvoiceRow
              key={inv.id}
              invoice={inv}
              isLast={i === invoices.length - 1}
              onUpdate={(updated) => {
                setInvoices(prev => prev.map(x => x.id === inv.id ? { ...x, ...updated } : x))
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Invoice Row ──────────────────────────────

function InvoiceRow({
  invoice: inv,
  isLast,
  onUpdate,
}: {
  invoice: Invoice
  isLast: boolean
  onUpdate: (updates: Partial<Invoice>) => void
}) {
  const [sending, setSending] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)

  // ── Status change handler ──
  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    setChangingStatus(true)
    try {
      const res = await fetch(`/api/invoices/${inv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to update status')
      }
      onUpdate({ status: newStatus })
    } catch (err: any) {
      alert(err.message ?? 'Error updating status')
    } finally {
      setChangingStatus(false)
    }
  }

  // ── Download PDF ──
  const handleDownload = async () => {
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: inv.id }),
      })
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${inv.invoice_number}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(err.message ?? 'Error downloading PDF')
    }
  }

  // ── Send email ──
  const handleSend = async () => {
    // If already sent, ask for confirmation to re-send
    if (inv.email_sent_at) {
      const sentDate = new Date(inv.email_sent_at).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
      if (!confirm(`Email was already sent on ${sentDate}.\n\nSend again?`)) return
    }

    setSending(true)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: inv.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to send email')
      }
      const result = await res.json()
      onUpdate({ email_sent_at: result.email_sent_at })
      alert('Email sent successfully!')
    } catch (err: any) {
      alert(err.message ?? 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const emailSent = !!inv.email_sent_at
  const sentDate = inv.email_sent_at
    ? new Date(inv.email_sent_at).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short',
      })
    : null

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-2 sm:gap-4 px-4 py-3 items-center text-sm ${
        !isLast ? 'border-b border-brand-accent' : ''
      }`}
    >
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate">{(inv as any).customer?.name ?? '—'}</span>
        {emailSent && (
          <span className="text-[11px] text-green-600 font-semibold whitespace-nowrap mt-0.5 flex items-center gap-1" title={`Email sent on ${new Date(inv.email_sent_at!).toLocaleString()}`}>
            ✉️ Sent {sentDate}
          </span>
        )}
      </div>
      <span className="text-gray-500 font-mono text-xs">{inv.invoice_number}</span>
      <span className="text-gray-500 text-xs hidden sm:block">{formatDate(inv.issue_date)}</span>
      <span className="font-semibold">{formatCurrency(inv.total, inv.currency as any)}</span>

      {/* Status dropdown */}
      <span>
        <select
          value={inv.status}
          onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
          disabled={changingStatus}
          className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer outline-none appearance-none text-center ${statusColor(inv.status)}`}
          style={{ paddingRight: '6px' }}
        >
          <option value="draft">Draft</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
      </span>

      {/* Actions */}
      <div className="flex gap-1 items-center">
        <button
          onClick={handleDownload}
          className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Download PDF"
        >
          PDF
        </button>
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-2 py-1 text-xs rounded text-white disabled:opacity-50 transition-colors"
          style={{ backgroundColor: '#C17A7A' }}
          title={emailSent ? `Sent ${sentDate}` : 'Send email'}
        >
          {sending ? '...' : emailSent ? '✉️ Resend' : 'Send'}
        </button>
      </div>
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
        Create your first invoice →
      </Link>
    </div>
  )
}
