'use client'
// components/InvoiceForm.tsx
// Left panel: all inputs. No hardcoded values — uses config/client.ts

import { useState } from 'react'
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

type Tab = 'details' | 'discount' | 'tax' | 'currency'

export default function InvoiceForm({ form, onChange, totals }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('details')

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
    <div className="min-w-0 overflow-hidden rounded-xl border border-brand-accent bg-white">
      
      {/* ── Tabs ── */}
      <div className="flex border-b border-brand-accent">
        {(['details', 'discount', 'tax', 'currency'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-light'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">

        {/* ── DETAILS TAB ── */}
        {activeTab === 'details' && (
          <>
            {/* Client */}
            <div>
              <label className="field-label">Client</label>
              <CustomerSelect
                value={form.customer}
                onChange={c => set({ customer: c })}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">Issue Date</label>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={e => set({ issueDate: e.target.value })}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Due Date <span className="text-gray-400">(optional)</span></label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => set({ dueDate: e.target.value })}
                  className="field-input"
                />
              </div>
            </div>

            {/* Services / Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="field-label mb-0">Services</label>
                <button
                  onClick={addBlankItem}
                  className="text-xs text-brand-primary hover:underline"
                >
                  + Add line
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
              {form.items.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-start p-2 bg-brand-light rounded-lg">
                      <div className="flex-1">
                        <input
                          value={item.description}
                          onChange={e => updateItem(i, { description: e.target.value })}
                          placeholder="Description"
                          className="field-input mb-1"
                        />
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="field-label">Qty</label>
                            <input
                              type="number"
                              value={item.quantity}
                              min={0.5}
                              step={0.5}
                              onChange={e => updateItem(i, { quantity: Number(e.target.value) })}
                              className="field-input"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="field-label">Rate ({form.currency})</label>
                            <input
                              type="number"
                              value={item.rate}
                              min={0}
                              onChange={e => updateItem(i, { rate: Number(e.target.value) })}
                              className="field-input"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="field-label">Amount</label>
                            <div className="field-input bg-gray-50 text-gray-600">
                              {formatCurrency(item.amount, form.currency)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(i)}
                        className="mt-1 text-gray-400 hover:text-red-400 text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="field-label">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => set({ notes: e.target.value })}
                rows={2}
                className="field-input resize-none"
                placeholder={CLIENT.invoice.footerNote}
              />
            </div>

            {/* Totals summary */}
            <TotalsSummary totals={totals} currency={form.currency} taxRate={form.taxRate} discount={form.discount} discountType={form.discountType} />
          </>
        )}

        {/* ── DISCOUNT TAB ── */}
        {activeTab === 'discount' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Apply a discount to the invoice subtotal.</p>
            <div>
              <label className="field-label">Discount Type</label>
              <div className="flex gap-2">
                {(['fixed', 'percent'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => set({ discountType: t })}
                    className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                      form.discountType === t
                        ? 'border-brand-primary text-brand-primary bg-brand-light'
                        : 'border-brand-accent text-gray-500'
                    }`}
                  >
                    {t === 'fixed' ? `Fixed (${form.currency})` : 'Percentage (%)'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="field-label">
                Discount {form.discountType === 'percent' ? '(%)' : `(${form.currency})`}
              </label>
              <input
                type="number"
                value={form.discount}
                min={0}
                max={form.discountType === 'percent' ? 100 : undefined}
                onChange={e => set({ discount: Number(e.target.value) })}
                className="field-input"
              />
            </div>
            <TotalsSummary totals={totals} currency={form.currency} taxRate={form.taxRate} discount={form.discount} discountType={form.discountType} />
          </div>
        )}

        {/* ── TAX TAB ── */}
        {activeTab === 'tax' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Tax applies after any discount.</p>
            <div>
              <label className="field-label">Tax Rate (%)</label>
              <input
                type="number"
                value={form.taxRate}
                min={0}
                max={100}
                step={0.5}
                onChange={e => set({ taxRate: Number(e.target.value) })}
                className="field-input"
              />
            </div>
            <div className="p-3 bg-brand-light rounded-lg text-sm text-gray-600">
              Note: Private tutoring in Switzerland is often VAT-exempt. Set to 0 if unsure.
            </div>
            <TotalsSummary totals={totals} currency={form.currency} taxRate={form.taxRate} discount={form.discount} discountType={form.discountType} />
          </div>
        )}

        {/* ── CURRENCY TAB ── */}
        {activeTab === 'currency' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Select currency for this invoice.</p>
            <div className="grid grid-cols-2 gap-2">
              {CLIENT.currencies.map(c => (
                <button
                  key={c}
                  onClick={() => set({ currency: c })}
                  className={`py-3 rounded-lg text-sm font-medium border transition-colors ${
                    form.currency === c
                      ? 'border-brand-primary text-brand-primary bg-brand-light'
                      : 'border-brand-accent text-gray-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Totals Summary ──────────────────────────

function TotalsSummary({ totals, currency, taxRate, discount, discountType }: {
  totals: TotalsCalc
  currency: any
  taxRate: number
  discount: number
  discountType: string
}) {
  return (
    <div className="border-t border-brand-accent pt-3 space-y-1">
      <Row label="Subtotal" value={formatCurrency(totals.subtotal, currency)} />
      {totals.discountAmount > 0 && (
        <Row label={`Discount${discountType === 'percent' ? ` (${discount}%)` : ''}`} value={`−${formatCurrency(totals.discountAmount, currency)}`} />
      )}
      {taxRate > 0 && (
        <Row label={`Tax (${taxRate}%)`} value={formatCurrency(totals.taxAmount, currency)} />
      )}
      <div className="flex justify-between font-bold pt-1 border-t border-brand-accent">
        <span>Total</span>
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
