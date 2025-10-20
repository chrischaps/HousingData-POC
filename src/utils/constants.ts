// API Configuration
export const API_BASE_URL = 'https://api.rentcast.io/v1';
export const API_KEY = import.meta.env.VITE_RENTCAST_API_KEY || '';

// localStorage keys
export const WATCHLIST_STORAGE_KEY = 'housing-watchlist';

// Time ranges
export const TIME_RANGES = ['1M', '6M', '1Y', '5Y', 'MAX'] as const;

// Mock markets for initial display
export const MOCK_MARKETS = [
  { id: '1', name: 'Detroit, MI', city: 'Detroit', state: 'MI', zipCode: '48201' },
  { id: '2', name: 'Anaheim, CA', city: 'Anaheim', state: 'CA', zipCode: '92805' },
  { id: '3', name: 'Austin, TX', city: 'Austin', state: 'TX', zipCode: '78701' },
  { id: '4', name: 'Miami, FL', city: 'Miami', state: 'FL', zipCode: '33101' },
  { id: '5', name: 'Seattle, WA', city: 'Seattle', state: 'WA', zipCode: '98101' },
];

// Design system colors (matching Tailwind config)
export const COLORS = {
  primary: '#1E40AF',
  priceUp: '#10B981',
  priceDown: '#EF4444',
  neutral: '#6B7280',
} as const;
