import type { MarketSearchProps } from '../types';

export const MarketSearch = (_props: MarketSearchProps) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search by city or ZIP code..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        disabled
      />
      <p className="text-xs text-gray-400 mt-1">
        Search functionality coming in Phase 4
      </p>
    </div>
  );
};
