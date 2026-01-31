import { useState, useEffect, useCallback } from 'react';
import { yahooFinance } from '../services/yahooFinance';

export function usePurchasePrice(symbol: string | null, purchaseDate: Date) {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!symbol) {
      setPrice(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const historicalPrice = await yahooFinance.getPriceAtDate(symbol, purchaseDate);
      if (historicalPrice !== null) {
        setPrice(historicalPrice);
      } else {
        setError('No price data for this date');
      }
    } catch (err) {
      setError('Failed to fetch historical price');
      setPrice(null);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, purchaseDate]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  return { price, isLoading, error, refetch: fetchPrice };
}
