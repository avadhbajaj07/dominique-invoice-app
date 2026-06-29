// lib/helpers.ts
import type { Currency, InvoiceItem, TotalsCalc } from '@/types'
import { CLIENT } from '@/config/client'

// ─── Currency Formatting ─────────────────────

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CHF: 'CHF',
  EUR: '€',
  USD: '$',
  GBP: '£',
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  const formatted = amount.toFixed(2)
  // CHF goes after: "85.00 CHF" (Swiss convention)
  if (currency === 'CHF') return `${formatted} CHF`
  // Others go before: "€85.00"
  return `${symbol}${formatted}`
}

// ─── Date Formatting ─────────────────────────

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Totals Calculation ───────────────────────

export function calcTotals(
  items: InvoiceItem[],
  taxRate: number,
  discount: number,
  discountType: 'fixed' | 'percent'
): TotalsCalc {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)

  const discountAmount =
    discountType === 'percent'
      ? (subtotal * discount) / 100
      : Math.min(discount, subtotal)

  const taxable = subtotal - discountAmount
  const taxAmount = (taxable * taxRate) / 100
  const total = taxable + taxAmount

  return {
    subtotal,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

// ─── Status Badge Styles ─────────────────────

export function statusColor(status: string): string {
  switch (status) {
    case 'paid':    return 'bg-green-100 text-green-700'
    case 'unpaid':  return 'bg-amber-100 text-amber-700'
    default:        return 'bg-gray-100 text-gray-600'
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'paid':    return 'Paid'
    case 'unpaid':  return 'Unpaid'
    default:        return 'Draft'
  }
}

// ─── Share URL Builders ──────────────────────

interface ShareableInvoice {
  invoice_number: string
  issue_date: string
  currency: Currency
  total: number
  items?: { description: string }[]
  customer?: { name?: string; email?: string | null; phone?: string | null } | null
}

/** Extract and title-case first name from full name */
function extractFirstName(fullName: string): string {
  const raw = fullName.trim().split(/\s+/)[0] || 'Client'
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

/**
 * Build a mailto: URL for Gmail / default email client.
 * Pre-fills To, Subject, and Body using CLIENT.email config.
 */
export function buildGmailShareUrl(invoice: ShareableInvoice): string {

  const customerName = invoice.customer?.name ?? 'Client'
  const clientFirstName = extractFirstName(customerName)
  const servicesSummary = invoice.items?.map(i => i.description).join(', ') || 'French lessons'
  const sessionDate = formatDate(invoice.issue_date)
  const totalStr = formatCurrency(invoice.total, invoice.currency)

  const subject = CLIENT.email.subjectTemplate
    .replace('{SERVICES_SUMMARY}', servicesSummary)

  const body = CLIENT.email.bodyTemplate
    .replace(/{CLIENT_FIRST_NAME}/g, clientFirstName)
    .replace('{SERVICES_SUMMARY}', servicesSummary)
    .replace('{SESSION_DATE}', sessionDate)
    .replace('{TOTAL}', totalStr)

  const to = invoice.customer?.email ?? ''
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
