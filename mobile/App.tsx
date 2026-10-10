import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable,
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Business, Product, createProduct, getToken, listProducts, currentBusiness, register, signIn, signOut } from './src/api';

type Mode = 'login' | 'register';

export default function App() {
  const [mode, setMode] = useState<Mode>('login');
  const [business, setBusiness] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [busy, setBusy] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const refreshProducts = useCallback(async (activeToken: string) => {
    setLoadingProducts(true);
    try {
      const result = await listProducts(activeToken);
      setProducts(result.products);
    } catch (error) {
      Alert.alert('Could not load products', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const savedToken = await getToken();
        if (!savedToken) return;
        const [account, inventory] = await Promise.all([currentBusiness(savedToken), listProducts(savedToken)]);
        if (mounted) {
          setToken(savedToken);
          setProducts(inventory.products);
          setBusiness(account);
        }
      } catch {
        await signOut();
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleAuth = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }
    if (mode === 'register' && (!businessName.trim() || !ownerName.trim())) {
      Alert.alert('Missing details', 'Enter your shop name and your name.');
      return;
    }
    setBusy(true);
    try {
      const account = mode === 'login'
        ? await signIn(email.trim(), password)
        : await register({ businessName: businessName.trim(), ownerName: ownerName.trim(), email: email.trim(), password });
      const savedToken = await getToken();
      if (!savedToken) throw new Error('Login succeeded but the secure session could not be saved.');
      setBusiness(account);
      setToken(savedToken);
      setProducts([]);
      await refreshProducts(savedToken);
    } catch (error) {
      Alert.alert(mode === 'login' ? 'Sign in failed' : 'Registration failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!token || !productName.trim() || price.trim() === '' || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      Alert.alert('Check product details', 'Enter a product name, a valid non-negative price, and whole-number stock.');
      return;
    }
    setBusy(true);
    try {
      await createProduct(token, { name: productName.trim(), price: Number(price), stock: Number(stock) });
      setProductName('');
      setPrice('');
      setStock('0');
      await refreshProducts(token);
    } catch (error) {
      Alert.alert('Could not add product', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setBusiness(null);
    setToken(null);
    setProducts([]);
    setPassword('');
  };

  if (business && token) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <View><Text style={styles.brand}>DukaanFlow</Text><Text style={styles.subheading}>{business.name}</Text></View>
          <Pressable onPress={handleSignOut} accessibilityRole="button"><Text style={styles.link}>Sign out</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.dashboard} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Your products</Text>
          <Text style={styles.muted}>Manage your shop inventory in one place.</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add a product</Text>
            <TextInput style={styles.input} value={productName} onChangeText={setProductName} placeholder="Product name" maxLength={160} />
            <View style={styles.inlineFields}>
              <TextInput style={[styles.input, styles.field]} value={price} onChangeText={setPrice} placeholder="Price (₹)" keyboardType="decimal-pad" />
              <TextInput style={[styles.input, styles.field]} value={stock} onChangeText={setStock} placeholder="Stock" keyboardType="number-pad" />
            </View>
            <Pressable style={[styles.button, busy && styles.buttonDisabled]} onPress={handleCreateProduct} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save product</Text>}
            </Pressable>
          </View>
          <View style={styles.listHeading}>
            <Text style={styles.cardTitle}>Inventory ({products.length})</Text>
            <Pressable onPress={() => refreshProducts(token)}><Text style={styles.link}>Refresh</Text></Pressable>
          </View>
          {loadingProducts ? <ActivityIndicator style={styles.loader} color="#0f766e" /> : (
            <FlatList
              data={products}
              scrollEnabled={false}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={<Text style={styles.empty}>No products yet. Add your first product above.</Text>}
              renderItem={({ item }) => (
                <View style={styles.productRow}>
                  <View style={styles.productInfo}><Text style={styles.productName}>{item.name}</Text><Text style={styles.muted}>Stock: {item.stock}</Text></View>
                  <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
                </View>
              )}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>DukaanFlow</Text>
          <Text style={styles.title}>{mode === 'login' ? 'Welcome back.' : 'Set up your shop.'}</Text>
          <Text style={styles.muted}>Simple inventory management for small businesses.</Text>
          <View style={styles.card}>
            {mode === 'register' && <>
              <Text style={styles.label}>Shop name</Text>
              <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholder="e.g. Patel General Store" maxLength={120} autoCapitalize="words" />
              <Text style={styles.label}>Your name</Text>
              <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} placeholder="Owner name" maxLength={120} autoCapitalize="words" />
            </>}
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={254} />
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder={mode === 'register' ? 'At least 10 characters' : 'Your password'} secureTextEntry maxLength={128} />
            <Pressable style={[styles.button, busy && styles.buttonDisabled]} onPress={handleAuth} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>}
            </Pressable>
            <Pressable style={styles.modeToggle} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
              <Text style={styles.link}>{mode === 'login' ? 'New here? Create a shop account' : 'Already have an account? Sign in'}</Text>
            </Pressable>
          </View>
          <Text style={styles.footnote}>Your session token is stored using Android secure storage.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  authContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  dashboard: { padding: 20, paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: '#0f766e', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  title: { color: '#0f172a', fontSize: 30, fontWeight: '800', lineHeight: 36, marginBottom: 8 },
  subheading: { color: '#64748b', fontSize: 14 },
  muted: { color: '#64748b', fontSize: 14, lineHeight: 21, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginTop: 22, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { color: '#0f172a', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  label: { color: '#334155', fontSize: 13, fontWeight: '700', marginBottom: 7, marginTop: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15, color: '#0f172a', marginBottom: 10 },
  inlineFields: { flexDirection: 'row', gap: 10 },
  field: { flex: 1 },
  button: { backgroundColor: '#0f766e', borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8, minHeight: 48 },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modeToggle: { alignItems: 'center', paddingTop: 18, paddingBottom: 2 },
  link: { color: '#0f766e', fontSize: 14, fontWeight: '700' },
  footnote: { color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 22 },
  listHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26 },
  productRow: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 14, marginBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productInfo: { flex: 1, paddingRight: 12 },
  productName: { color: '#0f172a', fontSize: 15, fontWeight: '700', marginBottom: 5 },
  price: { color: '#0f766e', fontSize: 15, fontWeight: '800' },
  empty: { color: '#64748b', paddingVertical: 18, textAlign: 'center' },
  loader: { marginVertical: 24 },
});
