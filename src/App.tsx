import { useState } from 'react';
import { MarketCard } from './components/MarketCard';
import { PriceChart } from './components/PriceChart';
import { TimeRangeSelector } from './components/TimeRangeSelector';
import { MarketSearch } from './components/MarketSearch';
import { WatchlistPanel } from './components/WatchlistPanel';
import { useMarketData } from './hooks/useMarketData';
import type { MarketPriceData, TimeRange, Market } from './types';

function App() {
  const [selectedMarket, setSelectedMarket] = useState<MarketPriceData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

  // Fetch market data using the custom hook
  const { data: marketData, loading, error } = useMarketData();

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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Housing Market Data
            </h1>
            <div className="text-sm text-gray-500">
              POC Phase 2
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="space-y-6">
              <MarketSearch onSelectMarket={handleSelectMarket} />
              <WatchlistPanel onSelectMarket={(id) => console.log('Watchlist select:', id)} />
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">{error}</p>
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
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow p-4 animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Market Data */}
              {!loading && marketData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
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
