import { Product, CategoryItem, Order, NotificationItem, User, Coupon } from '../types';
import { getItem } from './storage';
import { API_BASE_URL } from '../config';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = getItem('rv_jwt_token');

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch (e) {
    throw new ApiError('Could not reach the store. Check your internet connection and try again.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || `Something went wrong (${res.status}). Please try again.`, res.status);
  }
  return data;
}

export async function fetchProducts(params?: { category?: string; search?: string; sort?: string }): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'ALL') query.set('category', params.category);
  if (params?.search) query.set('q', params.search);
  if (params?.sort) query.set('sort', params.sort);
  query.set('limit', '100');

  const data = await apiFetch(`/products?${query.toString()}`);
  return data.products as Product[];
}

export async function fetchProduct(id: string): Promise<{ product: Product; relatedProducts: Product[] }> {
  const data = await apiFetch(`/products/${id}`);
  return { product: data.product, relatedProducts: data.relatedProducts };
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const data = await apiFetch('/categories');
  return data.categories as CategoryItem[];
}

export async function loginRequest(email: string, password: string): Promise<{ user: User; token: string }> {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return { user: data.user, token: data.token };
}

export async function signupRequest(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  return { user: data.user, token: data.token };
}

export async function logoutRequest(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' });
}

export async function fetchMe(): Promise<{ user: User; coupons: Coupon[] }> {
  const data = await apiFetch('/auth/me');
  return { user: data.user, coupons: data.coupons };
}

export async function submitOrder(orderData: unknown): Promise<{
  orderId: string;
  earnedCoupon: { code: string; percentOff: number } | null;
  earnedFreeDelivery: boolean;
  token?: string | null;
}> {
  return apiFetch('/orders', { method: 'POST', body: JSON.stringify(orderData) });
}

export async function fetchOrders(): Promise<Order[]> {
  const data = await apiFetch('/orders');
  return data.orders as Order[];
}

export async function fetchWishlistIds(): Promise<string[]> {
  const data = await apiFetch('/wishlist');
  return data.wishlistedIds as string[];
}

export async function toggleWishlistRequest(productId: string): Promise<{ wishlisted: boolean; message: string }> {
  return apiFetch('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) });
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const data = await apiFetch('/notifications');
  return data.notifications as NotificationItem[];
}

export async function registerPushToken(pushToken: string): Promise<void> {
  await apiFetch('/push-token', { method: 'POST', body: JSON.stringify({ pushToken }) });
}

export { ApiError };
