import { CACHE_DURATION } from './config';
import type { ChartDataPoint, TimeFrame } from '../types/stock';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const TIME_FRAME_CONFIG: Record<TimeFrame, { range: string; interval: string }> = {
  '1D': { range: '1d', interval: '5m' },
  '1W': { range: '5d', interval: '15m' },
  '1M': { range: '1mo', interval: '1h' },
  '3M': { range: '3mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1d' },
  'YTD': { range: 'ytd', interval: '1d' },
  '1Y': { range: '1y', interval: '1d' },
  '2Y': { range: '2y', interval: '1wk' },
  '5Y': { range: '5y', interval: '1wk' },
  '10Y': { range: '10y', interval: '1mo' },
  'ALL': { range: 'max', interval: '1mo' },
};

class YahooFinanceApi {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';

  private getFromCache<T>(key: string, duration: number): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (entry && Date.now() - entry.timestamp < duration) {
      return entry.data;
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getHistoricalData(
    symbol: string,
    timeFrame: TimeFrame
  ): Promise<ChartDataPoint[]> {
    const cacheKey = `yahoo:${symbol}:${timeFrame}`;
    const cached = this.getFromCache<ChartDataPoint[]>(cacheKey, CACHE_DURATION.HISTORICAL);
    if (cached) return cached;

    try {
      const config = TIME_FRAME_CONFIG[timeFrame];
      const url = `${this.baseUrl}/${encodeURIComponent(symbol)}?range=${config.range}&interval=${config.interval}&includePrePost=false`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (!response.ok) {
        console.warn(`Yahoo Finance API returned ${response.status}`);
        return [];
      }

      const data = await response.json();
      const result = data?.chart?.result?.[0];

      if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
        return [];
      }

      const timestamps: number[] = result.timestamp;
      const closes: (number | null)[] = result.indicators.quote[0].close;

      const chartData: ChartDataPoint[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const close = closes[i];
        if (close !== null && close !== undefined) {
          chartData.push({
            timestamp: timestamps[i] * 1000,
            value: close,
          });
        }
      }

      if (chartData.length > 0) {
        this.setCache(cacheKey, chartData);
      }

      return chartData;
    } catch (error) {
      console.error('Yahoo Finance error:', error);
      return [];
    }
  }

  async getPriceAtDate(symbol: string, date: Date): Promise<number | null> {
    // Get data that covers the date
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let timeFrame: TimeFrame;
    if (diffDays <= 5) timeFrame = '1W';
    else if (diffDays <= 30) timeFrame = '1M';
    else if (diffDays <= 90) timeFrame = '3M';
    else if (diffDays <= 180) timeFrame = '6M';
    else if (diffDays <= 365) timeFrame = '1Y';
    else if (diffDays <= 730) timeFrame = '2Y';
    else if (diffDays <= 1825) timeFrame = '5Y';
    else if (diffDays <= 3650) timeFrame = '10Y';
    else timeFrame = 'ALL';

    const data = await this.getHistoricalData(symbol, timeFrame);

    if (data.length === 0) return null;

    const targetTime = date.getTime();
    let closestPoint = data[0];
    let closestDiff = Math.abs(data[0].timestamp - targetTime);

    for (const point of data) {
      const diff = Math.abs(point.timestamp - targetTime);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestPoint = point;
      }
    }

    return closestPoint.value;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const yahooFinance = new YahooFinanceApi();
