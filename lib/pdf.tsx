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
    backgroundColor: INK,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
  const pageStyle = {
    backgroundColor: PAPER,
    padding: 40,
    fontFamily: 'Helvetica',
    color: INK,
    fontSize: 11,
    lineHeight: 1.4,
  }
  const labelStyle = {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: INK,
    marginBottom: 4,
  }
  const cellStyle = {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: CLIENT.brand.accent,
  }

  return (
    <Document>
      <Page size="A4" style={pageStyle}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: ROSE, fontFamily: 'Helvetica-Bold', fontSize: 42, marginBottom: 8 }}>
              INVOICE
            </Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 13 }}>{CLIENT.company}</Text>
            <Text>{CLIENT.name}</Text>
            <Text>{CLIENT.contact.email}</Text>
          </View>
          <BrandMark />
        </View>

        <View
          style={{
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: CLIENT.brand.accent,
            padding: 12,
            marginBottom: 24,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>INVOICE NO</Text>
            <Text>{invoice.invoice_number}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>INVOICE DATE</Text>
            <Text>{issueDate}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>DUE DATE</Text>
            <Text>{dueDate}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={labelStyle}>INVOICE TO</Text>
          <Text style={{ color: ROSE, fontFamily: 'Helvetica-Bold', fontSize: 24, marginBottom: 6 }}>
            {customer?.name?.toUpperCase() ?? 'CLIENT'}
          </Text>
          {customer?.email && <Text>{customer.email}</Text>}
          {customer?.address && <Text>{customer.address}</Text>}
        </View>

        <View style={{ marginBottom: 26 }}>
          <View style={{ flexDirection: 'row', backgroundColor: ROSE }}>
            <Text style={[cellStyle, { width: 250, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' }]}>
              DESCRIPTION
            </Text>
            <Text style={[cellStyle, { width: 90, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' }]}>PRICE</Text>
            <Text style={[cellStyle, { width: 50, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' }]}>QTY</Text>
            <Text style={[cellStyle, { flex: 1, color: '#FFFFFF', fontFamily: 'Helvetica-Bold', textAlign: 'right' }]}>
              AMOUNT
            </Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row' }}>
              <Text style={[cellStyle, { width: 250, fontFamily: 'Helvetica-Bold' }]}>{item.description}</Text>
              <Text style={[cellStyle, { width: 90 }]}>{formatCurrency(item.rate, currency)}</Text>
              <Text style={[cellStyle, { width: 50 }]}>{item.quantity}</Text>
              <Text style={[cellStyle, { flex: 1, textAlign: 'right' }]}>{formatCurrency(item.amount, currency)}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>PAYMENT DETAILS</Text>
            <Text>Payable: {CLIENT.payment.terms}</Text>
            <Text>Beneficiary: {CLIENT.payment.beneficiary}</Text>
            <Text>IBAN: {CLIENT.payment.iban}</Text>
            <Text>BIC: {CLIENT.payment.bic}</Text>
          </View>
          <View style={{ width: 180, backgroundColor: ROSE, padding: 16 }}>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Helvetica-Bold', fontSize: 12, marginBottom: 8 }}>TOTAL</Text>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Helvetica-Bold', fontSize: 16 }}>
              {formatCurrency(invoice.total, currency)}
            </Text>
          </View>
        </View>

        {invoice.notes && <Text style={{ marginBottom: 18 }}>Notes: {invoice.notes}</Text>}

        <View style={{ marginTop: 24, paddingTop: 14, borderTopWidth: 1, borderTopColor: CLIENT.brand.accent }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>{CLIENT.invoice.footerNote2}</Text>
          <View>
            <Text style={labelStyle}>CONTACT US</Text>
            <Text>Email: {CLIENT.contact.email}</Text>
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
