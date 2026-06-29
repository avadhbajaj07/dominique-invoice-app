// config/client.ts
// ─────────────────────────────────────────────
// ALL client-specific values live here.
// Never hardcode these anywhere else in the app.
// To reuse for a new client: change only this file + logo.
// ─────────────────────────────────────────────

export const CLIENT = {
  // App password (protects the entire app — change here to update)
  appPassword: "dominique2026",

  // Identity
  name: "Dominique Vellutini",
  company: "Vellutini Dynamic Tutoring",
  tagline: "French Language Tutoring",

  // Brand
  brand: {
    primary: "#C17A7A",       // rose/dusty pink
    background: "#FAF5F0",    // warm cream
    text: "#5A0D24",          // deep burgundy used on the invoice
    border: "#0F0F0F",
    watermark: "#F5EDE5",
    tableHeader: "#C17A7A",
    tableHeaderText: "#FFFFFF",
    accent: "#E8D5C4",        // light warm tone for borders
  },

  // Contact
  contact: {
    email: "hello@dominiquevellutini.com",
    phone: "+41 79 173 26 64",
    address: "Alte Landstrasse 15",
    city: "8800 Thalwil",
    country: "Switzerland",
    website: "dominiquevellutini.com",
  },

  // Payment
  payment: {
    iban: "CH83 0023 0230 6679 3301 W",
    bic: "UBSWCHZH80A",
    bankName: "UBS Switzerland AG",
    beneficiary: "Vellutini Dynamic Tutoring",
    terms: "Payment at receipt",
  },

  // Invoice defaults
  invoice: {
    defaultCurrency: "CHF" as const,
    defaultTaxRate: 0,           // Switzerland: tutoring often 0% VAT
    defaultPaymentDays: 0,       // "at receipt" = 0 days
    numberPrefix: "",            // e.g. "" → "2026001" or "DVT" → "DVT2026001"
    brandMark: {
      top: "On",
      middle: "Top",
      bottom: "Things",
    },
    footerNote: "I thank you for your trust.",
    footerNote2: "I remain at your disposal should you have any query.",
  },

  // Email template
  email: {
    fromName: "Vellutini Dynamic Tutoring",
    fromAddress: "hello@dominiquevellutini.com",
    subjectTemplate: "Your Invoice from Vellutini Dynamic Tutoring — {SERVICES_SUMMARY}",
    bodyTemplate: `Dear {CLIENT_FIRST_NAME},

Please find attached your invoice for the following session:

{SERVICES_SUMMARY}
{SESSION_DATE}
Total: {TOTAL}

If you have any questions regarding the invoice, please feel free to reply to this email.

Thank you.

Kind regards,

Dominique Vellutini
O TO T
hello@dominiquevellutini.com`,
  },

  // Pre-built services (seeded into Supabase on first run)
  // Users can add more from the app — they save to Supabase
  defaultServices: [
    {
      name: "French Lessons A1/A2",
      description: "Beginner French — 45 min session",
      price: 75,
      currency: "CHF",
    },
    {
      name: "French Lessons B1/B2",
      description: "Intermediate French — 45 min session",
      price: 85,
      currency: "CHF",
    },
    {
      name: "French Lessons C1/C2",
      description: "Advanced French — 45 min session",
      price: 95,
      currency: "CHF",
    },
    {
      name: "Trial Lesson",
      description: "Introductory session — 30 min",
      price: 45,
      currency: "CHF",
    },
    {
      name: "Intensive Course",
      description: "Extended session — 90 min",
      price: 150,
      currency: "CHF",
    },
  ],

  // Supported currencies
  currencies: ["CHF", "EUR", "USD", "GBP"] as const,
}

export type Currency = typeof CLIENT.currencies[number]
