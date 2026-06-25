// types/index.ts — All shared TypeScript types

export type InvoiceStatus = 'draft' | 'unpaid' | 'paid'
export type DiscountType = 'fixed' | 'percent'
export type Currency = 'CHF' | 'EUR' | 'USD' | 'GBP'

// ─── Supabase DB Types ───────────────────────

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  currency: Currency
  is_active: boolean
  created_at: string
}

export interface InvoiceItem {
  id?: string
  invoice_id?: string
  service_id?: string | null
  description: string
  quantity: number
  rate: number
  amount: number            // computed: quantity × rate
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  customer?: Customer       // joined
  issue_date: string        // ISO date
  due_date: string | null
  status: InvoiceStatus
  currency: Currency
  tax_rate: number          // 0–100
  discount: number
  discount_type: DiscountType
  notes: string | null
  subtotal: number
  tax_amount: number
  discount_amount: number
  total: number
  items?: InvoiceItem[]     // joined
  email_sent_at: string | null  // ISO timestamp — null = not sent
  created_at: string
}

// ─── Form State (not saved to DB directly) ───

export interface InvoiceFormState {
  customer: Customer | null
  items: InvoiceItem[]
  issueDate: string
  dueDate: string
  currency: Currency
  taxRate: number
  discount: number
  discountType: DiscountType
  notes: string
  status: InvoiceStatus
}

// ─── API Payloads ────────────────────────────

export interface CreateInvoicePayload {
  customer_id: string
  items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
  issue_date: string
  due_date?: string
  currency: Currency
  tax_rate: number
  discount: number
  discount_type: DiscountType
  notes?: string
}

export interface SendEmailPayload {
  invoice_id: string
}

// ─── UI Helpers ──────────────────────────────

export interface TotalsCalc {
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
}
