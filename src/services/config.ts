export const FINNHUB_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_FINNHUB_API_KEY || '',
  BASE_URL: 'https://finnhub.io/api/v1',
  WS_URL: 'wss://ws.finnhub.io',
} as const;

export const CACHE_DURATION = {
  QUOTE: 30 * 1000, // 30 seconds
  SEARCH: 5 * 60 * 1000, // 5 minutes
  HISTORICAL: 60 * 1000, // 1 minute
} as const;

export const TIME_FRAME_RESOLUTION: Record<string, { resolution: string; days: number }> = {
  '1D': { resolution: '5', days: 1 },
  '1W': { resolution: '15', days: 7 },
  '1M': { resolution: '60', days: 30 },
  '3M': { resolution: 'D', days: 90 },
  '6M': { resolution: 'D', days: 180 },
  'YTD': { resolution: 'D', days: -1 }, // Special case, calculated dynamically
  '1Y': { resolution: 'D', days: 365 },
  '2Y': { resolution: 'W', days: 730 },
  '5Y': { resolution: 'W', days: 1825 },
  '10Y': { resolution: 'M', days: 3650 },
  'ALL': { resolution: 'M', days: 7300 }, // ~20 years max
};
