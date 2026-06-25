-- supabase/schema.sql
-- ──────────────────────────────────────────────
-- Run this ONCE in your Supabase SQL editor.
-- Creates all tables + seeds default services.
-- ──────────────────────────────────────────────

-- Enable UUID extension (usually already on)
create extension if not exists "uuid-ossp";

-- ─── CUSTOMERS ────────────────────────────────
create table if not exists customers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text,
  phone       text,
  address     text,
  created_at  timestamptz default now()
);

-- ─── SERVICES ─────────────────────────────────
create table if not exists services (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  price       numeric(10, 2) not null,
  currency    text default 'CHF',
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ─── INVOICES ─────────────────────────────────
create table if not exists invoices (
  id                uuid primary key default uuid_generate_v4(),
  invoice_number    text unique not null,
  customer_id       uuid references customers(id) on delete restrict,
  issue_date        date not null,
  due_date          date,
  status            text default 'draft' check (status in ('draft','sent','paid')),
  currency          text default 'CHF',
  tax_rate          numeric(5, 2) default 0,
  discount          numeric(10, 2) default 0,
  discount_type     text default 'fixed' check (discount_type in ('fixed','percent')),
  notes             text,
  subtotal          numeric(10, 2) not null default 0,
  tax_amount        numeric(10, 2) not null default 0,
  discount_amount   numeric(10, 2) not null default 0,
  total             numeric(10, 2) not null default 0,
  created_at        timestamptz default now()
);

-- ─── INVOICE ITEMS ────────────────────────────
create table if not exists invoice_items (
  id          uuid primary key default uuid_generate_v4(),
  invoice_id  uuid references invoices(id) on delete cascade,
  service_id  uuid references services(id) on delete set null,
  description text not null,
  quantity    numeric(10, 2) default 1,
  rate        numeric(10, 2) not null,
  amount      numeric(10, 2) not null
);

-- ─── ROW LEVEL SECURITY ───────────────────────
-- Enable RLS (basic: allow all for now, lock down later with auth)
alter table customers enable row level security;
alter table services enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- Allow all operations for now (use service_role key server-side)
create policy "Allow all" on customers for all using (true) with check (true);
create policy "Allow all" on services for all using (true) with check (true);
create policy "Allow all" on invoices for all using (true) with check (true);
create policy "Allow all" on invoice_items for all using (true) with check (true);

-- ─── SEED: DEFAULT SERVICES ───────────────────
-- Only insert if table is empty (safe to re-run)
insert into services (name, description, price, currency)
select * from (values
  ('French Lessons A1/A2', 'Beginner French — 45 min session',      75.00, 'CHF'),
  ('French Lessons B1/B2', 'Intermediate French — 45 min session',  85.00, 'CHF'),
  ('French Lessons C1/C2', 'Advanced French — 45 min session',      95.00, 'CHF'),
  ('Trial Lesson',         'Introductory session — 30 min',         45.00, 'CHF'),
  ('Intensive Course',     'Extended session — 90 min',            150.00, 'CHF')
) as v(name, description, price, currency)
where not exists (select 1 from services limit 1);

-- ─── USEFUL VIEWS ─────────────────────────────
create or replace view invoices_with_customer as
select
  i.*,
  c.name    as customer_name,
  c.email   as customer_email,
  c.phone   as customer_phone,
  c.address as customer_address
from invoices i
left join customers c on c.id = i.customer_id
order by i.created_at desc;
