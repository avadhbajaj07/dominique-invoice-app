import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = createServerClient()
    const year = new Date().getFullYear()

    // Count invoices starting from January 1st of the current year
    const { count, error } = await db
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01`)

    if (error) {
      throw error
    }

    const seq = String((count ?? 0) + 1).padStart(3, '0')
    const nextNumber = `${year}${seq}`

    return NextResponse.json({ nextNumber })
  } catch (err: any) {
    console.error('Error generating next invoice number:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
