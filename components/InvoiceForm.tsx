'use client'
// components/InvoiceForm.tsx
// Left panel: all inputs. No hardcoded values — uses config/client.ts
// Redesigned: inline parameters layout for fewer clicks

import CustomerSelect from './CustomerSelect'
import ServicePicker from './ServicePicker'
import { CLIENT } from '@/config/client'
import type { InvoiceFormState, InvoiceItem, TotalsCalc } from '@/types'
import { formatCurrency } from '@/lib/helpers'

interface Props {
  form: InvoiceFormState
  onChange: (f: InvoiceFormState) => void
  totals: TotalsCalc
}

export default function InvoiceForm({ form, onChange, totals }: Props) {
  const set = (patch: Partial<InvoiceFormState>) => onChange({ ...form, ...patch })

  // Line items
  const updateItem = (idx: number, patch: Partial<InvoiceItem>) => {
    const items = form.items.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, ...patch }
      const lessonsMult = updated.lessons && Number(updated.lessons) > 0 ? Number(updated.lessons) : 1
      updated.amount = lessonsMult * (updated.quantity || 1) * (updated.rate || 0)
      return updated
    })
    set({ items })
  }

  const removeItem = (idx: number) => {
    set({ items: form.items.filter((_, i) => i !== idx) })
  }

  const addBlankItem = () => {
    set({
      items: [...form.items, { description: '', quantity: 1, rate: 0, lessons: null, amount: 0 }],
    })
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-brand-accent bg-white p-5 space-y-6">

      {/* ── Client / Customer Section ── */}
      <div>
        <label className="field-label font-semibold text-gray-700 text-sm">Client</label>
        <CustomerSelect
          value={form.customer}
          onChange={c => set({ customer: c })}
        />
      </div>

      {/* ── Invoice Details Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Invoice Number */}
        <div>
          <label className="field-label">Invoice Number</label>
          <input
            type="text"
            value={form.invoiceNumber}
            onChange={e => set({ invoiceNumber: e.target.value })}
            className="field-input font-mono"
            placeholder="INV-XXXX"
          />
        </div>

        {/* Issue Date */}
        <div>
          <label className="field-label">Issue Date</label>
          <input
            type="date"
            value={form.issueDate}
            onChange={e => set({ issueDate: e.target.value })}
            className="field-input"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="field-label">Due Date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={e => set({ dueDate: e.target.value })}
            className="field-input"
          />
        </div>

        {/* Currency selection */}
        <div>
          <label className="field-label">Currency</label>
          <select
            value={form.currency}
            onChange={e => set({ currency: e.target.value as any })}
            className="field-input"
          >
            {CLIENT.currencies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Services / Line Items Section ── */}
      <div className="border-t border-brand-accent pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-700">Services & Session Rates</h3>
          <button
            type="button"
            onClick={addBlankItem}
            className="text-xs font-semibold hover:underline animate-pulse"
            style={{ color: '#C17A7A' }}
          >
            + Add Blank Row
          </button>
        </div>

        {/* Service library picker */}
        <ServicePicker
          onAdd={service => {
            set({
              items: [
                ...form.items,
                {
                  service_id: service.id,
                  description: service.name,
                  quantity: 1,
                  rate: service.price,
                  amount: service.price,
                },
              ],
            })
          }}
        />

        {/* Line items table */}
        {form.items.length > 0 ? (
          <div className="mt-3 space-y-3">
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2 items-start p-3 bg-brand-bg rounded-lg border border-brand-accent transition-all duration-200 hover:border-brand-primary">
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="field-label">Description / Session Name</label>
                    <input
                      value={item.description}
                      onChange={e => updateItem(i, { description: e.target.value })}
                      placeholder="e.g. French Lesson - Intermediate"
                      className="field-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="field-label">Price ({form.currency})</label>
                      <input
                        type="number"
                        value={item.rate === 0 ? '' : item.rate}
                        min={0}
                        placeholder="0.00"
                        onChange={e => updateItem(i, { rate: e.target.value === '' ? 0 : Number(e.target.value) })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Qty (Hours)</label>
                      <input
                        type="number"
                        value={item.quantity === 0 ? '' : item.quantity}
                        min={0.5}
                        step={0.5}
                        placeholder="1"
                        onChange={e => updateItem(i, { quantity: e.target.value === '' ? 0 : Number(e.target.value) })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">No. of Lessons</label>
                      <input
                        type="number"
                        value={item.lessons ?? ''}
                        min={1}
                        step={1}
                        placeholder="Blank"
                        onChange={e => {
                          const val = e.target.value === '' ? null : Number(e.target.value)
                          updateItem(i, { lessons: val })
                        }}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Total Amount</label>
                      <div className="field-input bg-gray-50 text-gray-600 font-medium">
                        {formatCurrency(item.amount, form.currency)}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="mt-1 text-gray-400 hover:text-red-500 text-xl font-bold leading-none p-1 transition-colors"
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-xs text-gray-400 border border-dashed border-brand-accent rounded-lg bg-gray-50">
            No services added yet. Select a service above or add a blank line.
          </p>
        )}
      </div>

      {/* ── Notes Section ── */}
      <div className="border-t border-brand-accent pt-5">
        <label className="field-label font-semibold text-gray-700">Notes & Payment Instructions</label>
        <textarea
          value={form.notes}
          onChange={e => set({ notes: e.target.value })}
          rows={3}
          className="field-input resize-none"
          placeholder={CLIENT.invoice.footerNote}
        />
      </div>

      {/* ── Totals summary ── */}
      <TotalsSummary
        totals={totals}
        currency={form.currency}
      />

    </div>
  )
}

function TotalsSummary({ totals, currency }: {
  totals: TotalsCalc
  currency: any
}) {
  return (
    <div className="border-t border-brand-accent pt-4 space-y-1">
      <div className="flex justify-between font-bold pt-2 text-base">
        <span>Invoice Total</span>
        <span style={{ color: '#C17A7A' }}>{formatCurrency(totals.total, currency)}</span>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-gray-600">
      <span>{label}</span><span>{value}</span>
    </div>
  )
}
