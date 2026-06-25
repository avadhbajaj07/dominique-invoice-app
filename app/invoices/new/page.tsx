'use client'
// app/invoices/new/page.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import InvoiceForm from '@/components/InvoiceForm'
import InvoicePreview from '@/components/InvoicePreview'
import type { InvoiceFormState } from '@/types'
import { CLIENT } from '@/config/client'
import { todayISO, calcTotals } from '@/lib/helpers'

// Helper to add days to ISO date
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

const today = todayISO()

const DEFAULT_STATE: InvoiceFormState = {
  invoiceNumber: '',
  customer: null,
  items: [],
  issueDate: today,
  dueDate: addDays(today, 30), // Default to +30 days
  currency: CLIENT.invoice.defaultCurrency,
  taxRate: CLIENT.invoice.defaultTaxRate,
  discount: 0,
  discountType: 'fixed',
  notes: CLIENT.invoice.footerNote,
  status: 'draft',
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [form, setForm] = useState<InvoiceFormState>(DEFAULT_STATE)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form')

  // Fetch the next invoice number on page load
  useEffect(() => {
    fetch('/api/invoices/next-number')
      .then(res => res.json())
      .then(data => {
        if (data.nextNumber) {
          setForm(prev => ({ ...prev, invoiceNumber: data.nextNumber }))
        }
      })
      .catch(err => console.error('Failed to load next invoice number', err))
  }, [])

  const totals = calcTotals(form.items, form.taxRate, form.discount, form.discountType)

  const handleSave = async () => {
    if (!form.customer) return setError('Select a client first.')
    if (form.items.length === 0) return setError('Add at least one service.')
    if (!form.invoiceNumber.trim()) return setError('Invoice number is required.')
    setSaving(true); setError('')

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_number: form.invoiceNumber,
          customer_id: form.customer.id,
          items: form.items,
          issue_date: form.issueDate,
          due_date: form.dueDate || undefined,
          currency: form.currency,
          tax_rate: form.taxRate,
          discount: form.discount,
          discount_type: form.discountType,
          notes: form.notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Save failed')
        setSaving(false)
        return
      }
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'An unexpected error occurred')
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-lg font-semibold">New Invoice</h1>
        <div className="flex min-w-0 gap-2 items-center">
          {error && <p className="text-red-500 text-xs truncate max-w-[200px] sm:max-w-none" title={error}>{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: '#C17A7A' }}
          >
            {saving ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible on mobile/tablet, hidden on desktop lg) */}
      <div className="flex lg:hidden mb-4 rounded-lg bg-gray-100 p-0.5 border border-brand-accent">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'form' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500'
          }`}
          style={activeTab === 'form' ? { color: '#C17A7A' } : {}}
        >
          Edit Form
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'preview' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500'
          }`}
          style={activeTab === 'preview' ? { color: '#C17A7A' } : {}}
        >
          Live Preview
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: form (always visible on desktop, tab-toggle on mobile) */}
        <div className={activeTab === 'form' ? 'block min-w-0' : 'hidden lg:block min-w-0'}>
          <InvoiceForm form={form} onChange={setForm} totals={totals} />
        </div>

        {/* Right: live preview (always visible on desktop, tab-toggle on mobile) */}
        <div className={activeTab === 'preview' ? 'block min-w-0 lg:sticky lg:top-20 lg:self-start' : 'hidden lg:block min-w-0 lg:sticky lg:top-20 lg:self-start'}>
          <InvoicePreview form={form} totals={totals} invoiceNumber={form.invoiceNumber || 'PREVIEW'} />
        </div>
      </div>
    </div>
  )
}
