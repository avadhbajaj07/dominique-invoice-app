# SKILLS.md — AI Coding Patterns (Save Tokens)

> How to use AI agents efficiently on this project.
> Give these patterns to Claude/Cursor/Copilot at the start of each task.

---

## The Golden Prompt Template
```
Context: Invoice app for Vellutini Dynamic Tutoring.
Read: CLAUDE.md → ARCHITECTURE.md → relevant lib file
Task: [specific task]
Rules:
- Use config/client.ts for all client values
- Use types from types/index.ts
- No new packages without asking
- Mobile-first (375px base)
Output: Only the file(s) that change
```

---

## Skill: Add a New API Route
```
Prompt:
"Add GET /api/invoices route.
- Uses lib/supabase.ts server client
- Returns Invoice[] type from types/index.ts
- Joins customer name
- Orders by created_at DESC
- No new packages"
```

## Skill: Build a Form Component
```
Prompt:
"Build CustomerSelect component.
- Fetches from /api/customers on mount
- Searchable input (filter by name)
- Shows name + email in dropdown
- On select: calls onSelect(customer: Customer)
- Uses Tailwind only, brand colors from config/client.ts
- Mobile friendly"
```

## Skill: Fix a Bug
```
Prompt:
"Bug: [describe what's wrong]
File: [filename]
Expected: [what should happen]
Actual: [what's happening]
Do NOT rewrite the whole file. Fix only the broken part."
```

## Skill: Add a Feature to Existing Component
```
Prompt:
"In InvoiceForm.tsx, add discount tab.
- Toggle: Fixed amount (CHF) or Percentage (%)
- Input field for value
- Updates state.discount and state.discountType
- InvoicePreview auto-updates (already wired via props)
- Keep existing code structure"
```

## Skill: Generate PDF Style Update
```
Prompt:
"In lib/pdf.ts, update the invoice table header color.
Currently: gray. Should be: #C17A7A (from CLIENT.brand.primary)
Import CLIENT from config/client.ts.
Change only the header row style."
```

---

## Token-Saving Rules

| Rule | Why |
|---|---|
| Always say "only change [file]" | Prevents full rewrites |
| Reference types/index.ts | Prevents type drift |
| Say "no new packages" | Prevents package bloat |
| Give file path, not file name | No confusion |
| Show the error, not your guess | AI fixes actual problem |
| One task per prompt | Keeps context tight |

---

## Reuse Checklist (New Client)
When reusing this for a new client, prompt:
```
"Update config/client.ts for new client:
Name: [name]
Company: [company]
Brand primary: [hex]
Brand background: [hex]
IBAN: [iban]
Email: [email]
Address: [address]
Services: [list with prices]
Do NOT change any other file."
```
Then re-deploy. That's it.

---

## Common Gotchas
- Supabase `anon` key = public (safe in browser)
- Supabase `service_role` key = private (API routes only, never client)
- Nodemailer `port 587` = STARTTLS (Hostinger default)
- `@react-pdf/renderer` cannot use Tailwind — use its own StyleSheet API
- PDF fonts: only embed safe web fonts or use react-pdf built-ins
