// lib/pdf.tsx
// Generates the branded invoice PDF matching InvoicePreview.tsx design.

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
    fontSize: 11,
    lineHeight: 1.4,
  },

  // ── Main content wrapper (with horizontal + top padding) ──
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 35,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  title: {
    color: ROSE,
    fontSize: 55,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 4,
    marginBottom: 10,
  },
  companyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    marginBottom: 2,
  },
  companyDetail: {
    fontSize: 10,
    marginBottom: 1,
  },
  topMark: {
    width: 80,
    height: 80,
    objectFit: 'contain' as any,
  },

  // ── Meta box ──
  metaBox: {
    borderWidth: 1.6,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 25,
    flexDirection: 'row',
  },
  metaItem: { flex: 1 },
  metaLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    textTransform: 'uppercase' as any,
  },
  metaValue: { fontSize: 11, textTransform: 'uppercase' as any },

  // ── Invoice To ──
  billTo: { marginBottom: 25 },
  billLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    textTransform: 'uppercase' as any,
  },
  customerName: {
    color: ROSE,
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    textTransform: 'uppercase' as any,
  },
  payable: { fontSize: 12, lineHeight: 1.33 },
  payableCompany: { fontFamily: 'Helvetica-Bold' },
  customerDetail: { fontSize: 11, lineHeight: 1.4, marginTop: 2 },

  // ── Table ──
  tableWrap: { marginBottom: 25 },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tableHeaderMain: {
    flex: 1,
    borderWidth: 1.6,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  headerDesc: { width: 220 },
  headerPrice: { width: 80, textAlign: 'center' },
  headerQty: { flex: 1, textAlign: 'center' },
  headerAmount: {
    width: 140,
    marginLeft: -1,
    borderWidth: 1.6,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: ROSE,
    justifyContent: 'center',
  },
  tableHeaderText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase' as any,
  },
  tableHeaderAmountText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase' as any,
  },
  tableBody: {
    borderWidth: 1.6,
    borderColor: BORDER,
    borderRadius: 20,
    marginTop: -1,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    minHeight: 200,
    position: 'relative' as any,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  descText: { fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' as any },
  bodyText: { fontSize: 12 },
  colDesc: { width: 220 },
  colPrice: { width: 80, textAlign: 'center' },
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
    marginBottom: 20,
  },
  paymentDetails: { flex: 1, paddingTop: 14 },
  paymentTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    textTransform: 'uppercase' as any,
  },
  paymentText: { fontSize: 12, lineHeight: 1.33 },
  totalBox: {
    width: 220,
    height: 80,
    borderWidth: 1.6,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: ROSE,
    marginLeft: 20,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' as any },
  totalValue: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Helvetica-Bold' },

  // ── Notes ──
  notes: { fontSize: 11, marginBottom: 20 },

  // ── Footer ──
  footer: {
    backgroundColor: INK,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 40,
    flexDirection: 'row',
    marginTop: 'auto',
  },
  footerNote: {
    flex: 1.2,
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 1.38,
    fontFamily: 'Helvetica-BoldOblique',
  },
  contact: { flex: 1 },
  contactTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    textTransform: 'uppercase' as any,
  },
  contactText: { color: ROSE, fontSize: 11, lineHeight: 1.5 },

  // ── Subtotals ──
  subtotalsWrap: {
    alignSelf: 'flex-end',
    width: '36%',
    marginBottom: 20,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    fontSize: 12,
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
