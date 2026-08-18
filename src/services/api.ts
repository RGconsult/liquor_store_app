import { Product, CategoryItem, Order, NotificationItem, User } from '../types';
import { getItem, setItem } from './storage';
import { BOTTLE_IMAGES } from '../constants/bottleImages';

const API_BASE = '/api';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Monkey Shoulder',
    subtitle: 'Blended Malt Scotch Whisky',
    category: 'Whiskey',
    subCategory: 'Blended Malt',
    priceRwf: 64800,
    region: 'Speyside, Scotland',
    abv: '40.0%',
    volume: '750ml',
    badge: 'FEATURED BRAND',
    isFeatured: true,
    description: 'Made from 100% malt whisky blended together in small batches. Rich vanilla, sweet spice, and smooth oak notes with signature triple monkey emblem.',
    image: BOTTLE_IMAGES.Whiskey
  },
  {
    id: 'prod-2',
    name: 'Patrón Silver Tequila',
    subtitle: '100% De Agave Premium Tequila',
    category: 'Tequila',
    subCategory: 'Tequila',
    priceRwf: 87750,
    region: 'Jalisco, Mexico',
    abv: '40.0%',
    volume: '750ml',
    badge: 'STORE FAVORITE',
    isFeatured: true,
    description: 'Handcrafted from the finest 100% Weber Blue Agave. Crystal clear with fresh agave aromas, citrus notes, and an ultra-smooth peppered finish.',
    image: BOTTLE_IMAGES.Tequila
  },
  {
    id: 'prod-3',
    name: 'Glenmorangie 10 Years Original',
    subtitle: 'Highland Single Malt Scotch',
    category: 'Whiskey',
    subCategory: 'Single Malt',
    priceRwf: 74250,
    region: 'Highlands, Scotland',
    abv: '40.0%',
    volume: '750ml',
    description: 'Distilled in Scotland tallest stills and aged for 10 years in ex-bourbon casks. Delivers delicate notes of peach, vanilla, and floral citrus complexity.',
    image: BOTTLE_IMAGES.Whiskey
  },
  {
    id: 'prod-4',
    name: 'Hennessy V.S.O.P Privilège',
    subtitle: 'Cognac Fine Champagne',
    category: 'Brandy',
    subCategory: 'Cognac',
    priceRwf: 105300,
    region: 'Cognac, France',
    abv: '40.0%',
    volume: '750ml',
    badge: 'PREMIUM COGNAC',
    isFeatured: true,
    description: 'Harmonious cognac with aromas of candied fruit, subtle clove spice, and rich French oak notes.',
    image: BOTTLE_IMAGES.Brandy
  },
  {
    id: 'prod-5',
    name: 'Tanqueray No. Ten Gin',
    subtitle: 'Small Batch Distilled Gin',
    category: 'Gin',
    subCategory: 'London Dry',
    priceRwf: 60750,
    region: 'London, England',
    abv: '47.3%',
    volume: '750ml',
    badge: 'CRAFT GIN',
    isFeatured: true,
    description: 'Distilled in small batches with fresh whole citrus fruits and botanicals. Bright, refreshing, and exquisitely balanced.',
    image: BOTTLE_IMAGES.Gin
  },
  {
    id: 'prod-6',
    name: 'Zacapa 23 Solera Gran Reserva',
    subtitle: 'Guatemalan Aged Rum',
    category: 'Rum',
    subCategory: 'Aged Rum',
    priceRwf: 83700,
    region: 'Guatemala',
    abv: '40.0%',
    volume: '750ml',
    badge: 'SOLERA AGED',
    isFeatured: true,
    description: 'Aged high in the mountains of Guatemala using the Solera system. Notes of honeyed butterscotch, spiced oak, and dried fruit.',
    image: BOTTLE_IMAGES.Rum
  },
  {
    id: 'prod-7',
    name: 'Grey Goose Premium Vodka',
    subtitle: 'French Wheat Vodka',
    category: 'Vodka',
    subCategory: 'Ultra Premium',
    priceRwf: 70200,
    region: 'Cognac, France',
    abv: '40.0%',
    volume: '750ml',
    badge: 'STORE FAVORITE',
    isFeatured: true,
    description: 'Distilled from soft winter wheat grown in Picardy, blended with natural spring water from Gensac-la-Pallue. Exceptionally smooth.',
    image: BOTTLE_IMAGES.Vodka
  },
  {
    id: 'prod-8',
    name: 'Château Margaux 2015',
    subtitle: 'Premier Grand Cru Classé Bordeaux',
    category: 'Wine',
    subCategory: 'Red Wine',
    priceRwf: 391500,
    region: 'Bordeaux, France',
    abv: '13.5%',
    volume: '750ml',
    badge: 'RARE VINTAGE',
    isRare: true,
    isFeatured: true,
    description: 'Vibrant ruby color with bouquet of black currant, violet, dark truffle, and silky refined tannins.',
    image: BOTTLE_IMAGES.Wine
  },
  {
    id: 'prod-9',
    name: 'Ruinart Champagne Brut',
    subtitle: 'Blanc de Blancs Champagne',
    category: 'Wine',
    subCategory: 'Champagne',
    priceRwf: 148500,
    region: 'Reims, France',
    abv: '12.5%',
    volume: '750ml',
    badge: 'FINE CHAMPAGNE',
    isFeatured: true,
    description: 'Luminous golden hue, delicate persistent bubbles with fresh citrus, white peach, and white flower aromas.',
    image: BOTTLE_IMAGES.Champagne
  }
];

