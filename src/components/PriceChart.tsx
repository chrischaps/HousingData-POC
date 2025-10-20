import type { PriceChartProps } from '../types';

export const PriceChart = ({ data, timeRange }: PriceChartProps) => {
  return (
    <div className="w-full h-96 bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Chart Component</p>
          <p className="text-gray-400 text-sm mt-2">
            Time Range: {timeRange} | Data Points: {data.length}
          </p>
          <p className="text-gray-400 text-xs mt-4">
            Will be implemented in Phase 3
          </p>
        </div>
      </div>
    </div>
  );
};
