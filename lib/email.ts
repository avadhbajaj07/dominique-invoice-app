// lib/email.ts
// Send invoice emails via Hostinger SMTP using Nodemailer.
// No third-party services. Sends from hello@dominiquevellutini.com

import nodemailer from 'nodemailer'
import { CLIENT } from '@/config/client'
import type { Invoice } from '@/types'

// ─── Transporter (Hostinger SMTP) ────────────

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.hostinger.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,           // STARTTLS on port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// ─── Build email content from template ───────

function buildEmailContent(invoice: Invoice): { subject: string; body: string } {
  const customer = invoice.customer
  const clientName = customer?.name ?? 'Client'

  // Describe services (from invoice items)
  const services = invoice.items?.map(i => i.description).join(', ') ?? 'French lessons'

  const subject = CLIENT.email.subjectTemplate
    .replace('{INVOICE_NUMBER}', invoice.invoice_number)

  const body = CLIENT.email.bodyTemplate
    .replace('{CLIENT_NAME}', clientName)
    .replace('{INVOICE_NUMBER}', invoice.invoice_number)
    .replace('{SERVICES_SUMMARY}', services)
    .replace('{TOTAL}', `${invoice.total.toFixed(2)} ${invoice.currency}`)
    .replace('{PAYMENT_TERMS}', CLIENT.payment.terms)
    .replace('{IBAN}', CLIENT.payment.iban)
    .replace('{BIC}', CLIENT.payment.bic)
    .replace('{PHONE}', CLIENT.contact.phone)
    .replace('{EMAIL}', CLIENT.contact.email)

  return { subject, body }
}

// ─── Send Invoice Email ───────────────────────

export async function sendInvoiceEmail(
  invoice: Invoice,
  pdfBuffer: Buffer
): Promise<void> {
  const customer = invoice.customer
  if (!customer?.email) {
    throw new Error('Customer has no email address.')
  }

  const transporter = createTransporter()
  const { subject, body } = buildEmailContent(invoice)

  await transporter.sendMail({
    from: `"${CLIENT.email.fromName}" <${CLIENT.email.fromAddress}>`,
    to: customer.email,
    subject,
    text: body,
    attachments: [
      {
        filename: `Invoice-${invoice.invoice_number}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })
}

// ─── Verify SMTP connection (for setup check) ──

export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    return true
  } catch {
    return false
  }
}
