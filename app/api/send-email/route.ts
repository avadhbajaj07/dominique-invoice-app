// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generateInvoicePDF } from '@/lib/pdf'
import { sendInvoiceEmail } from '@/lib/email'
import type { Invoice } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { invoice_id } = await req.json()
    if (!invoice_id) {
      return NextResponse.json({ error: 'invoice_id required' }, { status: 400 })
    }

    const db = createServerClient()

    // 1. Fetch full invoice
    const { data: invoice, error } = await db
      .from('invoices')
      .select(`*, customer:customers(*), items:invoice_items(*)`)
      .eq('id', invoice_id)
      .single()

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (!invoice.customer?.email) {
      return NextResponse.json({ error: 'Customer has no email' }, { status: 422 })
    }

    // 2. Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice as Invoice)

    // 3. Send email
    await sendInvoiceEmail(invoice as Invoice, pdfBuffer)

    // 4. Record email_sent_at timestamp (do NOT change status — that's independent)
    await db
      .from('invoices')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', invoice_id)

    return NextResponse.json({ success: true, email_sent_at: new Date().toISOString() })
  } catch (err: any) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
