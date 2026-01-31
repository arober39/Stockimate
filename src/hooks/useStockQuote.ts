import { useState, useEffect, useCallback } from 'react';
import { finnhubApi } from '../services/finnhubApi';
import { finnhubWS } from '../services/websocket';
import type { StockQuote } from '../types/stock';

export function useStockQuote(symbol: string | null) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    if (!symbol) {
      setQuote(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await finnhubApi.getQuote(symbol);
      if (data) {
        setQuote(data);
      } else {
        setError('No quote data available');
      }
    } catch (err) {
      setError('Failed to fetch quote');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!symbol) return;

    const unsubscribe = finnhubWS.subscribe(symbol, (_, price, timestamp) => {
      setQuote(prev => {
        if (!prev) return prev;
        const change = price - prev.previousClose;
        const changePercent = (change / prev.previousClose) * 100;
        return {
          ...prev,
          price,
          change,
          changePercent,
          timestamp,
        };
      });
    });

    return unsubscribe;
  }, [symbol]);

  return { quote, isLoading, error, refetch: fetchQuote };
}
