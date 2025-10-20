import type { WatchlistPanelProps } from '../types';

export const WatchlistPanel = (_props: WatchlistPanelProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900">My Watchlist</h2>
      <p className="text-gray-500 text-sm">
        No markets in watchlist yet.
      </p>
      <p className="text-xs text-gray-400 mt-2">
        Watchlist functionality coming in Phase 5
      </p>
    </div>
  );
};
