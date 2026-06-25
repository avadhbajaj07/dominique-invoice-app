// lib/email.ts
// Send invoice emails via Hostinger SMTP using Nodemailer.
// No third-party services. Sends from hello@dominiquevellutini.com

import nodemailer from 'nodemailer'
import { CLIENT } from '@/config/client'
import type { Invoice } from '@/types'
import { formatCurrency } from './helpers'

// ─── Transporter (Hostinger SMTP — SSL on port 465) ────────────

function createTransporter() {
  const port = Number(process.env.SMTP_PORT) || 465

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port,
    secure: port === 465,           // SSL for 465, STARTTLS for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Give serverless functions enough time
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  })
}

// ─── Build email content from template ───────

function buildEmailContent(invoice: Invoice): {
  subject: string
  textBody: string
  htmlBody: string
} {
  const customer = invoice.customer
  const clientName = customer?.name ?? 'Client'
  const currency = invoice.currency

  // Describe services (from invoice items)
  const servicesList = invoice.items ?? []
  const servicesSummary = servicesList.map(i => i.description).join(', ') || 'French lessons'

  // Subject
  const subject = CLIENT.email.subjectTemplate
    .replace('{INVOICE_NUMBER}', invoice.invoice_number)
    .replace('{SERVICES_SUMMARY}', servicesSummary)

  // ── Plain text fallback ──
  const textBody = CLIENT.email.bodyTemplate
    .replace('{CLIENT_NAME}', clientName)
    .replace('{INVOICE_NUMBER}', invoice.invoice_number)
    .replace('{SERVICES_SUMMARY}', servicesSummary)
    .replace('{TOTAL}', `${formatCurrency(invoice.total, currency)}`)
    .replace('{PAYMENT_TERMS}', CLIENT.payment.terms)
    .replace('{IBAN}', CLIENT.payment.iban)
    .replace('{BIC}', CLIENT.payment.bic)
    .replace('{PHONE}', CLIENT.contact.phone)
    .replace('{EMAIL}', CLIENT.contact.email)

  // ── Professional HTML email ──
  const ROSE = CLIENT.brand.primary
  const BG = CLIENT.brand.background
  const INK = CLIENT.brand.text

  const itemsRows = servicesList.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #E8D5C4;font-size:14px;">${item.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8D5C4;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8D5C4;font-size:14px;text-align:right;">${formatCurrency(item.rate, currency)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8D5C4;font-size:14px;text-align:right;">${formatCurrency(item.amount, currency)}</td>
    </tr>
  `).join('')

  const dueDate = invoice.due_date
    ? new Date(invoice.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'At receipt'

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:${BG};border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background-color:${ROSE};padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">
              ${CLIENT.company}
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Invoice ${invoice.invoice_number}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;color:${INK};font-size:15px;line-height:1.6;">
              Dear <strong>${clientName}</strong>,
            </p>
            <p style="margin:0 0 24px;color:${INK};font-size:15px;line-height:1.6;">
              Please find attached your invoice <strong>${invoice.invoice_number}</strong> for the following services:
            </p>

            <!-- Services Table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8D5C4;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <thead>
                <tr style="background-color:${ROSE};">
                  <th style="padding:10px 12px;color:#fff;font-size:13px;font-weight:600;text-align:left;">Service</th>
                  <th style="padding:10px 12px;color:#fff;font-size:13px;font-weight:600;text-align:center;">Qty</th>
                  <th style="padding:10px 12px;color:#fff;font-size:13px;font-weight:600;text-align:right;">Rate</th>
                  <th style="padding:10px 12px;color:#fff;font-size:13px;font-weight:600;text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Total -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="text-align:right;">
                  <div style="display:inline-block;background-color:${ROSE};color:#fff;padding:14px 28px;border-radius:10px;font-size:18px;font-weight:700;">
                    Total: ${formatCurrency(invoice.total, currency)}
                  </div>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 4px;color:${INK};font-size:14px;">
              <strong>Due:</strong> ${dueDate}
            </p>
            <p style="margin:0 0 20px;color:${INK};font-size:14px;">
              <strong>Payment terms:</strong> ${CLIENT.payment.terms}
            </p>

            <!-- Payment Details Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff;border:1px solid #E8D5C4;border-radius:10px;overflow:hidden;margin-bottom:28px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:${INK};text-transform:uppercase;">Payment Details</p>
                  <p style="margin:0 0 4px;font-size:14px;color:${INK};">
                    <strong>IBAN:</strong> ${CLIENT.payment.iban}
                  </p>
                  <p style="margin:0 0 4px;font-size:14px;color:${INK};">
                    <strong>BIC:</strong> ${CLIENT.payment.bic}
                  </p>
                  <p style="margin:0;font-size:14px;color:${INK};">
                    <strong>Beneficiary:</strong> ${CLIENT.payment.beneficiary}
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;color:${INK};font-size:15px;line-height:1.6;">
              Do not hesitate to contact me if you have any questions.
            </p>
            <p style="margin:0;color:${INK};font-size:15px;line-height:1.6;">
              Warm regards,<br>
              <strong>${CLIENT.name}</strong><br>
              <span style="color:${ROSE};">${CLIENT.company}</span><br>
              <span style="font-size:13px;">${CLIENT.contact.phone} · ${CLIENT.contact.email}</span>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:${INK};padding:18px 32px;text-align:center;">
            <p style="margin:0;color:${ROSE};font-size:12px;">
              ${CLIENT.contact.email} · ${CLIENT.contact.phone} · ${CLIENT.contact.website}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, textBody, htmlBody }
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
  const { subject, textBody, htmlBody } = buildEmailContent(invoice)

  console.log(`[Email] Sending invoice ${invoice.invoice_number} to ${customer.email}...`)

  try {
    const info = await transporter.sendMail({
      from: `"${CLIENT.email.fromName}" <${CLIENT.email.fromAddress}>`,
      to: customer.email,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: `Invoice-${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })
    console.log(`[Email] Sent successfully: ${info.messageId}`)
  } catch (err: any) {
    console.error(`[Email] Failed to send:`, err.message)
    throw err
  }
}

// ─── Verify SMTP connection (for setup check) ──

export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    return true
  } catch (err: any) {
    console.error('[Email] SMTP verify failed:', err.message)
    return false
  }
}
