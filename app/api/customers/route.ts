// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createServerClient()
  const { data, error } = await db
    .from('customers')
    .select('*')
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = createServerClient()
  const { data, error } = await db
    .from('customers')
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { customer_id } = await req.json()
  if (!customer_id) return NextResponse.json({ error: 'customer_id is required' }, { status: 400 })

  const db = createServerClient()

  // Find all invoices for this customer
  const { data: invoices, error: fetchError } = await db
    .from('invoices')
    .select('id')
    .eq('customer_id', customer_id)
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const invoiceIds = (invoices ?? []).map(inv => inv.id)

  // Delete invoice items for those invoices
  if (invoiceIds.length > 0) {
    const { error: itemsError } = await db
      .from('invoice_items')
      .delete()
      .in('invoice_id', invoiceIds)
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  // Delete invoices
  const { error: invoicesError } = await db
    .from('invoices')
    .delete()
    .eq('customer_id', customer_id)
  if (invoicesError) return NextResponse.json({ error: invoicesError.message }, { status: 500 })

  // Delete the customer
  const { error: customerError } = await db
    .from('customers')
    .delete()
    .eq('id', customer_id)
  if (customerError) return NextResponse.json({ error: customerError.message }, { status: 500 })

  return NextResponse.json({ success: true, deleted_invoices: invoiceIds.length })
}
