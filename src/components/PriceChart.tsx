import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PriceChartProps } from '../types';
import { formatPriceShort, formatDate, formatPrice } from '../utils/formatters';
import { filterDataByTimeRange } from '../hooks/useHistoricalPrices';

/**
 * Chart loading skeleton
 */
const ChartSkeleton = () => {
  return (
    <div className="w-full h-96 bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="flex flex-col h-full justify-between">
        {/* Y-axis skeleton */}
        <div className="flex justify-between items-end h-full">
          <div className="flex flex-col justify-between h-full py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 w-12 bg-gray-200 rounded"></div>
            ))}
          </div>
          {/* Chart area skeleton */}
          <div className="flex-1 ml-4 h-full flex items-end gap-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-200 rounded-t"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              ></div>
            ))}
          </div>
        </div>
        {/* X-axis skeleton */}
        <div className="flex justify-between mt-4 px-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 w-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PriceChart = ({ data, timeRange }: PriceChartProps) => {
  const [isLoading, setIsLoading] = useState(true);

  // Filter data based on time range
  const filteredData = filterDataByTimeRange(data, timeRange);

  // Simulate loading state when data/timeRange changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [data, timeRange]);

  // Show loading skeleton
  if (isLoading) {
    return <ChartSkeleton />;
  }

  // If no data, show placeholder
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="w-full h-96 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500">No historical data available</p>
            <p className="text-gray-400 text-sm mt-2">
              Select a different time range or market
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900">
            {formatPrice(data.price)}
          </p>
          <p className="text-xs text-gray-500">{formatDate(data.date)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 sm:h-80 md:h-96 bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 animate-fadeIn">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={filteredData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatDate(date)}
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={(price) => formatPriceShort(price)}
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#1E40AF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#1E40AF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
