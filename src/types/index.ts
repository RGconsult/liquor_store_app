// Category names live in the database (fetched via fetchCategories()), not as a fixed
// set here — this stays a plain string (with 'ALL' as the sentinel for "no filter") so
// adding/renaming a category server-side needs no app code change to keep working.
export type LiquorCategory = string;

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  subCategory: string;
  priceUsd: number;
  region: string;
  abv: string;
  volume: string;
  description: string;
  image: string;
  badge?: string | null;
  isRare?: boolean;
  isLimited?: boolean;
  isFeatured?: boolean;
  active?: boolean;
  isWishlisted?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  percentOff: number;
  createdAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  freeDeliveryCredits?: number;
  themeMode?: 'light' | 'dark' | 'system' | null;
  memberSince?: string;
  pushToken?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  nameSnapshot: string;
  priceUsdSnapshot: number;
  quantity: number;
  product?: Product;
}

export interface DeliveryDetails {
  fulfillmentType: 'delivery' | 'pickup';
  fullName: string;
  email: string;
  contactPhone?: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  deliveryOption: 'now' | 'schedule';
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  paymentPlan: 'FULL' | 'PICKUP_PAY';
  momoNumber?: string;
  cardLast4?: string;
  upfrontPaidUsd: number;
  dueOnDeliveryUsd: number;
}

export interface Order {
  id: string;
  userId: string;
  status: 'ORDER_PLACED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  subtotalUsd: number;
  shippingUsd: number;
  taxesUsd: number;
  totalUsd: number;
  paymentMethod: 'card' | 'mobile';
  deliveryDetails: DeliveryDetails;
  freeDeliveryApplied: boolean;
  couponId?: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin' | 'ai';
  body: string;
  createdAt: string;
}
