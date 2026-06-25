'use client'
// components/InvoicePreview.tsx
// Live preview matching the Canva reference invoice style — full A4 page.

import { CLIENT } from '@/config/client'
import type { InvoiceFormState, TotalsCalc } from '@/types'
import { formatCurrency, formatDate } from '@/lib/helpers'

interface Props {
  form: InvoiceFormState
  totals: TotalsCalc
  invoiceNumber: string
}

const ROSE = CLIENT.brand.primary
const PAPER = CLIENT.brand.background
const INK = CLIENT.brand.text
const BORDER = CLIENT.brand.border
const WATERMARK = CLIENT.brand.watermark

export default function InvoicePreview({ form, totals, invoiceNumber }: Props) {
  const { customer, items, issueDate, dueDate, currency, taxRate, discount, discountType } = form
  const issue = issueDate ? formatDate(issueDate).toUpperCase() : '-'
  const due = dueDate ? formatDate(dueDate).toUpperCase() : issue

  return (
    <div
      className="max-w-full overflow-hidden rounded-[2px] border shadow-sm @container"
      style={{ backgroundColor: PAPER, borderColor: CLIENT.brand.accent, color: INK, containerType: 'inline-size' }}
    >
      <div className="aspect-[595/842] w-full min-w-0 overflow-hidden font-sans relative flex flex-col">

        {/* ── Main content area ── */}
        <div className="flex-1 px-[6.7%] pt-[5.9%]">

          {/* Header: INVOICE + Brand Mark */}
          <div className="mb-[3.0%] flex items-start justify-between">
            <h2
              className="text-[6.5cqw] font-bold uppercase leading-none tracking-[0.07em] mt-[2.5%] mb-[1.5%]"
              style={{ color: ROSE }}
            >
              Invoice
            </h2>
            <BrandMark />
          </div>

          {/* Meta box: Invoice No / Date / Due Date */}
          <div
            className="mb-[3.0%] grid min-w-0 grid-cols-3 rounded-[12px] border-[1.6px] px-[3.36%] py-[1.8%]"
            style={{ borderColor: BORDER }}
          >
            <MetaItem label="Invoice No:" value={invoiceNumber} />
            <MetaItem label="Invoice Date:" value={issue} />
            <MetaItem label="Due Date:" value={due} />
          </div>

          {/* Invoice To */}
          <section className="mb-[3.0%]">
            <p className="mb-[1.5%] text-[2.69cqw] font-extrabold uppercase leading-none">
              Invoice To:
            </p>
            <p className="mb-[1.0%] text-[4.2cqw] font-extrabold uppercase leading-none" style={{ color: ROSE }}>
              {customer ? customer.name : 'Client Name'}
            </p>
            <p className="break-words text-[2.35cqw] leading-[1.33]">
              Payable: {CLIENT.payment.terms} to{' '}
              <strong>{CLIENT.payment.beneficiary}</strong>
            </p>
            {customer?.email && <p className="mt-[0.5%] text-[2.18cqw] leading-[1.4]">{customer.email}</p>}
            {customer?.address && <p className="mt-[0.5%] text-[2.18cqw] leading-[1.4]">{customer.address}</p>}
          </section>

          {/* Items Table */}
          <section className="mb-[3.0%]">
            {/* Table header row */}
            <div className="grid grid-cols-[1fr_23.5%] items-stretch">
              <div
                className="grid min-w-0 grid-cols-[220fr_80fr_45fr] rounded-[12px] border-[1.6px] px-[3.36%] py-[2.01%] text-[2.35cqw] font-extrabold uppercase leading-none"
                style={{ borderColor: BORDER }}
              >
                <span>Descriptions</span>
                <span className="text-center">Price</span>
                <span className="text-center">Qty</span>
              </div>
              <div
                className="-ml-[1px] rounded-[12px] border-[1.6px] px-1 py-[2.01%] text-center text-[2.35cqw] font-extrabold uppercase text-white"
                style={{ backgroundColor: ROSE, borderColor: BORDER }}
              >
                Amount
              </div>
            </div>

            {/* Table body */}
            <div
              className="relative -mt-[1px] min-h-[28cqw] overflow-hidden rounded-[20px] border-[1.6px] px-[3.36%] py-[3.0%]"
              style={{ borderColor: BORDER }}
            >
              <Watermark />
              {items.length === 0 ? (
                <p className="relative text-center text-[2.35cqw]" style={{ color: ROSE }}>
                  Add services to see them here
                </p>
              ) : (
                <div className="relative space-y-[2cqw]">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-[220fr_80fr_45fr_107fr] items-start text-[2.35cqw] leading-none mb-[2.01%] last:mb-0">
                      <span className="font-semibold uppercase truncate">{item.description || '-'}</span>
                      <span className="text-center truncate">{formatCurrency(item.rate, currency)}</span>
                      <span className="text-center truncate">{item.quantity}</span>
                      <span className="text-right truncate">{formatCurrency(item.amount, currency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Subtotals (if discount or tax) */}
          {(totals.discountAmount > 0 || taxRate > 0) && (
            <div className="mb-[3.36%] ml-auto w-[36%] space-y-[0.8cqw] text-[2.35cqw]">
              <SubRow label="Subtotal" value={formatCurrency(totals.subtotal, currency)} />
              {totals.discountAmount > 0 && (
                <SubRow
                  label={`Discount${discountType === 'percent' ? ` (${discount}%)` : ''}`}
                  value={`-${formatCurrency(totals.discountAmount, currency)}`}
                />
              )}
              {taxRate > 0 && <SubRow label={`Tax (${taxRate}%)`} value={formatCurrency(totals.taxAmount, currency)} />}
            </div>
          )}

          {/* Payment Details + Total */}
          <div className="mb-[3.36%] grid grid-cols-[1fr_37%] gap-[3.36%]">
            <div className="pt-[2.35%]">
              <p className="mb-[2.01%] text-[2.35cqw] font-extrabold uppercase leading-none">
                Payment Details
              </p>
              <p className="break-words text-[2.35cqw] leading-[1.33]">IBAN: {CLIENT.payment.iban}</p>
              <p className="break-words text-[2.35cqw] leading-[1.33]">BIC: {CLIENT.payment.bic}</p>
            </div>
            <div
              className="flex h-[13.4cqw] items-end justify-between rounded-[10px] border-[1.6px] px-[3.36%] pb-[3.36%] text-white"
              style={{ backgroundColor: ROSE, borderColor: BORDER }}
            >
              <span className="text-[2.52cqw] font-extrabold uppercase leading-none">Total</span>
              <span className="text-[2.52cqw] font-extrabold leading-none">{formatCurrency(totals.total, currency)}</span>
            </div>
          </div>

        </div>

        {/* ── Footer (dark background bar at bottom) ── */}
        <footer
          className="mt-auto grid grid-cols-[1.2fr_1fr] gap-[8%] px-[6.7%] py-[3.36%] rounded-t-[20px]"
          style={{ backgroundColor: INK }}
        >
          <p className="text-[2.18cqw] font-extrabold uppercase italic leading-[1.38] text-white">
            {CLIENT.invoice.footerNote2}
          </p>
          <div>
            <p className="mb-[1.0%] text-[2.35cqw] font-extrabold uppercase leading-none text-white">Contact Us</p>
            <p className="break-words text-[2.01cqw] leading-[1.5]" style={{ color: ROSE }}>Email: {CLIENT.contact.email}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

function BrandMark() {
  return (
    <img
      src="/brand/logo.png"
      alt="Logo"
      className="w-[18%] max-h-[14cqw] object-contain"
    />
  )
}

function Watermark() {
  return (
    <img
      src="/brand/logo.png"
      alt="Watermark"
      className="pointer-events-none absolute left-[25%] top-[10%] w-[50%] h-[80%] object-contain opacity-[0.05]"
    />
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-[4%] text-[2.18cqw] font-extrabold uppercase leading-none">{label}</p>
      <p className="text-[2.18cqw] uppercase leading-none">{value}</p>
    </div>
  )
}

function SubRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
