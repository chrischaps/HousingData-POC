// Market types
export interface Market {
  id: string;
  name: string;          // "Detroit, MI" or "Anaheim, CA"
  city: string;
  state: string;
  zipCode?: string;
}

// Price data types
export interface PriceDataPoint {
  date: string;          // ISO date string
  price: number;
  propertyType: 'single_family' | 'condo' | 'apartment';
}

export interface MarketPriceData {
  marketId: string;
  marketName: string;
  currentPrice: number;
  priceChange: number;   // percentage
  changeDirection: 'up' | 'down' | 'neutral';
  historicalData: PriceDataPoint[];
  lastUpdated: string;
}

// Watchlist types
export interface WatchlistItem {
  marketId: string;
  marketName: string;
  addedAt: string;       // ISO date string
}

// Component prop types
export interface MarketCardProps {
  market: MarketPriceData;
  onClick: () => void;
  onAddToWatchlist?: () => void;
}

export interface PriceChartProps {
  data: PriceDataPoint[];
  timeRange: '1M' | '6M' | '1Y' | '5Y' | 'MAX';
}

export interface TimeRangeSelectorProps {
  selected: string;
  onChange: (range: string) => void;
}

export interface MarketSearchProps {
  onSelectMarket: (market: Market) => void;
}

export interface WatchlistPanelProps {
  onSelectMarket: (marketId: string) => void;
}

// Time range type
export type TimeRange = '1M' | '6M' | '1Y' | '5Y' | 'MAX';
