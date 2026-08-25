import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, Product } from '../types';
import { getItemAsync, setItem } from '../services/storage';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalUsd: number;
  registerOnAdd: (cb: (() => void) | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Each account gets its own cart on this device — otherwise whatever was
// sitting in a shared cart carries over to the next person who signs in.
function cartStorageKey(userId: string): string {
  return `rv_cart_${userId}`;
}

export const CartProvider: React.FC<{ userId: string; children: React.ReactNode }> = ({ userId, children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Lets screens (e.g. the tab navigator in App.tsx) react to a successful
  // add-to-cart without every product card needing a navigation prop threaded
  // down to it.
  const onAddRef = useRef<(() => void) | null>(null);
  const registerOnAdd = (cb: (() => void) | null) => {
    onAddRef.current = cb;
  };

  useEffect(() => {
    let cancelled = false;
    setIsHydrated(false);
    getItemAsync(cartStorageKey(userId)).then((saved) => {
      if (cancelled) return;
      setCart(saved ? JSON.parse(saved) : []);
      setIsHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!isHydrated) return; // don't overwrite storage with [] before the real cart loads
    setItem(cartStorageKey(userId), JSON.stringify(cart));
  }, [cart, isHydrated, userId]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    onAddRef.current?.();
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotalUsd = cart.reduce(
    (sum, item) => sum + item.product.priceUsd * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotalUsd,
        registerOnAdd
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
