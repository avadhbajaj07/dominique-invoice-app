// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Customer, Service, Invoice, InvoiceItem } from '@/types'

// ─── Browser client (uses anon key) ─────────
// Lazy-initialized to avoid crashing at build time when env vars are absent
let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

// Kept for backward compatibility — lazily resolves on first property access
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getSupabase() as any)[prop]
  },
})

// ─── Server client (uses service_role — API routes only) ─────
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Customers ──────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await getSupabase()
    .from('customers')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function createCustomer(
  input: Omit<Customer, 'id' | 'created_at'>
): Promise<Customer> {
  const { data, error } = await getSupabase()
    .from('customers')
    .insert(input as any)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Services ───────────────────────────────

export async function getServices(): Promise<Service[]> {
  const { data, error } = await getSupabase()
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function createService(
  input: Omit<Service, 'id' | 'created_at'>
): Promise<Service> {
  const { data, error } = await getSupabase()
    .from('services')
    .insert(input as any)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Invoices ───────────────────────────────

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await getSupabase()
    .from('invoices')
    .select(`*, customer:customers(*)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const { data, error } = await getSupabase()
    .from('invoices')
    .select(`*, customer:customers(*), items:invoice_items(*)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function updateInvoiceStatus(
  id: string,
  status: Invoice['status']
): Promise<void> {
  const { error } = await (getSupabase()
    .from('invoices') as any)
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

// ─── Invoice Number Generator ────────────────

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const { count } = await getSupabase()
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`)
    .lt('created_at', `${year + 1}-01-01`)
  
  const seq = String((count ?? 0) + 1).padStart(3, '0')
  return `${year}${seq}`
}
