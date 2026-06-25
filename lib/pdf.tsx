// lib/pdf.tsx
// Generates the branded invoice PDF.

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
const WATERMARK = CLIENT.brand.watermark

const S = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    paddingHorizontal: 40,
    paddingVertical: 35,
    fontFamily: 'Helvetica',
    color: INK,
  },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  topMark: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },

  title: {
    marginTop: 20,
    marginBottom: 15,
    color: ROSE,
    fontSize: 55,
    lineHeight: 60,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 4,
  },
  headerTitle: {
    marginTop: 20,
    color: ROSE,
    fontSize: 55,
    lineHeight: 60,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 4,
  },

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
    color: INK,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
  metaValue: { color: INK, fontSize: 13, lineHeight: 16 },

  billTo: { marginBottom: 25 },
  billLabel: {
    color: INK,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
  },
  customerName: {
    color: ROSE,
    fontSize: 36,
    lineHeight: 40,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  payable: { color: INK, fontSize: 14, lineHeight: 18 },
  payableCompany: { fontFamily: 'Helvetica-Bold' },
  customerDetail: { color: INK, fontSize: 13, lineHeight: 18, marginTop: 3 },

  tableWrap: { marginBottom: 25 },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: -1,
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
  headerAmount: {
    width: 140,
    marginLeft: 8,
    borderWidth: 1.6,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: ROSE,
  },
  tableHeaderText: {
    color: INK,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Helvetica-Bold',
  },
  tableHeaderAmountText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Helvetica-Bold',
  },
  tableBody: {
    minHeight: 280,
    borderWidth: 1.6,
    borderColor: BORDER,
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  row: { flexDirection: 'row', marginBottom: 12 },
  bodyText: { color: INK, fontSize: 14, lineHeight: 18 },
  descText: { color: INK, fontSize: 14, lineHeight: 18, fontFamily: 'Helvetica-Bold' },
  colDesc: { width: 220 },
  colPrice: { width: 80, textAlign: 'center' },
  colQty: { width: 45, textAlign: 'center' },
  colAmount: { flex: 1, textAlign: 'right' },

  watermark: {
    position: 'absolute',
    top: 291,
    left: 167.5,
    width: 260,
    height: 260,
    opacity: 0.05,
    objectFit: 'contain',
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  paymentDetails: { flex: 1, paddingTop: 14 },
  paymentTitle: {
    color: INK,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
  },
  paymentText: { color: INK, fontSize: 14, lineHeight: 18 },
  totalBox: {
    width: 220,
    height: 80,
    borderWidth: 1.6,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: ROSE,
    marginLeft: 20,
    marginTop: 0,
    paddingHorizontal: 20,
    paddingTop: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: { color: '#FFFFFF', fontSize: 15, lineHeight: 18, fontFamily: 'Helvetica-Bold' },
  totalValue: { color: '#FFFFFF', fontSize: 15, lineHeight: 18, fontFamily: 'Helvetica-Bold' },

  footer: {
    height: 90,
    backgroundColor: INK,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 40,
    flexDirection: 'row',
  },
  footerNote: {
    width: 250,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Helvetica-BoldOblique',
  },
  contact: { flex: 1 },
  contactTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
  contactText: { color: ROSE, fontSize: 12, lineHeight: 18 },
})

interface InvoicePDFProps {
  invoice: Invoice
}

function BrandMark({ watermark = false }: { watermark?: boolean }) {
  if (watermark) {
    return (
      <Image
        style={S.watermark}
        src={LOGO_PATH}
      />
    )
  }

  return (
    <Image
      style={S.topMark}
      src={LOGO_PATH}
    />
  )
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const { customer, items = [] } = invoice
  const currency = invoice.currency
  const issueDate = formatDate(invoice.issue_date).toUpperCase()
  const dueDate = invoice.due_date ? formatDate(invoice.due_date).toUpperCase() : issueDate

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <BrandMark watermark />
        <View style={S.header}>
          <Text style={S.headerTitle}>INVOICE</Text>
          <BrandMark />
        </View>

        <View style={S.metaBox}>
          <View style={S.metaItem}>
            <Text style={S.metaLabel}>INVOICE NO:</Text>
            <Text style={S.metaValue}>{invoice.invoice_number}</Text>
          </View>
          <View style={S.metaItem}>
            <Text style={S.metaLabel}>INVOICE DATE:</Text>
            <Text style={S.metaValue}>{issueDate}</Text>
          </View>
          <View style={S.metaItem}>
            <Text style={S.metaLabel}>DUE DATE:</Text>
            <Text style={S.metaValue}>{dueDate}</Text>
          </View>
        </View>

        <View style={S.billTo}>
          <Text style={S.billLabel}>INVOICE TO:</Text>
          <Text style={S.customerName}>{customer?.name?.toUpperCase() ?? 'CLIENT'}</Text>
          <Text style={S.payable}>
            Payable: {CLIENT.payment.terms} to{' '}
            <Text style={S.payableCompany}>{CLIENT.payment.beneficiary}</Text>
          </Text>
          {customer?.email && <Text style={S.customerDetail}>{customer.email}</Text>}
          {customer?.address && <Text style={S.customerDetail}>{customer.address}</Text>}
        </View>

        <View style={S.tableWrap} wrap={false}>
          <View style={S.tableHeaderRow}>
            <View style={S.tableHeaderMain}>
              <Text style={[S.tableHeaderText, S.colDesc]}>DESCRIPTIONS</Text>
              <Text style={[S.tableHeaderText, S.colPrice]}>PRICE</Text>
              <Text style={[S.tableHeaderText, S.colQty]}>QTY</Text>
            </View>
            <View style={S.headerAmount}>
              <Text style={S.tableHeaderAmountText}>AMOUNT</Text>
            </View>
          </View>

          <View style={S.tableBody}>
            {items.map((item, i) => (
              <View key={i} style={S.row} wrap={false}>
                <Text style={[S.descText, S.colDesc]}>{(item.description || '').toUpperCase()}</Text>
                <Text style={[S.bodyText, S.colPrice]}>{formatCurrency(item.rate, currency)}</Text>
                <Text style={[S.bodyText, S.colQty]}>{item.quantity}</Text>
                <Text style={[S.bodyText, S.colAmount]}>{formatCurrency(item.amount, currency)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={S.paymentRow} wrap={false}>
          <View style={S.paymentDetails}>
            <Text style={S.paymentTitle}>PAYMENT DETAILS</Text>
            <Text style={S.paymentText}>IBAN: {CLIENT.payment.iban}</Text>
            <Text style={S.paymentText}>BIC: {CLIENT.payment.bic}</Text>
          </View>
          <View style={S.totalBox}>
            <Text style={S.totalLabel}>TOTAL</Text>
            <Text style={S.totalValue}>{formatCurrency(invoice.total, currency)}</Text>
          </View>
        </View>

        <View style={S.footer} wrap={false}>
          <Text style={S.footerNote}>{CLIENT.invoice.footerNote2.toUpperCase()}</Text>
          <View style={S.contact}>
            <Text style={S.contactTitle}>CONTACT US</Text>
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
