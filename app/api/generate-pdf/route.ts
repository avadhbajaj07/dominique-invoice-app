// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generateInvoicePDF } from '@/lib/pdf'
import type { Invoice } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { invoice_id, invoice: customInvoice } = body

    let invoiceObj = customInvoice

    if (!invoiceObj) {
      if (!invoice_id) {
        return NextResponse.json({ error: 'invoice_id or invoice object required' }, { status: 400 })
      }

      const db = createServerClient()

      // Fetch invoice with customer and items
      const { data: invoice, error } = await db
        .from('invoices')
        .select(`*, customer:customers(*), items:invoice_items(*)`)
        .eq('id', invoice_id)
        .single()

      if (error || !invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }
      invoiceObj = invoice
    }

    const pdfBuffer = await generateInvoicePDF(invoiceObj as Invoice)
    const filename = invoiceObj.invoice_number ? `Invoice-${invoiceObj.invoice_number}.pdf` : 'Invoice.pdf'

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
