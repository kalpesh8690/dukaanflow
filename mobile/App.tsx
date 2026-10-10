import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.brand}>DukaanFlow</Text>
        <Text style={styles.heading}>Manage your shop, simply.</Text>
        <Text style={styles.body}>Your products, stock, customers and orders — in one place.</Text>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>MVP is being built</Text>
          <Text style={styles.body}>Next: connect the API, then add owner sign-in and product management.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  brand: { color: '#0f766e', fontSize: 18, fontWeight: '800', marginBottom: 20 },
  heading: { color: '#0f172a', fontSize: 32, fontWeight: '800', lineHeight: 38 },
  body: { color: '#475569', fontSize: 16, lineHeight: 24, marginTop: 12 },
  panel: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginTop: 28, borderWidth: 1, borderColor: '#e2e8f0' },
  panelTitle: { color: '#0f172a', fontSize: 17, fontWeight: '700' },
});
