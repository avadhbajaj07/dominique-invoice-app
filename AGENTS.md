# AGENTS.md — AI Agent Guide
> Read this FIRST before touching any file.

## What This Is
Branded invoice web app for **Vellutini Dynamic Tutoring** (client: Dominique Vellutini).
Built by Maruti Digital (marutidigital.in) as a reusable template.

## Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Vercel-native, API routes |
| Styling | Tailwind CSS | Utility-first, mobile-first |
| Database | Supabase (Postgres) | Customers, invoices, services |
| PDF | @react-pdf/renderer | Works in Vercel serverless |
| Email | Nodemailer + Hostinger SMTP | No third-party, client's own email |
| Deploy | Vercel | `invoice.dominiquevellutini.com` |

## The ONE Rule
**Never hardcode client data. Everything lives in `/config/client.ts`.**
If you need a name, color, price, IBAN — it comes from config. Period.

## Folder Map (where things live)
```
config/client.ts        ← ALL client-specific values (start here)
types/index.ts          ← All TypeScript interfaces
lib/supabase.ts         ← Supabase client + typed helpers
lib/pdf.ts              ← @react-pdf invoice template
lib/email.ts            ← Nodemailer transporter + send function
lib/helpers.ts          ← Invoice number gen, formatting utils
supabase/schema.sql     ← Run this once in Supabase SQL editor
app/page.tsx            ← Dashboard (recent invoices)
app/invoices/new/       ← Create invoice page
app/customers/          ← Customer list + add
app/services/           ← Service library (add/edit)
app/api/generate-pdf/   ← POST → returns PDF buffer
app/api/send-email/     ← POST → sends email with PDF attachment
components/InvoiceForm.tsx     ← Left panel: all inputs
components/InvoicePreview.tsx  ← Right panel: live branded preview
components/CustomerSelect.tsx  ← Dropdown from Supabase customers
components/ServicePicker.tsx   ← Service library picker + add new
```

## Brand (Dominique's invoice style)
- **Background:** `#FAF5F0` (warm cream)
- **Primary:** `#C17A7A` (rose/dusty pink)
- **Text:** `#1A1A1A`
- **Font:** Clean sans-serif (Inter)
- **Invoice style:** Rounded card boxes, bold INVOICE heading, rose table header

## Currency
Default: **CHF** — also supports EUR, USD, GBP (user can switch per invoice)

## Services (pre-loaded in Supabase)
- French lessons A1/A2 — 75 CHF
- French lessons B1/B2 — 85 CHF
- French lessons C1/C2 — 95 CHF
- Trial lesson (30 min) — 45 CHF
- Intensive course (90 min) — 150 CHF

## Email Template
Subject: `Invoice [NUMBER] — Vellutini Dynamic Tutoring`
Body: Auto-fills client name. PDF attached. Sent FROM hello@dominiquevellutini.com.

## Reuse For Next Client
1. Duplicate repo
2. Edit ONLY `config/client.ts`
3. Replace logo in `public/brand/logo.png`
4. Update `supabase/schema.sql` seed data
5. Deploy new Vercel project

## Commands
```bash
npm run dev          # local dev (localhost:3000)
npm run build        # production build check
npm run type-check   # catch TS errors early
```

## Env Vars Needed
See `.env.example` — copy to `.env.local` and fill in.
Never commit `.env.local` to git.
