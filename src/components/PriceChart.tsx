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

export const PriceChart = ({ data, timeRange }: PriceChartProps) => {
  // Filter data based on time range
  const filteredData = filterDataByTimeRange(data, timeRange);

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
    <div className="w-full h-96 bg-white rounded-lg shadow p-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={filteredData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
