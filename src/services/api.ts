import { Product, CategoryItem, Order, NotificationItem, User, Coupon, ChatMessage, Promotion } from '../types';
import { getItem } from './storage';
import { API_BASE_URL } from '../config';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 20000;

async function apiFetch(path: string, options: RequestInit = {}, timeoutMs: number = REQUEST_TIMEOUT_MS): Promise<any> {
  const token = getItem('rv_jwt_token');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ApiError('The store is taking too long to respond. Please try again.', 0);
    }
    throw new ApiError('Could not reach the store. Check your internet connection and try again.', 0);
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || `Something went wrong (${res.status}). Please try again.`, res.status);
  }
  return data;
}

export async function fetchProducts(params?: { category?: string; search?: string; sort?: string }): Promise<Product[]> {
  const buildQuery = (page: number) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'ALL') query.set('category', params.category);
    if (params?.search) query.set('q', params.search);
    if (params?.sort) query.set('sort', params.sort);
    query.set('limit', '100');
    query.set('page', String(page));
    return query.toString();
  };

  // The backend caps each response at 100 products and reports how many pages
  // exist — the catalog is well past that (295+ products), so a single
  // request was silently truncating the list. Walk every page so category
  // counts and "browse everything" actually match what's in the database.
  const first = await apiFetch(`/products?${buildQuery(1)}`);
  let allProducts = (first.products as Product[]) ?? [];
  const totalPages = first.pagination?.totalPages ?? 1;

  for (let page = 2; page <= totalPages; page++) {
    const data = await apiFetch(`/products?${buildQuery(page)}`);
    allProducts = allProducts.concat((data.products as Product[]) ?? []);
  }

  return allProducts;
}

export async function fetchProduct(id: string): Promise<{ product: Product; relatedProducts: Product[] }> {
  const data = await apiFetch(`/products/${id}`);
  return { product: data.product, relatedProducts: data.relatedProducts };
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const data = await apiFetch('/categories');
  return data.categories as CategoryItem[];
}

export async function fetchPromotions(): Promise<Promotion[]> {
  const data = await apiFetch('/promotions');
  return data.promotions as Promotion[];
}

export async function loginRequest(email: string, password: string): Promise<{ user: User; token: string }> {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return { user: data.user, token: data.token };
}

export async function signupRequest(
  name: string,
  email: string,
  password: string,
  dateOfBirth: string
): Promise<{ user: User; token: string }> {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, dateOfBirth })
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

export async function updateThemePreference(themeMode: 'light' | 'dark' | 'system'): Promise<User> {
  const data = await apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify({ themeMode }) });
  return data.user as User;
}

export async function submitOrder(orderData: unknown): Promise<{
  orderId: string;
  order: Order;
  earnedCoupon: { code: string; percentOff: number } | null;
  earnedFreeDelivery: boolean;
  token?: string | null;
}> {
  // Order creation touches several tables in one transaction (order, items, coupon,
  // loyalty updates) plus a cold Neon connection on the first request — give it more
  // room than a plain GET before giving up.
  return apiFetch('/orders', { method: 'POST', body: JSON.stringify(orderData) }, 45000);
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

export async function fetchChatMessages(): Promise<ChatMessage[]> {
  const data = await apiFetch('/chat');
  return data.messages as ChatMessage[];
}

export async function sendChatMessage(body: string): Promise<{ message: ChatMessage; aiMessage: ChatMessage | null }> {
  const data = await apiFetch('/chat', { method: 'POST', body: JSON.stringify({ body }) });
  return { message: data.message as ChatMessage, aiMessage: (data.aiMessage as ChatMessage) ?? null };
}

export async function fetchChatUnreadCount(): Promise<number> {
  const data = await apiFetch('/chat/unread-count');
  return data.unreadCount as number;
}

export async function logSearch(query: string): Promise<void> {
  // Best-effort interest tracking (drives auto-wishlisting on the backend) —
  // never worth surfacing an error to the user over.
  await apiFetch('/search-log', { method: 'POST', body: JSON.stringify({ query }) }).catch(() => {});
}

export { ApiError };