const MOCK_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Brandy', icon: 'glass', productCount: 4 },
  { id: 'cat-2', name: 'Gin', icon: 'glass', productCount: 6 },
  { id: 'cat-3', name: 'Rum', icon: 'glass', productCount: 5 },
  { id: 'cat-4', name: 'Tequila', icon: 'glass', productCount: 8 },
  { id: 'cat-5', name: 'Vodka', icon: 'glass', productCount: 7 },
  { id: 'cat-6', name: 'Whiskey', icon: 'glass', productCount: 12 },
  { id: 'cat-7', name: 'Wine', icon: 'glass', productCount: 15 }
];

export async function fetchProducts(params?: { category?: string; search?: string; sort?: string }): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'ALL') query.set('category', params.category);
    if (params?.search) query.set('q', params.search);
    if (params?.sort) query.set('sort', params.sort);

    const token = getItem('rv_jwt_token');
    const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        return data.products;
      }
    }
  } catch (e) {
    console.warn('API fetch products failed, using mock data:', e);
  }

  // Fallback mock filtering logic
  let list = [...MOCK_PRODUCTS];
  if (params?.category && params.category !== 'ALL') {
    list = list.filter((p) => p.category.toLowerCase() === params.category?.toLowerCase());
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  if (params?.sort === 'price-asc') {
    list.sort((a, b) => a.priceRwf - b.priceRwf);
  } else if (params?.sort === 'price-desc') {
    list.sort((a, b) => b.priceRwf - a.priceRwf);
  }
  return list;
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        return data.categories;
      }
    }
  } catch (e) {
    console.warn('API fetch categories failed, using mock data:', e);
  }
  return MOCK_CATEGORIES;
}

export async function submitOrder(orderData: any): Promise<{ orderId: string; token?: string }> {
  try {
    const token = getItem('rv_jwt_token');
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(orderData)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        setItem('rv_jwt_token', data.token);
      }
      return data;
    }
  } catch (e) {
    console.warn('Order API submission failed, simulating mock order creation:', e);
  }

  const mockOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  return { orderId: mockOrderId };
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const token = getItem('rv_jwt_token');
    if (!token) return [];

    const res = await fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      return data.orders || [];
    }
  } catch (e) {
    console.warn('Fetch orders API error:', e);
  }
  return [];
}
