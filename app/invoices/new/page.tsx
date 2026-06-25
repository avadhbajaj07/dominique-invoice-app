'use client'
// app/invoices/new/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InvoiceForm from '@/components/InvoiceForm'
import InvoicePreview from '@/components/InvoicePreview'
import type { InvoiceFormState } from '@/types'
import { CLIENT } from '@/config/client'
import { todayISO, calcTotals } from '@/lib/helpers'

const DEFAULT_STATE: InvoiceFormState = {
  customer: null,
  items: [],
  issueDate: todayISO(),
  dueDate: '',
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

  const totals = calcTotals(form.items, form.taxRate, form.discount, form.discountType)

  const handleSave = async () => {
    if (!form.customer) return setError('Select a client first.')
    if (form.items.length === 0) return setError('Add at least one service.')
    setSaving(true); setError('')

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-lg font-semibold">New Invoice</h1>
        <div className="flex min-w-0 gap-2">
          {error && <p className="text-red-500 text-sm self-center">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#C17A7A' }}
          >
            {saving ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      {/* ── Two-panel layout ── */}
      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: form */}
        <div className="min-w-0">
          <InvoiceForm form={form} onChange={setForm} totals={totals} />
        </div>

        {/* Right: live preview */}
        <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <InvoicePreview form={form} totals={totals} invoiceNumber="PREVIEW" />
        </div>
      </div>
    </div>
  )
}
