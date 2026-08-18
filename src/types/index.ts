export type LiquorCategory = 'Brandy' | 'Gin' | 'Rum' | 'Tequila' | 'Vodka' | 'Whiskey' | 'Wine' | 'ALL';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  subCategory: string;
  priceRwf: number;
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  freeDeliveryCredits?: number;
  memberSince?: string;
  pushToken?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  nameSnapshot: string;
  priceRwfSnapshot: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: 'ORDER_PLACED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  subtotalRwf: number;
  shippingRwf: number;
  totalRwf: number;
  paymentMethod: 'card' | 'mobile' | 'pickup_cash';
  deliveryDetails: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    province: string;
    momoNumber?: string;
    paymentPlan?: string;
    upfrontPaidRwf?: number;
    dueOnDeliveryRwf?: number;
  };
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
