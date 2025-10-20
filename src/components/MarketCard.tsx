import type { MarketCardProps } from '../types';
import { formatPrice, formatPercentage } from '../utils/formatters';

export const MarketCard = ({ market, onClick, onAddToWatchlist }: MarketCardProps) => {
  const isPositive = market.changeDirection === 'up';
  const arrow = isPositive ? '↑' : '↓';

  return (
    <div
      className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{market.marketName}</h3>
          <p className="text-sm text-gray-500">Single Family Home</p>
        </div>
        {onAddToWatchlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToWatchlist();
            }}
            className="text-primary hover:text-blue-800 font-medium text-sm transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">
          {formatPrice(market.currentPrice)}
        </p>
        <p className={`text-sm font-medium ${isPositive ? 'text-price-up' : 'text-price-down'}`}>
          {arrow} {formatPercentage(Math.abs(market.priceChange))}
        </p>
      </div>
    </div>
  );
};
