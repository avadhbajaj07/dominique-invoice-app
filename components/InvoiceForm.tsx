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
      updated.amount = updated.quantity * updated.rate
      return updated
    })
    set({ items })
  }

  const removeItem = (idx: number) => {
    set({ items: form.items.filter((_, i) => i !== idx) })
  }

  const addBlankItem = () => {
    set({
      items: [...form.items, { description: '', quantity: 1, rate: 0, amount: 0 }],
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
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="field-label">Qty (Hours)</label>
                      <input
                        type="number"
                        value={item.quantity}
                        min={0.5}
                        step={0.5}
                        onChange={e => updateItem(i, { quantity: Number(e.target.value) })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Rate ({form.currency})</label>
                      <input
                        type="number"
                        value={item.rate}
                        min={0}
                        onChange={e => updateItem(i, { rate: Number(e.target.value) })}
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

      {/* ── Discounts & Tax Section ── */}
      <div className="border-t border-brand-accent pt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Discount Fields */}
        <div className="space-y-2 p-3 rounded-lg bg-brand-bg border border-brand-accent">
          <label className="field-label font-semibold text-gray-700">Discount</label>
          <div className="flex gap-2">
            <select
              value={form.discountType}
              onChange={e => set({ discountType: e.target.value as any })}
              className="field-input"
              style={{ flex: '1' }}
            >
              <option value="fixed">Fixed ({form.currency})</option>
              <option value="percent">Percentage (%)</option>
            </select>
            <input
              type="number"
              value={form.discount}
              min={0}
              max={form.discountType === 'percent' ? 100 : undefined}
              onChange={e => set({ discount: Number(e.target.value) })}
              className="field-input text-right font-mono"
              style={{ flex: '1' }}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Tax Field */}
        <div className="space-y-2 p-3 rounded-lg bg-brand-bg border border-brand-accent">
          <label className="field-label font-semibold text-gray-700">Tax / VAT</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={form.taxRate}
              min={0}
              max={100}
              step={0.5}
              onChange={e => set({ taxRate: Number(e.target.value) })}
              className="field-input text-right font-mono"
              placeholder="0.0%"
            />
            <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">(Tutoring in Switzerland is VAT-exempt)</span>
          </div>
        </div>
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
        taxRate={form.taxRate}
        discount={form.discount}
        discountType={form.discountType}
      />

    </div>
  )
}

function TotalsSummary({ totals, currency, taxRate, discount, discountType }: {
  totals: TotalsCalc
  currency: any
  taxRate: number
  discount: number
  discountType: string
}) {
  return (
    <div className="border-t border-brand-accent pt-4 space-y-1">
      <Row label="Subtotal" value={formatCurrency(totals.subtotal, currency)} />
      {totals.discountAmount > 0 && (
        <Row label={`Discount${discountType === 'percent' ? ` (${discount}%)` : ''}`} value={`−${formatCurrency(totals.discountAmount, currency)}`} />
      )}
      {taxRate > 0 && (
        <Row label={`Tax (${taxRate}%)`} value={formatCurrency(totals.taxAmount, currency)} />
      )}
      <div className="flex justify-between font-bold pt-2 border-t border-brand-accent text-base">
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
