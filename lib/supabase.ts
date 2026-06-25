// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Customer, Service, Invoice, InvoiceItem } from '@/types'

// ─── Browser client (uses anon key) ─────────
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Server client (uses service_role — API routes only) ─────
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Customers ──────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function createCustomer(
  input: Omit<Customer, 'id' | 'created_at'>
): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Services ───────────────────────────────

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('services')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Invoices ───────────────────────────────

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select(`*, customer:customers(*)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
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
  const { error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

// ─── Invoice Number Generator ────────────────

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`)
    .lt('created_at', `${year + 1}-01-01`)
  
  const seq = String((count ?? 0) + 1).padStart(3, '0')
  return `${year}${seq}`
}
