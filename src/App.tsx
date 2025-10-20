import { useState } from 'react';
import { MarketCard } from './components/MarketCard';
import { PriceChart } from './components/PriceChart';
import { TimeRangeSelector } from './components/TimeRangeSelector';
import { MarketSearch } from './components/MarketSearch';
import { WatchlistPanel } from './components/WatchlistPanel';
import type { MarketPriceData, TimeRange, Market } from './types';

// Mock data for initial display
const mockMarketData: MarketPriceData[] = [
  {
    marketId: '1',
    marketName: 'Detroit, MI',
    currentPrice: 225000,
    priceChange: 5.2,
    changeDirection: 'up',
    historicalData: [],
    lastUpdated: new Date().toISOString(),
  },
  {
    marketId: '2',
    marketName: 'Anaheim, CA',
    currentPrice: 875000,
    priceChange: -2.1,
    changeDirection: 'down',
    historicalData: [],
    lastUpdated: new Date().toISOString(),
  },
  {
    marketId: '3',
    marketName: 'Austin, TX',
    currentPrice: 550000,
    priceChange: 8.7,
    changeDirection: 'up',
    historicalData: [],
    lastUpdated: new Date().toISOString(),
  },
  {
    marketId: '4',
    marketName: 'Miami, FL',
    currentPrice: 625000,
    priceChange: 3.4,
    changeDirection: 'up',
    historicalData: [],
    lastUpdated: new Date().toISOString(),
  },
  {
    marketId: '5',
    marketName: 'Seattle, WA',
    currentPrice: 825000,
    priceChange: -1.8,
    changeDirection: 'down',
    historicalData: [],
    lastUpdated: new Date().toISOString(),
  },
];

function App() {
  const [selectedMarket, setSelectedMarket] = useState<MarketPriceData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

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
              POC Phase 1
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
            {/* Market Cards Grid */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Featured Markets
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockMarketData.map((market) => (
                  <MarketCard
                    key={market.marketId}
                    market={market}
                    onClick={() => handleMarketClick(market)}
                    onAddToWatchlist={handleAddToWatchlist}
                  />
                ))}
              </div>
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
            Housing Data POC - Phase 1 Complete
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
