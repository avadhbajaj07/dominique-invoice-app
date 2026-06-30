// lib/email.ts
// Send invoice emails via Hostinger SMTP using Nodemailer.
// No third-party services. Sends from config address

import nodemailer from 'nodemailer'
import { CLIENT } from '@/config/client'
import type { Invoice } from '@/types'
import { formatCurrency, formatDate } from './helpers'

// ─── Transporter (Hostinger SMTP — SSL on port 465) ────────────

function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com'
  const port = Number(process.env.SMTP_PORT) || 465
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user) {
    throw new Error('SMTP_USER environment variable is not defined or empty in Vercel.')
  }
  if (!pass) {
    throw new Error('SMTP_PASS environment variable is not defined or empty in Vercel.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,           // SSL for 465, STARTTLS for 587
    auth: {
      user,
      pass,
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
  const clientFullName = customer?.name ?? 'Client'
  const currency = invoice.currency

  // Extract and title-case first name (e.g., "AVADH RAJA BAJAJ" -> "Avadh")
  const clientFirstNameRaw = clientFullName.trim().split(/\s+/)[0] || 'Client'
  const clientFirstName = clientFirstNameRaw.charAt(0).toUpperCase() + clientFirstNameRaw.slice(1).toLowerCase()

  // Describe services (from invoice items)
  const servicesList = invoice.items ?? []
  const servicesSummary = servicesList.map(i => i.description).join(', ') || 'French lessons'

  // Session date (formatted invoice date)
  const sessionDate = formatDate(invoice.issue_date)

  const totalStr = formatCurrency(invoice.total, currency)

  // Subject
  const subject = CLIENT.email.subjectTemplate
    .replace('{SERVICES_SUMMARY}', servicesSummary)

  // ── Plain text fallback ──
  const textBody = CLIENT.email.bodyTemplate
    .replace(/{CLIENT_FIRST_NAME}/g, clientFirstName)
    .replace('{SERVICES_SUMMARY}', servicesSummary)
    .replace('{SESSION_DATE}', sessionDate)
    .replace('{TOTAL}', totalStr)

  // ── Professional \u0026 Branded HTML email ──
  const ROSE = CLIENT.brand.primary
  const BG = CLIENT.brand.background
  const INK = CLIENT.brand.text

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1A1A1A;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:12px;border:1px solid #E8D5C4;box-shadow:0 4px 12px rgba(0,0,0,0.03);text-align:left;">
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#1A1A1A;">Dear ${clientFirstName},</p>
              
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1A1A1A;">Please find attached your invoice for the following session:</p>
              
              <!-- Summary Card Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};border-radius:8px;margin-bottom:24px;border:1px solid #E8D5C4;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1A1A1A;">
                      <strong>${servicesSummary}</strong>
                    </p>
                    <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1A1A1A;">
                      ${sessionDate}
                    </p>
                    <p style="margin:0;font-size:15px;line-height:1.5;color:#1A1A1A;">
                      <strong>Total: ${totalStr}</strong>
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#1A1A1A;">
                If you have any questions regarding the invoice, please feel free to reply to this email.
              </p>
              
              <p style="margin:0 0 32px;font-size:16px;line-height:1.6;color:#1A1A1A;">
                Thank you.
              </p>
              
              <!-- Signature -->
              <p style="margin:0;font-size:15px;line-height:1.6;color:${INK};">
                Kind regards,<br><br>
                <strong>Dominique Vellutini</strong><br>
                <span style="color:${ROSE};font-weight:600;">O TO T</span><br>
                <a href="mailto:${CLIENT.contact.email}" style="color:${ROSE};text-decoration:none;">${CLIENT.contact.email}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
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
