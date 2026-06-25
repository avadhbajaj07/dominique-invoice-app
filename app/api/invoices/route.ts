// app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { calcTotals } from '@/lib/helpers'
import type { CreateInvoicePayload, InvoiceItem } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createServerClient()
  const { data, error } = await db
    .from('invoices')
    .select(`*, customer:customers(name, email)`)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body: CreateInvoicePayload = await req.json()
  const db = createServerClient()

  // Determine invoice number
  let invoice_number = body.invoice_number?.trim()
  if (!invoice_number) {
    const year = new Date().getFullYear()
    const { count } = await db
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01`)

    const seq = String((count ?? 0) + 1).padStart(3, '0')
    invoice_number = `${year}${seq}`
  } else {
    const { data: existing } = await db
      .from('invoices')
      .select('id')
      .eq('invoice_number', invoice_number)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: `Invoice number ${invoice_number} already exists.` }, { status: 400 })
    }
  }

  // Calculate totals server-side (source of truth)
  const { subtotal, discountAmount, taxAmount, total } = calcTotals(
    body.items as InvoiceItem[],
    body.tax_rate,
    body.discount,
    body.discount_type
  )

  // Insert invoice
  const { data: invoice, error: invoiceError } = await db
    .from('invoices')
    .insert({
      invoice_number,
      customer_id: body.customer_id,
      issue_date: body.issue_date,
      due_date: body.due_date ?? null,
      status: 'draft',
      currency: body.currency,
      tax_rate: body.tax_rate,
      discount: body.discount,
      discount_type: body.discount_type,
      notes: body.notes ?? null,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total,
    })
    .select()
    .single()

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 500 })
  }

  // Insert line items
  const itemsToInsert = body.items.map(item => ({
    invoice_id: invoice.id,
    service_id: item.service_id ?? null,
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    amount: item.quantity * item.rate,
  }))

  const { error: itemsError } = await db.from('invoice_items').insert(itemsToInsert)
  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  return NextResponse.json({ ...invoice, invoice_number }, { status: 201 })
}
