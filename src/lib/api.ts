import {
  User,
  ArtisanProfile,
  Listing,
  Order,
  OrderStatus,
  ExtractedSkillInfo,
  GeneratedListing,
  MatchScoreResult,
  NotificationItem,
} from '../types.ts';

const AUTH_TOKEN_STORAGE_KEY = 'kanyakriti_jwt_token';

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    }
  } catch {
    // ignore local storage restrictions
  }
}

export function removeStoredAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // ignore local storage restrictions
  }
}

export function getAuthHeaders(customHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders || {}),
  };
  const token = getStoredAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchHealth() {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchDbStatus() {
  const res = await fetch('/api/db/status');
  return res.json();
}

export async function fetchCurrentUser(): Promise<{ user: User | null; isDemo?: boolean }> {
  try {
    const token = getStoredAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/auth/me', {
      headers,
      credentials: 'include',
    });
    if (!res.ok) {
      if (res.status === 401) removeStoredAuthToken();
      return { user: null };
    }
    const data = await res.json();
    if (!data.user && token) {
      removeStoredAuthToken();
    }
    return { user: data.user, isDemo: data.isDemo };
  } catch (err) {
    return { user: null };
  }
}

export async function registerArtisan(payload: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  preferredLanguage?: string;
  neighborhood?: string;
  city?: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/artisan/register', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to register artisan account');
  if (data.token) setStoredAuthToken(data.token);
  return data;
}

export async function registerBuyer(payload: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  neighborhood?: string;
  city?: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/buyer/register', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to register buyer account');
  if (data.token) setStoredAuthToken(data.token);
  return data;
}

export async function loginArtisan(payload: { identifier: string; password: string }): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/artisan/login', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to login to artisan account');
  if (data.token) setStoredAuthToken(data.token);
  return data;
}

export async function loginBuyer(payload: { identifier: string; password: string }): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/buyer/login', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to login to buyer account');
  if (data.token) setStoredAuthToken(data.token);
  return data;
}

export async function registerRunner(payload: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  vehicleType?: string;
  neighborhood?: string;
  city?: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/runner/register', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to register runner account');
  if (data.token) setStoredAuthToken(data.token);
  return data;
}

export async function loginRunner(payload: { identifier: string; password: string }): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/runner/login', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to login to runner account');
  if (data.token) setStoredAuthToken(data.token);
  return data;
}

export async function loginAdmin(payload: { identifier: string; password: string }): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/admin/login', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to login to admin account');
  if (data.token) setStoredAuthToken(data.token);
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
  } catch (err) {
    console.warn('[Logout] Server notification failed:', err);
  } finally {
    removeStoredAuthToken();
  }
}

export async function loginUser(roleOrUserId: string): Promise<User> {
  const isId = roleOrUserId.includes('-');
  const body = isId ? { userId: roleOrUserId } : { role: roleOrUserId };
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to login');
  return data.user;
}

export async function fetchArtisans(): Promise<ArtisanProfile[]> {
  const res = await fetch('/api/artisans');
  const data = await res.json();
  return data.artisans || [];
}

export async function fetchArtisanById(id: string) {
  const res = await fetch(`/api/artisans/${id}`);
  return res.json();
}

export async function fetchListings(params?: { category?: string; search?: string; artisanId?: string }): Promise<Listing[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.artisanId) query.set('artisanId', params.artisanId);

  const res = await fetch(`/api/listings?${query.toString()}`);
  const data = await res.json();
  return data.listings || [];
}

export async function createListing(listingData: any): Promise<Listing> {
  const res = await fetch('/api/listings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listingData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create listing');
  return data.listing;
}

export async function transcribeAudioAI(audioBlob: Blob, languageCode?: string): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  if (languageCode) {
    formData.append('language', languageCode);
  }
  const res = await fetch('/api/ai/transcribe', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to transcribe audio note');
  return data.transcript || '';
}

export async function extractSkillAI(spokenText: string, language?: string): Promise<ExtractedSkillInfo> {
  const res = await fetch('/api/ai/extract-skill', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spokenText, language }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to extract skill');
  return data;
}

export async function generateListingAI(extracted: ExtractedSkillInfo, artisanName: string): Promise<GeneratedListing> {
  const res = await fetch('/api/ai/generate-listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extracted, artisanName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate listing');
  return data;
}

export async function matchNearbyArtisans(params: {
  query?: string;
  category?: string;
  maxBudget?: number;
  buyerLat?: number;
  buyerLng?: number;
  radiusKm?: number;
}): Promise<{ matches: MatchScoreResult[]; criteria: any }> {
  const res = await fetch('/api/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function fetchOrders(role?: string, userId?: string): Promise<Order[]> {
  const query = new URLSearchParams();
  if (role) query.set('role', role);
  if (userId) query.set('userId', userId);
  const res = await fetch(`/api/orders?${query.toString()}`);
  const data = await res.json();
  return data.orders || [];
}

export async function createOrder(payload: {
  buyerId: string;
  listingId: string;
  paymentMethod: 'UPI' | 'COD';
  deliveryAddress: string;
  instructions?: string;
}): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create order');
  return data.order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, runnerId?: string, actorRole?: string): Promise<Order> {
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, runnerId, actorRole }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update order status');
  return data.order;
}

export async function fetchEarnings(artisanId: string) {
  const res = await fetch(`/api/earnings?artisanId=${artisanId}`);
  return res.json();
}

export async function fetchNotifications(userId?: string): Promise<NotificationItem[]> {
  const query = userId ? `?userId=${userId}` : '';
  const res = await fetch(`/api/notifications${query}`);
  const data = await res.json();
  return data.notifications || [];
}

export async function resetDemo() {
  const res = await fetch('/api/demo/reset', { method: 'POST' });
  return res.json();
}
