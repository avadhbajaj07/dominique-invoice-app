// lib/pdf.tsx
// Generates the branded invoice PDF matching InvoicePreview.tsx design.
// Compact layout to fit everything on a single A4 page.

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, renderToBuffer } from '@react-pdf/renderer'
import { CLIENT } from '@/config/client'
import type { Invoice } from '@/types'
import { formatCurrency, formatDate } from './helpers'
import path from 'path'

const LOGO_PATH = path.join(process.cwd(), 'public/brand/logo.png')

const INK = CLIENT.brand.text
const BORDER = CLIENT.brand.border
const ROSE = CLIENT.brand.primary
const PAPER = CLIENT.brand.background
const ACCENT = CLIENT.brand.accent

const S = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    fontFamily: 'Helvetica',
    color: INK,
    fontSize: 10,
    lineHeight: 1.35,
  },

  // ── Main content wrapper ──
  content: {
    flex: 1,
    paddingHorizontal: 36,
    paddingTop: 28,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    color: ROSE,
    fontSize: 38,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    marginBottom: 8,
  },
  companyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginBottom: 2,
  },
  companyDetail: {
    fontSize: 9,
    marginBottom: 1,
  },
  topMark: {
    width: 65,
    height: 65,
    objectFit: 'contain' as any,
  },

  // ── Meta box ──
  metaBox: {
    borderWidth: 1.4,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
  },
  metaItem: { flex: 1 },
  metaLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    textTransform: 'uppercase' as any,
  },
  metaValue: { fontSize: 9, textTransform: 'uppercase' as any },

  // ── Invoice To ──
  billTo: { marginBottom: 16 },
  billLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    textTransform: 'uppercase' as any,
  },
  customerName: {
    color: ROSE,
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    textTransform: 'uppercase' as any,
  },
  payable: { fontSize: 10, lineHeight: 1.3 },
  payableCompany: { fontFamily: 'Helvetica-Bold' },
  customerDetail: { fontSize: 9, lineHeight: 1.35, marginTop: 1 },

  // ── Table ──
  tableWrap: { marginBottom: 16 },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tableHeaderMain: {
    flex: 1,
    borderWidth: 1.4,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  headerDesc: { width: 200 },
  headerPrice: { width: 75, textAlign: 'center' },
  headerQty: { flex: 1, textAlign: 'center' },
  headerAmount: {
    width: 120,
    marginLeft: -1,
    borderWidth: 1.4,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 9,
    backgroundColor: ROSE,
    justifyContent: 'center',
  },
  tableHeaderText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase' as any,
  },
  tableHeaderAmountText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase' as any,
  },
  tableBody: {
    borderWidth: 1.4,
    borderColor: BORDER,
    borderRadius: 16,
    marginTop: -1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    // No minHeight — let content dictate size for single-page fit
    position: 'relative' as any,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  descText: { fontSize: 10, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' as any },
  bodyText: { fontSize: 10 },
  colDesc: { width: 200 },
  colPrice: { width: 75, textAlign: 'center' },
  colQty: { width: 45, textAlign: 'center' },
  colAmount: { flex: 1, textAlign: 'right' },
  watermark: {
    position: 'absolute' as any,
    top: '10%',
    left: '25%',
    width: '50%',
    height: '80%',
    opacity: 0.05,
    objectFit: 'contain' as any,
  },

  // ── Payment + Total row ──
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  paymentDetails: { flex: 1, paddingTop: 10 },
  paymentTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    textTransform: 'uppercase' as any,
  },
  paymentText: { fontSize: 10, lineHeight: 1.3 },
  totalBox: {
    width: 190,
    height: 60,
    borderWidth: 1.4,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: ROSE,
    marginLeft: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' as any },
  totalValue: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Helvetica-Bold' },

  // ── Notes ──
  notes: { fontSize: 10, marginBottom: 14 },

  // ── Footer ──
  footer: {
    backgroundColor: INK,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 36,
    flexDirection: 'row',
    marginTop: 'auto',
  },
  footerNote: {
    flex: 1.2,
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 1.35,
    fontFamily: 'Helvetica-BoldOblique',
  },
  contact: { flex: 1 },
  contactTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    textTransform: 'uppercase' as any,
  },
  contactText: { color: ROSE, fontSize: 9, lineHeight: 1.5 },

  // ── Subtotals ──
  subtotalsWrap: {
    alignSelf: 'flex-end',
    width: '36%',
    marginBottom: 14,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    fontSize: 10,
  },
})

interface InvoicePDFProps {
  invoice: Invoice
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const { customer, items = [] } = invoice
  const currency = invoice.currency
  const issueDate = formatDate(invoice.issue_date).toUpperCase()
  const dueDate = invoice.due_date ? formatDate(invoice.due_date).toUpperCase() : issueDate

