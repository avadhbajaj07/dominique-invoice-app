# TASKS.md — Build Status

## Current Sprint: Foundation

### ✅ Done
- [x] Project architecture planned
- [x] Client config (`config/client.ts`)
- [x] TypeScript types (`types/index.ts`)
- [x] Supabase schema (`supabase/schema.sql`)
- [x] Supabase client helper (`lib/supabase.ts`)
- [x] PDF generation logic (`lib/pdf.ts`)
- [x] Email send logic (`lib/email.ts`)
- [x] Helper utils (`lib/helpers.ts`)
- [x] API: generate-pdf route
- [x] API: send-email route
- [x] API: customers CRUD
- [x] API: services CRUD
- [x] API: invoices CRUD

### 🔲 Todo (build in this order)
- [ ] `app/layout.tsx` — root layout with nav
- [ ] `app/page.tsx` — dashboard (invoice list, stats)
- [ ] `components/CustomerSelect.tsx` — searchable dropdown
- [ ] `components/ServicePicker.tsx` — service library + add new
- [ ] `components/InvoicePreview.tsx` — live branded preview
- [ ] `components/InvoiceForm.tsx` — full form (left panel)
- [ ] `app/invoices/new/page.tsx` — assemble form + preview
- [ ] `app/customers/page.tsx` — customer list + add form
- [ ] `app/services/page.tsx` — service library manager
- [ ] Mobile responsive pass (test at 375px)
- [ ] End-to-end test: create → preview → PDF → email

### 🔲 Backlog
- [ ] Invoice edit page (`app/invoices/[id]/page.tsx`)
- [ ] Status filter on dashboard (draft / sent / paid)
- [ ] Invoice duplicate feature
- [ ] Monthly revenue stats on dashboard
- [ ] French language toggle for invoice output

## Current Task for AI Agent
> Build `app/layout.tsx` first, then `app/page.tsx` dashboard.
> Use only values from `config/client.ts`. No hardcoded strings.
> Check `ARCHITECTURE.md` for data flow before writing any component.
