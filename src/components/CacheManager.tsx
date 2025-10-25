import { useState, useEffect } from 'react';
import { IndexedDBCache as APICache, formatCacheSize, type CacheStats } from '../utils/indexedDBCache';

interface CacheManagerProps {
  onClearCache?: () => void;
}

/**
 * Component to display individual cache key with age
 */
const CacheKeyItem = ({ cacheKey }: { cacheKey: string }) => {
  const [ageMinutes, setAgeMinutes] = useState<string>('?');

  useEffect(() => {
    const loadAge = async () => {
      const age = await APICache.getAge(cacheKey);
      setAgeMinutes(age ? (age / (1000 * 60)).toFixed(1) : '?');
    };
    loadAge();
  }, [cacheKey]);

  return (
    <li
      className="text-xs text-gray-600 font-mono truncate"
      title={cacheKey}
    >
      {cacheKey} <span className="text-gray-400">({ageMinutes}m old)</span>
    </li>
  );
};

export const CacheManager = ({ onClearCache }: CacheManagerProps) => {
  const [stats, setStats] = useState<CacheStats>({
    count: 0,
    keys: [],
    totalSize: 0,
    byType: {
      'market-stats': 0,
      'search': 0,
      'property': 0,
      'other': 0,
    },
  });
  const [showDetails, setShowDetails] = useState(false);

  const updateStats = async () => {
    const newStats = await APICache.getStats();
    setStats(newStats);
  };

  useEffect(() => {
    // Initial load
    updateStats();

    // Update stats periodically
    const interval = setInterval(() => {
      updateStats();
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    if (window.confirm('Clear all cached API data? The app will reload to fetch fresh data.')) {
      await APICache.clear();
      await updateStats();

      // Call parent callback if provided
      if (onClearCache) {
        onClearCache();
      } else {
        // Default: reload the page
        window.location.reload();
      }
    }
  };

  const handleClearExpired = async () => {
    await APICache.clearExpired();
    await updateStats();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Cache Status</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-primary hover:underline"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Cache Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Cached Items:</span>
          <span className="font-medium text-gray-900">{stats.count}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Cache Size:</span>
          <span className="font-medium text-gray-900">{formatCacheSize(stats.totalSize)}</span>
        </div>

        {/* Cache Status Indicator */}
        {stats.count > 0 ? (
          <div className="flex items-center gap-2 text-green-600">
            <span className="text-xs">●</span>
            <span className="text-xs">Active - Reducing API calls</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-xs">○</span>
            <span className="text-xs">Empty - No cached data</span>
          </div>
        )}
      </div>

      {/* Detailed View */}
      {showDetails && stats.count > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Cached Keys:</h4>

          {/* By Type Breakdown */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(stats.byType).map(([type, count]) => (
              count > 0 && (
                <div key={type} className="bg-gray-50 rounded px-2 py-1">
                  <div className="text-xs text-gray-600">{type}:</div>
                  <div className="text-sm font-medium text-gray-900">{count}</div>
                </div>
              )
            ))}
          </div>

          <div className="max-h-32 overflow-y-auto">
            <ul className="space-y-1">
              {stats.keys.map((key, index) => (
                <CacheKeyItem key={index} cacheKey={key} />
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 space-y-2">
        <button
          onClick={handleClearExpired}
          className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm font-medium transition-colors"
          disabled={stats.count === 0}
        >
          Clear Expired
        </button>
        <button
          onClick={handleClearCache}
          className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
          disabled={stats.count === 0}
        >
          Clear All Cache
        </button>
      </div>

      {/* Help Text */}
      <p className="mt-3 text-xs text-gray-500">
        Cache stores API responses locally to reduce API calls and improve performance.
        Data expires automatically after 24 hours.
      </p>
    </div>
  );
};
