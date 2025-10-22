import { useState, useEffect } from 'react';
import { MarketCard } from './components/MarketCard';
import { MarketCardSkeletonGrid } from './components/MarketCardSkeleton';
import { PriceChart } from './components/PriceChart';
import { TimeRangeSelector } from './components/TimeRangeSelector';
import { MarketSearch } from './components/MarketSearch';
import { WatchlistPanel } from './components/WatchlistPanel';
import { ApiStatusIndicator } from './components/ApiStatusIndicator';
import { CacheManager } from './components/CacheManager';
import { CacheMigration } from './components/CacheMigration';
import { SettingsPanel } from './components/SettingsPanel';
import { useMarketData } from './hooks/useMarketData';
import { isAPIConfigured } from './services/api';
import type { MarketPriceData, TimeRange, Market } from './types';

function App() {
  const [selectedMarket, setSelectedMarket] = useState<MarketPriceData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [dataSource, setDataSource] = useState<'api' | 'mock' | 'partial'>('mock');

  // Fetch market data using the custom hook
  const { data: marketData, loading, error, forceRefresh } = useMarketData();

  // Determine data source based on API configuration and data
  useEffect(() => {
    if (!isAPIConfigured()) {
      setDataSource('mock');
    } else if (marketData.length > 0) {
      // If API is configured and we have data, assume it's from API
      // (In a real app, we'd track this more explicitly)
      setDataSource('api');
    }
  }, [marketData]);

  const handleMarketClick = (market: MarketPriceData) => {
    setSelectedMarket(market);
  };

  const handleSelectMarket = (market: Market) => {
    console.log('Selected market:', market);
  };

  const handleAddToWatchlist = () => {
    console.log('Add to watchlist clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cache Migration Notification */}
      <CacheMigration />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Housing Market Data
              </h1>
              <ApiStatusIndicator hasError={!!error} dataSource={dataSource} />
            </div>
            <div className="text-sm text-gray-500">
              POC Phase 2
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="space-y-6">
              <SettingsPanel />
              <MarketSearch onSelectMarket={handleSelectMarket} />
              <CacheManager onClearCache={forceRefresh} />
              <WatchlistPanel onSelectMarket={(id) => console.log('Watchlist select:', id)} />
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-slideIn">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 text-xl flex-shrink-0">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900 mb-1">
                      Data Loading Issue
                    </p>
                    <p className="text-sm text-yellow-800">
                      {error}
                    </p>
                    <p className="text-xs text-yellow-700 mt-2">
                      Showing sample data for demonstration. Try uploading a CSV file or checking your API configuration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Market Cards Grid */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Featured Markets
              </h2>

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MarketCardSkeletonGrid count={5} />
                </div>
              )}

              {/* Market Data */}
              {!loading && marketData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-animation">
                  {marketData.map((market) => (
                    <MarketCard
                      key={market.marketId}
                      market={market}
                      onClick={() => handleMarketClick(market)}
                      onAddToWatchlist={handleAddToWatchlist}
                    />
                  ))}
                </div>
              )}

              {/* No Data State */}
              {!loading && marketData.length === 0 && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No market data available</p>
                </div>
              )}
            </section>

            {/* Chart Section */}
            {selectedMarket && (
              <section className="space-y-3 sm:space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {selectedMarket.marketName}
                  </h2>
                  <TimeRangeSelector
                    selected={timeRange}
                    onChange={(range) => setTimeRange(range as TimeRange)}
                  />
                </div>
                <PriceChart
                  data={selectedMarket.historicalData}
                  timeRange={timeRange}
                />
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Housing Data POC - Phase 2: API Integration
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
