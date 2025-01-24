'use client';

import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import data from '../data.json';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    paddingVertical: 5,
  },
  col1: { width: '40%' },
  col2: { width: '20%' },
  col3: { width: '20%' },
  col4: { width: '20%' },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  notes: {
    marginTop: 30,
    fontSize: 10,
    color: '#666',
  },
});

const QuotePDF = () => {
  const { quote } = data;

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.companyName}>{quote.companyInfo.name}</Text>
            <Text>{quote.companyInfo.address}</Text>
            <Text>Phone: {quote.companyInfo.phone}</Text>
            <Text>Email: {quote.companyInfo.email}</Text>
          </View>

          {/* Quote Info */}
          <View style={styles.section}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Quote #{quote.quoteInfo.quoteNumber}</Text>
            <Text>Valid Until: {quote.quoteInfo.validUntil}</Text>
          </View>

          {/* Client Info */}
          <View style={styles.section}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>Bill To:</Text>
            <Text>{quote.clientInfo.company}</Text>
            <Text>{quote.clientInfo.address}</Text>
            <Text>Phone: {quote.clientInfo.phone}</Text>
            <Text>Email: {quote.clientInfo.email}</Text>
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Item</Text>
              <Text style={styles.col2}>Quantity</Text>
              <Text style={styles.col3}>Price</Text>
              <Text style={styles.col4}>Total</Text>
            </View>
            
            {quote.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{item.name}</Text>
                <Text style={styles.col2}>{item.quantity}</Text>
                <Text style={styles.col3}>${item.price_per_unit.toFixed(2)}</Text>
                <Text style={styles.col4}>${item.total_amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.row}>
              <Text style={styles.label}>Subtotal:</Text>
              <Text style={styles.value}>${quote.financials.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tax ({(quote.financials.tax_rate * 100).toFixed(0)}%):</Text>
              <Text style={styles.value}>${quote.financials.tax_amount.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total:</Text>
              <Text style={styles.value}>${quote.financials.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.notes}>
            <Text>{quote.notes}</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default QuotePDF;
