// app/api/invoices/[id]/route.ts
// PATCH — update invoice status (draft / unpaid / paid)
// Status is independent of email sending.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const VALID_STATUSES = ['draft', 'unpaid', 'paid'] as const

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const db = createServerClient()
    const { error } = await db
      .from('invoices')
      .update({ status })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, status })
  } catch (err: any) {
    console.error('PATCH /api/invoices/[id] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
