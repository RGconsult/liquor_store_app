import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchWishlistIds, toggleWishlistRequest } from '../services/api';

interface WishlistContextType {
  wishlistIds: string[];
  isLoading: boolean;
  toggleWishlist: (productId: string) => Promise<{ ok: boolean; error?: string }>;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setWishlistIds([]);
      return;
    }
    setIsLoading(true);
    try {
      const ids = await fetchWishlistIds();
      setWishlistIds(ids);
    } catch (e) {
      // Leave the last known list in place on a transient network error.
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      return { ok: false, error: 'Please log in to save drinks to your profile.' };
    }
    const previous = wishlistIds;
    const wasWishlisted = previous.includes(productId);
    setWishlistIds(wasWishlisted ? previous.filter((id) => id !== productId) : [...previous, productId]);

    try {
      await toggleWishlistRequest(productId);
      return { ok: true };
    } catch (e: any) {
      setWishlistIds(previous);
      return { ok: false, error: e?.message || 'Failed to update wishlist.' };
    }
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isLoading, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
