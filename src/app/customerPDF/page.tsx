'use client';

import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import quoteData from '../data.json';

interface QuoteData {
  quote: {
    quoteInfo: {
      quoteNumber: string;
      validUntil: string;
    };
    companyInfo: {
      companyName: string;
      contactName: string;
      email: string;
      phone: string;
      address: string;
    };
    clientInfo: {
      companyName: string;
      contactName: string;
      email: string;
      phone: string;
      address: string;
    };
    items: QuoteItem[];
    financials: {
      subtotal: number;
      tax_rate: number;
      tax_amount: number;
      total: number;
      amount_paid: number;
      balance_due: number;
      labor_hours?: number;
      labor_rate?: number;
      markup_percentage?: number;
      markup_amount?: number;
    };
    branding: {
      primary_color: string;
      secondary_color: string;
      accent_color: string;
    };
    paymentInfo: {
      paypal: string;
      checkPayableTo: string;
      routingNumber: string;
    };
    notes: string;
    generated_at: string;
  };
}

interface QuoteItem {
  name: string;
  description: string;
  price_per_unit: number;
  quantity: string;
  total_amount: number;
  url: string;
  image_url: string;
}

const styles = StyleSheet.create({
  page: {
    padding: '20 30',
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
    paddingBottom: 10,
    marginBottom: 15,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 100,
    alignItems: 'flex-end',
  },
  logo: {
    width: 80,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 7,
    color: '#475569',
    marginBottom: 1,
    lineHeight: 1.2,
  },
  quoteContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  quoteNumber: {
    fontSize: 10,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '4 8',
    borderRadius: 3,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  infoColumn: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoText: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.2,
  },
  table: {
    marginBottom: 12,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexGrow: 1,
    minHeight: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: 6,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 0,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.2,
  },
  tableCellName: {
    fontSize: 8,
    color: '#0f172a',
    fontWeight: 'bold',
    marginBottom: 1,
  },
  tableCellDescription: {
    fontSize: 7,
    color: '#64748b',
    lineHeight: 1.1,
  },
  colItem: { width: '50%' },
  colQty: { width: '20%', textAlign: 'center' },
  colRate: { width: '15%', textAlign: 'right' },
  colAmount: { width: '15%', textAlign: 'right' },
  totalsSection: {
    alignSelf: 'flex-end',
    width: '35%',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 40,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  totalRowFinal: {
    borderBottomWidth: 0,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 2,
    borderTopColor: '#0f172a',
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
  },
  totalValue: {
    fontSize: 8,
    color: '#334155',
    fontWeight: 'bold',
  },
  totalFinal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
  },
  footerContent: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#64748b',
  },
  footerNote: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  laborSection: {
    flex: 1,
  },
});

const QuotePDF = () => {
  const typedQuoteData = quoteData as unknown as QuoteData;
  const { quote } = typedQuoteData;

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.companyName}>{quote.companyInfo.companyName}</Text>
              <Text style={styles.companyDetails}>{quote.companyInfo.address}</Text>
              <Text style={styles.companyDetails}>Tel: {quote.companyInfo.phone}</Text>
              <Text style={styles.companyDetails}>{quote.companyInfo.email}</Text>
              <Text style={styles.companyDetails}>Contact: {quote.companyInfo.contactName}</Text>
            </View>
            <View style={styles.headerRight}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image style={styles.logo} src="/Blanc.png" />
            </View>
          </View>

          {/* Quote Header */}
          <View style={styles.quoteContainer}>
            <View style={styles.quoteHeader}>
              <Text style={styles.quoteTitle}>Estimate</Text>
              <Text style={styles.quoteNumber}>#{quote.quoteInfo.quoteNumber}</Text>
            </View>
            <View style={styles.infoGrid}>
              <View style={styles.infoColumn}>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Bill To</Text>
                  <Text style={styles.infoText}>{quote.clientInfo.companyName}</Text>
                  <Text style={styles.infoText}>{quote.clientInfo.contactName}</Text>
                  <Text style={styles.infoText}>{quote.clientInfo.email}</Text>
                  <Text style={styles.infoText}>{quote.clientInfo.phone}</Text>
                  <Text style={styles.infoText}>{quote.clientInfo.address}</Text>
                </View>
              </View>
              <View style={styles.infoColumn}>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Quote Details</Text>
                  <Text style={styles.infoText}>Generated: {quote.generated_at}</Text>
                  <Text style={styles.infoText}>Valid Until: {quote.quoteInfo.validUntil}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colItem]}>Item</Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Quantity</Text>
              <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
            </View>
            
            {quote.items.map((item, index) => (
              <View key={index} style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {}
              ]}>
                <View style={[styles.colItem]}>
                  <Text style={styles.tableCellName}>{item.name}</Text>
                  <Text style={styles.tableCellDescription}>{item.description}</Text>
                </View>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colRate]}>${item.price_per_unit.toFixed(2)}</Text>
                <Text style={[styles.tableCell, styles.colAmount]}>${item.total_amount.toFixed(2)}</Text>
              </View>
            ))}

            {/* Labor and Other Expenses Row */}
            {quote.financials.labor_hours && quote.financials.labor_rate && (
              <View style={[styles.tableRow]}>
                <View style={[styles.colItem]}>
                  <Text style={styles.tableCellName}>Labour and Other Expenses</Text>
                </View>
                <Text style={[styles.tableCell, styles.colQty]}>-</Text>
                <Text style={[styles.tableCell, styles.colRate]}>-</Text>
                <Text style={[styles.tableCell, styles.colAmount]}>${(
                  (quote.financials.labor_hours * quote.financials.labor_rate) * 
                  (1 + (quote.financials.markup_percentage || 0) / 100)
                ).toFixed(2)}</Text>
              </View>
            )}
          </View>

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${quote.financials.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({(quote.financials.tax_rate * 100).toFixed()}%)</Text>
              <Text style={styles.totalValue}>${quote.financials.tax_amount.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalFinal}>${quote.financials.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Accepted By: _______________________</Text>
                <Text style={styles.footerText}>Date: _______________________</Text>
              </View>
              <Text style={styles.footerNote}>Thank you for your business</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default QuotePDF;