  const hasDiscountOrTax = invoice.discount_amount > 0 || invoice.tax_rate > 0

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* ── Main content ── */}
        <View style={S.content}>

          {/* Header: INVOICE + company info + logo */}
          <View style={S.header}>
            <View style={{ flex: 1 }}>
              <Text style={S.title}>INVOICE</Text>
              <Text style={S.companyName}>{CLIENT.company}</Text>
              <Text style={S.companyDetail}>{CLIENT.name}</Text>
              <Text style={S.companyDetail}>{CLIENT.contact.email}</Text>
            </View>
            <Image style={S.topMark} src={LOGO_PATH} />
          </View>

          {/* Meta box: Invoice No / Date / Due Date */}
          <View style={S.metaBox}>
            <View style={S.metaItem}>
              <Text style={S.metaLabel}>Invoice No:</Text>
              <Text style={S.metaValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={S.metaItem}>
              <Text style={S.metaLabel}>Invoice Date:</Text>
              <Text style={S.metaValue}>{issueDate}</Text>
            </View>
            <View style={S.metaItem}>
              <Text style={S.metaLabel}>Due Date:</Text>
              <Text style={S.metaValue}>{dueDate}</Text>
            </View>
          </View>

          {/* Invoice To */}
          <View style={S.billTo}>
            <Text style={S.billLabel}>Invoice To:</Text>
            <Text style={S.customerName}>{customer?.name ?? 'Client Name'}</Text>
            <Text style={S.payable}>
              Payable: {CLIENT.payment.terms} to{' '}
              <Text style={S.payableCompany}>{CLIENT.payment.beneficiary}</Text>
            </Text>
            {customer?.email && <Text style={S.customerDetail}>{customer.email}</Text>}
            {customer?.address && <Text style={S.customerDetail}>{customer.address}</Text>}
          </View>

          {/* Items Table */}
          <View style={S.tableWrap}>
            {/* Table header row */}
            <View style={S.tableHeaderRow}>
              <View style={S.tableHeaderMain}>
                <Text style={[S.tableHeaderText, S.headerDesc]}>Descriptions</Text>
                <Text style={[S.tableHeaderText, S.headerPrice]}>Price</Text>
                <Text style={[S.tableHeaderText, S.headerQty]}>Qty</Text>
              </View>
              <View style={S.headerAmount}>
                <Text style={S.tableHeaderAmountText}>Amount</Text>
              </View>
            </View>

            {/* Table body */}
            <View style={S.tableBody}>
              <Image style={S.watermark} src={LOGO_PATH} />
              {items.map((item, i) => (
                <View key={i} style={S.row}>
                  <Text style={[S.descText, S.colDesc]}>{item.description || '-'}</Text>
                  <Text style={[S.bodyText, S.colPrice]}>{formatCurrency(item.rate, currency)}</Text>
                  <Text style={[S.bodyText, S.colQty]}>{item.quantity}</Text>
                  <Text style={[S.bodyText, S.colAmount]}>{formatCurrency(item.amount, currency)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Subtotals (if discount or tax) */}
          {hasDiscountOrTax && (
            <View style={S.subtotalsWrap}>
              <View style={S.subRow}>
                <Text>Subtotal</Text>
                <Text>{formatCurrency(invoice.subtotal, currency)}</Text>
              </View>
              {invoice.discount_amount > 0 && (
                <View style={S.subRow}>
                  <Text>
                    Discount{invoice.discount_type === 'percent' ? ` (${invoice.discount}%)` : ''}
                  </Text>
                  <Text>-{formatCurrency(invoice.discount_amount, currency)}</Text>
                </View>
              )}
              {invoice.tax_rate > 0 && (
                <View style={S.subRow}>
                  <Text>Tax ({invoice.tax_rate}%)</Text>
                  <Text>{formatCurrency(invoice.tax_amount, currency)}</Text>
                </View>
              )}
            </View>
          )}

          {/* Payment Details + Total */}
          <View style={S.paymentRow}>
            <View style={S.paymentDetails}>
              <Text style={S.paymentTitle}>Payment Details</Text>
              <Text style={S.paymentText}>IBAN: {CLIENT.payment.iban}</Text>
              <Text style={S.paymentText}>BIC: {CLIENT.payment.bic}</Text>
            </View>
            <View style={S.totalBox}>
              <Text style={S.totalLabel}>Total</Text>
              <Text style={S.totalValue}>{formatCurrency(invoice.total, currency)}</Text>
            </View>
          </View>

          {/* Notes */}
          {invoice.notes && <Text style={S.notes}>Notes: {invoice.notes}</Text>}

        </View>

        {/* ── Footer (dark bar at bottom) ── */}
        <View style={S.footer}>
          <Text style={S.footerNote}>{CLIENT.invoice.footerNote2}</Text>
          <View style={S.contact}>
            <Text style={S.contactTitle}>Contact Us</Text>
            <Text style={S.contactText}>Email: {CLIENT.contact.email}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export async function generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
  const element = React.createElement(InvoicePDF, { invoice })
  return await renderToBuffer(element as any)
}
