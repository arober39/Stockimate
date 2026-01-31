import { useState, useEffect, useCallback } from 'react';
import { yahooFinance } from '../services/yahooFinance';
import type { ChartDataPoint, TimeFrame } from '../types/stock';

export function useHistoricalData(symbol: string | null, timeFrame: TimeFrame) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const chartData = await yahooFinance.getHistoricalData(symbol, timeFrame);
      setData(chartData);
      if (chartData.length === 0) {
        setError('No historical data available');
      }
    } catch (err) {
      setError('Failed to fetch historical data');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeFrame]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
