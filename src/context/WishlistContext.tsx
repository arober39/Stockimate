import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Stock, WishlistItem } from '../types/stock';

const STORAGE_KEY = '@stockimate_wishlist';

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (stock: Stock) => Promise<void>;
  removeFromWishlist: (symbol: string) => Promise<void>;
  isInWishlist: (symbol: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist from storage on mount
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWishlist = async (newItems: WishlistItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (error) {
      console.error('Failed to save wishlist:', error);
    }
  };

  const addToWishlist = useCallback(async (stock: Stock) => {
    const exists = items.some(item => item.stock.symbol === stock.symbol);
    if (exists) return;

    const newItem: WishlistItem = {
      stock,
      addedAt: Date.now(),
    };

    const newItems = [newItem, ...items];
    setItems(newItems);
    await saveWishlist(newItems);
  }, [items]);

  const removeFromWishlist = useCallback(async (symbol: string) => {
    const newItems = items.filter(item => item.stock.symbol !== symbol);
    setItems(newItems);
    await saveWishlist(newItems);
  }, [items]);

  const isInWishlist = useCallback((symbol: string) => {
    return items.some(item => item.stock.symbol === symbol);
  }, [items]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
