import { useState, useEffect } from 'react';
import type { MarketPriceData } from '../types';
import { getMarketStats, isAPIConfigured, APIError } from '../services/api';
import {
  transformToMarketPriceData,
  generateHistoricalData,
  validateMarketData,
} from '../utils/dataTransform';
import { MOCK_MARKETS } from '../utils/constants';

interface UseMarketDataResult {
  data: MarketPriceData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Mock data generator for when API is not available
 */
const generateMockMarketData = (): MarketPriceData[] => {
  return [
    {
      marketId: '1',
      marketName: 'Detroit, MI',
      currentPrice: 225000,
      priceChange: 5.2,
      changeDirection: 'up',
      historicalData: generateHistoricalData(225000, 5.2, 12),
      lastUpdated: new Date().toISOString(),
    },
    {
      marketId: '2',
      marketName: 'Anaheim, CA',
      currentPrice: 875000,
      priceChange: 2.1,
      changeDirection: 'down',
      historicalData: generateHistoricalData(875000, -2.1, 12),
      lastUpdated: new Date().toISOString(),
    },
    {
      marketId: '3',
      marketName: 'Austin, TX',
      currentPrice: 550000,
      priceChange: 8.7,
      changeDirection: 'up',
      historicalData: generateHistoricalData(550000, 8.7, 12),
      lastUpdated: new Date().toISOString(),
    },
    {
      marketId: '4',
      marketName: 'Miami, FL',
      currentPrice: 625000,
      priceChange: 3.4,
      changeDirection: 'up',
      historicalData: generateHistoricalData(625000, 3.4, 12),
      lastUpdated: new Date().toISOString(),
    },
    {
      marketId: '5',
      marketName: 'Seattle, WA',
      currentPrice: 825000,
      priceChange: 1.8,
      changeDirection: 'down',
      historicalData: generateHistoricalData(825000, -1.8, 12),
      lastUpdated: new Date().toISOString(),
    },
  ];
};

/**
 * Fetch market data for a single location
 */
const fetchMarketData = async (
  city: string,
  state: string,
  zipCode?: string
): Promise<MarketPriceData | null> => {
  try {
    const location = zipCode || `${city}, ${state}`;
    const stats = await getMarketStats(location);

    if (!stats) {
      return null;
    }

    const marketId = zipCode || `${city}-${state}`;
    const marketName = `${city}, ${state}`;

    const marketData = transformToMarketPriceData(marketId, marketName, stats);

    // Generate historical data
    marketData.historicalData = generateHistoricalData(
      marketData.currentPrice,
      marketData.changeDirection === 'up'
        ? marketData.priceChange
        : -marketData.priceChange,
      12
    );

    return validateMarketData(marketData) ? marketData : null;
  } catch (error) {
    console.error(`Failed to fetch data for ${city}, ${state}:`, error);
    return null;
  }
};

/**
 * Custom hook to fetch market data for multiple markets
 * Falls back to mock data if API is not configured or fails
 */
export const useMarketData = (): UseMarketDataResult => {
  const [data, setData] = useState<MarketPriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // Check if API is configured
    if (!isAPIConfigured()) {
      console.warn('API key not configured, using mock data');
      setData(generateMockMarketData());
      setLoading(false);
      return;
    }

    try {
      // Fetch data for all mock markets
      const promises = MOCK_MARKETS.map((market) =>
        fetchMarketData(market.city, market.state, market.zipCode)
      );

      const results = await Promise.all(promises);

      // Filter out null results and use valid data
      const validData = results.filter(
        (result): result is MarketPriceData => result !== null
      );

      if (validData.length === 0) {
        console.warn('No valid data from API, using mock data');
        setData(generateMockMarketData());
      } else {
        // If we got some data but not all, fill in with mock data
        if (validData.length < MOCK_MARKETS.length) {
          const mockData = generateMockMarketData();
          const combined = [...validData];

          // Add mock data for missing markets
          for (let i = validData.length; i < MOCK_MARKETS.length; i++) {
            combined.push(mockData[i]);
          }

          setData(combined);
        } else {
          setData(validData);
        }
      }
    } catch (err) {
      console.error('Error fetching market data:', err);

      if (err instanceof APIError) {
        if (err.isRateLimit) {
          setError('API rate limit exceeded. Showing cached data.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load market data. Showing sample data.');
      }

      // Fall back to mock data on error
      setData(generateMockMarketData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
