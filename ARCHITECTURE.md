# ARCHITECTURE.md — How It All Connects

## Data Flow: Create Invoice
```
User fills InvoiceForm
    → CustomerSelect (from Supabase customers table)
    → ServicePicker (from Supabase services table, or add new)
    → Discount / Tax / Currency tabs
    → InvoicePreview updates live (no API call)
    
Save button
    → POST /api/invoices → insert to Supabase invoices + invoice_items
    → Returns invoice ID

PDF button
    → POST /api/generate-pdf { invoiceId }
    → Fetches invoice from Supabase
    → @react-pdf/renderer generates PDF buffer
    → Returns as application/pdf download

Send Email button
    → POST /api/generate-pdf → get PDF buffer
    → POST /api/send-email { invoiceId, pdfBuffer }
    → Nodemailer attaches PDF, sends via Hostinger SMTP
    → Updates invoice status → 'sent' in Supabase
```

## Supabase Tables
```
customers
  id, name, email, phone, address, created_at

services
  id, name, description, price, currency, is_active, created_at
  (user can add new services; they persist for future invoices)

invoices
  id, invoice_number, customer_id (FK), issue_date, due_date,
  status (draft|sent|paid), currency, tax_rate, discount,
  discount_type (fixed|percent), notes, subtotal, tax_amount,
  discount_amount, total, created_at

invoice_items
  id, invoice_id (FK), service_id (FK nullable), description,
  quantity, rate, amount
```

## API Routes
| Route | Method | Purpose |
|---|---|---|
| /api/invoices | GET | List all invoices |
| /api/invoices | POST | Create invoice + items |
| /api/invoices/[id] | GET | Single invoice with items + customer |
| /api/invoices/[id] | PATCH | Update status |
| /api/customers | GET | List all customers |
| /api/customers | POST | Add customer |
| /api/services | GET | List active services |
| /api/services | POST | Add new service |
| /api/generate-pdf | POST | Generate branded PDF buffer |
| /api/send-email | POST | Send invoice email with PDF |

## Component Tree
```
app/invoices/new/page.tsx
├── InvoiceForm (left panel — all inputs)
│   ├── CustomerSelect (searchable dropdown)
│   ├── ServicePicker (library + add new)
│   ├── LineItems (qty × rate rows)
│   └── Totals (discount + tax + total)
└── InvoicePreview (right panel — live PDF preview)
    └── BrandedTemplate (matches client's invoice style)
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     ← server-side only

SMTP_HOST=mail.hostinger.com
SMTP_PORT=587
SMTP_USER=hello@dominiquevellutini.com
SMTP_PASS=                     ← Hostinger email password
SMTP_FROM=hello@dominiquevellutini.com
```

## PDF Design (matches brand invoice)
- A4 size, cream background (#FAF5F0)
- Header: big bold "INVOICE" in rose (#C17A7A), logo right
- Info boxes: invoice no, date, due date — rounded corners
- "INVOICE TO:" section with client name large and bold
- Table: Description | Price | Qty | Amount
- Table header row: rose background, white text
- Payment box: IBAN + BIC
- Total box: rose background
- Footer: "I remain at your disposal should you have any query."

## Invoice Number Format
`YYYYNNN` → e.g. `2026001`, `2026002`
Auto-increments based on count in Supabase for that year.
