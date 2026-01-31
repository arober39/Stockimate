export interface Stock {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto';
  exchange?: string;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface StockCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

export type TimeFrame = '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '2Y' | '5Y' | '10Y' | 'ALL';

export interface CalculatorState {
  selectedStock: Stock | null;
  investmentAmount: number;
  purchaseDate: Date;
  currentPrice: number;
  purchasePrice: number;
}

export interface WishlistItem {
  stock: Stock;
  addedAt: number;
}

export interface SearchResult extends Stock {
  description?: string;
}
