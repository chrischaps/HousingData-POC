import { useState, useEffect } from 'react';
import type { PriceDataPoint, TimeRange } from '../types';
import { generateHistoricalDataForRange } from '../utils/dataTransform';

interface UseHistoricalPricesResult {
  data: PriceDataPoint[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage historical price data for a market
 * For POC, this generates synthetic historical data
 * In production, this would fetch from an API endpoint
 *
 * @param currentPrice - Current market price
 * @param priceChange - Recent price change percentage
 * @param changeDirection - Direction of price change
 * @param timeRange - Time range for historical data
 */
export const useHistoricalPrices = (
  currentPrice: number,
  priceChange: number,
  changeDirection: 'up' | 'down' | 'neutral',
  timeRange: TimeRange
): UseHistoricalPricesResult => {
  const [data, setData] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API delay for realistic loading state
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Calculate signed price change
        const signedPriceChange =
          changeDirection === 'up'
            ? priceChange
            : changeDirection === 'down'
            ? -priceChange
            : 0;

        // Generate historical data for the selected time range
        const historicalData = generateHistoricalDataForRange(
          currentPrice,
          signedPriceChange,
          timeRange
        );

        setData(historicalData);
      } catch (err) {
        console.error('Error generating historical data:', err);
        setError('Failed to load historical data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have valid price data
    if (currentPrice > 0) {
      fetchHistoricalData();
    } else {
      setLoading(false);
      setData([]);
    }
  }, [currentPrice, priceChange, changeDirection, timeRange]);

  return {
    data,
    loading,
    error,
  };
};

/**
 * Filter historical data by time range
 * This is a helper function for components that already have historical data
 * and just need to filter it by time range
 */
export const filterDataByTimeRange = (
  data: PriceDataPoint[],
  timeRange: TimeRange
): PriceDataPoint[] => {
  if (!data || data.length === 0) {
    return [];
  }

  const now = new Date();
  const cutoffDate = new Date(now);

  switch (timeRange) {
    case '1M':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case '6M':
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case '1Y':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    case '5Y':
      cutoffDate.setFullYear(now.getFullYear() - 5);
      break;
    case 'MAX':
      // Return all data
      return data;
  }

  return data.filter((point) => new Date(point.date) >= cutoffDate);
};
