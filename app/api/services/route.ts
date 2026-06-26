// app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createServerClient()
  const { data, error } = await db
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = createServerClient()
  const { data, error } = await db
    .from('services')
    .insert({ ...body, is_active: true })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'Service id is required' }, { status: 400 })

  const db = createServerClient()
  const { data, error } = await db
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { service_id } = await req.json()
  if (!service_id) return NextResponse.json({ error: 'service_id is required' }, { status: 400 })

  const db = createServerClient()
  const { error } = await db
    .from('services')
    .delete()
    .eq('id', service_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
