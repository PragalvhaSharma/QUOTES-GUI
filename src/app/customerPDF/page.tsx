'use client';

import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import { useEffect, useState } from 'react';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 200,
    alignItems: 'flex-end',
  },
  logo: {
    width: 120,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  companyDetails: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 1,
  },
  quoteContainer: {
    backgroundColor: '#f8fafc',
    padding: 15,
    marginBottom: 20,
    borderRadius: 4,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quoteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  quoteNumber: {
    fontSize: 12,
    color: '#64748b',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 40,
  },
  infoColumn: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.3,
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 8,
    marginBottom: 1,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 6,
    marginBottom: 1,
  },
  tableRowAlt: {
    backgroundColor: '#f1f5f9',
  },
  tableCell: {
    fontSize: 9,
    color: '#334155',
  },
  colItem: { width: '40%' },
  colQty: { width: '15%', textAlign: 'center' },
  colRate: { width: '15%', textAlign: 'right' },
  colTax: { width: '15%', textAlign: 'center' },
  colAmount: { width: '15%', textAlign: 'right' },
  totalsSection: {
    alignSelf: 'flex-end',
    width: '35%',
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
    borderTopWidth: 1,
    borderTopColor: '#2563eb',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
  },
  totalValue: {
    fontSize: 10,
    color: '#334155',
  },
  totalFinal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
  },
  footerContent: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  footerText: {
    fontSize: 9,
    color: '#64748b',
  },
  footerNote: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

const QuotePDF = () => {
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuoteData = async () => {
      try {
        const response = await fetch('https://clara-consideration-brisbane-usd.trycloudflare.com/generate-quote');
        const data = await response.json();
        setQuoteData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quote data:', error);
        setLoading(false);
      }
    };

    fetchQuoteData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!quoteData) {
    return <div>Error loading quote data</div>;
  }

  const { quote } = quoteData;

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.companyName}>{quote.companyInfo.name}</Text>
              <Text style={styles.companyDetails}>{quote.companyInfo.address}</Text>
              <Text style={styles.companyDetails}>Tel: {quote.companyInfo.phone}</Text>
              <Text style={styles.companyDetails}>{quote.companyInfo.email}</Text>
              <Text style={styles.companyDetails}>Business No: {quote.companyInfo.businessNumber}</Text>
            </View>
            <View style={styles.headerRight}>
              <Image style={styles.logo} src="/path-to-your-logo.png" />
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
                  <Text style={styles.infoText}>{quote.clientInfo.company}</Text>
                  <Text style={styles.infoText}>{quote.clientInfo.address}</Text>
                  <Text style={styles.infoText}>{quote.clientInfo.phone}</Text>
                </View>
              </View>
              <View style={styles.infoColumn}>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Quote Details</Text>
                  <Text style={styles.infoText}>Date: {quote.quoteInfo.date}</Text>
                  <Text style={styles.infoText}>Valid Until: {quote.quoteInfo.validUntil}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colItem]}>Item Description</Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Quantity</Text>
              <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
              <Text style={[styles.tableHeaderText, styles.colTax]}>Tax</Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
            </View>
            
            {quote.items.map((item, index) => (
              <View key={index} style={[
                styles.tableRow,
                index % 2 === 1 && styles.tableRowAlt
              ]}>
                <Text style={[styles.tableCell, styles.colItem]}>{item.name}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colRate]}>${item.price_per_unit.toFixed(2)}</Text>
                <Text style={[styles.tableCell, styles.colTax]}>Exempt</Text>
                <Text style={[styles.tableCell, styles.colAmount]}>${item.total_amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${quote.financials.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
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
