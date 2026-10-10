import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const TOKEN_KEY = 'dukaanflow.auth-token';

export type Business = { id: string; name: string; ownerName: string; email: string };
export type Product = { _id: string; name: string; sku?: string; price: number; stock: number; active: boolean };

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Can't reach the API at ${API_BASE_URL}. Check the API URL and that your backend is running.`);
  }
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`);
  return body as T;
}

export async function signIn(email: string, password: string) {
  const result = await request<{ token: string; business: Business }>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  });
  await SecureStore.setItemAsync(TOKEN_KEY, result.token);
  return result.business;
}

export async function register(input: { businessName: string; ownerName: string; email: string; password: string }) {
  const result = await request<{ token: string; business: Business }>('/auth/register', {
    method: 'POST', body: JSON.stringify(input),
  });
  await SecureStore.setItemAsync(TOKEN_KEY, result.token);
  return result.business;
}

export async function restoreSession() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) return null;
  try {
    const result = await request<{ products: Product[] }>('/products', {}, token);
    return { token, products: result.products };
  } catch {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return null;
  }
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function signOut() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function listProducts(token: string) {
  return request<{ products: Product[] }>('/products', {}, token);
}

export async function createProduct(token: string, input: { name: string; price: number; stock: number }) {
  return request<{ product: Product }>('/products', { method: 'POST', body: JSON.stringify(input) }, token);
}
