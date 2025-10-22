import { useState, useEffect } from 'react';
import type { MarketPriceData } from '../types';
import { createProvider, getProviderType, CSVProvider } from '../services/providers';
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
  forceRefresh: () => void;
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
 * Fetch market data for a single location using the provider pattern
 */
const fetchMarketData = async (
  city: string,
  state: string,
  zipCode?: string,
  forceRefresh: boolean = false
): Promise<MarketPriceData | null> => {
  try {
    const location = zipCode || `${city}, ${state}`;
    const provider = createProvider();
    const stats = await provider.getMarketStats(location, forceRefresh);

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

  const fetchData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);

    const providerType = getProviderType();
    const provider = createProvider();

    console.log(
      `%c[useMarketData] ${forceRefresh ? 'Force refreshing' : 'Fetching'} market data via provider`,
      'color: #1E40AF; font-weight: bold',
      { forceRefresh, providerType }
    );

    try {
      // For CSV provider, get markets directly from the loaded data
      if (providerType === 'csv' && provider instanceof CSVProvider) {
        // Wait for data to finish loading from IndexedDB
        await provider.waitForDataLoad();

        const allMarkets = provider.getAllMarkets();

        if (allMarkets.length === 0) {
          console.warn(
            '%c[useMarketData] CSV provider has no markets - Falling back to MOCK DATA',
            'color: #F59E0B; font-weight: bold'
          );
          setData(generateMockMarketData());
          setLoading(false);
          return;
        }

        // Take first 20 markets for display
        const marketsToShow = allMarkets.slice(0, 20);

        console.log(
          '%c[useMarketData] Loading markets from CSV',
          'color: #8B5CF6; font-weight: bold',
          { total: allMarkets.length, showing: marketsToShow.length }
        );

        // Transform to MarketPriceData
        const transformedMarkets = marketsToShow.map(stats => {
          const marketId = stats.id || `${stats.city}-${stats.state}`;
          const marketName = `${stats.city}, ${stats.state}`;
          const marketData = transformToMarketPriceData(marketId, marketName, stats);

          // Use real historical data if available, otherwise generate
          if (stats.historicalPrices && stats.historicalPrices.length > 0) {
            marketData.historicalData = stats.historicalPrices.map(h => ({
              date: h.date,
              price: h.price,
            }));

            console.log(
              `%c[useMarketData] ${marketName} historical data`,
              'color: #10B981',
              {
                dataPoints: marketData.historicalData.length,
                dateRange: `${marketData.historicalData[0]?.date} to ${marketData.historicalData[marketData.historicalData.length - 1]?.date}`
              }
            );
          } else {
            // Generate historical data as fallback
            marketData.historicalData = generateHistoricalData(
              marketData.currentPrice,
              marketData.changeDirection === 'up'
                ? marketData.priceChange
                : -marketData.priceChange,
              12
            );
          }

          return marketData;
        }).filter(m => validateMarketData(m));

        setData(transformedMarkets);
        setLoading(false);
        return;
      }

      // For other providers, fetch specific markets
      const promises = MOCK_MARKETS.map((market) =>
        fetchMarketData(market.city, market.state, market.zipCode, forceRefresh)
      );

      const results = await Promise.all(promises);

      // Filter out null results and use valid data
      const validData = results.filter(
        (result): result is MarketPriceData => result !== null
      );

      console.log(
        `%c[useMarketData] API Response Summary`,
        'color: #1E40AF; font-weight: bold',
        {
          requested: MOCK_MARKETS.length,
          received: validData.length,
          markets: validData.map(m => ({ name: m.marketName, price: m.currentPrice }))
        }
      );

      if (validData.length === 0) {
        console.warn(
          '%c[useMarketData] No valid API data - Falling back to MOCK DATA',
          'color: #F59E0B; font-weight: bold'
        );
        setData(generateMockMarketData());
      } else {
        // If we got some data but not all, fill in with mock data
        if (validData.length < MOCK_MARKETS.length) {
          console.warn(
            `%c[useMarketData] Partial API data - Using ${validData.length} real + ${MOCK_MARKETS.length - validData.length} mock`,
            'color: #F59E0B; font-weight: bold'
          );
          const mockData = generateMockMarketData();
          const combined = [...validData];

          // Add mock data for missing markets
          for (let i = validData.length; i < MOCK_MARKETS.length; i++) {
            combined.push(mockData[i]);
          }

          setData(combined);
        } else {
          console.log(
            '%c[useMarketData] ✓ Successfully loaded REAL API data',
            'color: #10B981; font-weight: bold; font-size: 14px'
          );
          setData(validData);
        }
      }
    } catch (err) {
      console.error('Error fetching market data:', err);

      if (err instanceof Error) {
        setError(err.message);
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
    refetch: () => fetchData(false),
    forceRefresh: () => fetchData(true),
  };
};
