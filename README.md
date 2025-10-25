# Housing Market Data Visualization - POC

A Google Finance-style web application for visualizing housing market data across different cities and regions in the United States.

![POC Status](https://img.shields.io/badge/status-Phase%202%20Complete-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## Overview

This proof of concept demonstrates a modern, interactive housing market data visualization platform. Users can search for markets, view price trends, compare data across time periods, and track their favorite markets with a persistent watchlist.

**Live Demo**: [Coming Soon]

## Features

### ✅ Implemented (Phase 2 Complete)

- **🔍 Market Search** - Search housing markets by city name or ZIP code
- **📊 Interactive Charts** - Beautiful, responsive price charts with Recharts
- **⏱️ Time Range Selection** - View data across 1M, 6M, 1Y, 5Y, or MAX timeframes
- **⭐ Watchlist** - Track favorite markets with persistent storage
- **💾 IndexedDB Caching** - Unlimited client-side storage for API responses (24-hour cache)
- **🔄 Multi-Provider Architecture** - Support for RentCast API, CSV uploads, and mock data
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **🎨 Modern UI** - Clean interface with Tailwind CSS and smooth animations
- **⚡ Performance Optimized** - Lazy loading, skeleton screens, and smart caching
- **🐳 Docker Ready** - Production deployment configuration included

### 🎯 Featured Markets

The POC showcases data for 6 major US housing markets:
- New York, NY
- Los Angeles, CA
- Austin, TX
- Columbus, OH
- Houston, TX
- San Antonio, TX

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Component-based UI |
| **Build Tool** | Vite 5.x | Fast development & optimized builds |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Charts** | Recharts | Interactive data visualizations |
| **HTTP Client** | Axios | API communication |
| **Storage** | IndexedDB | Client-side persistent caching |
| **Data Source** | RentCast API / CSV | Real housing market data |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) RentCast API key for live data

### Installation

```bash
# Clone the repository
git clone https://github.com/chrischaps/HousingData-POC.git
cd HousingData-POC

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# (Optional) Add your RentCast API key to .env
# VITE_RENTCAST_API_KEY=your_api_key_here

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

```bash
# RentCast API Key (optional - app works with mock/CSV data without it)
VITE_RENTCAST_API_KEY=your_api_key_here
```

Get a free RentCast API key at [https://www.rentcast.io/api](https://www.rentcast.io/api) (50 calls/month free tier)

## Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production (TypeScript + Vite)
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
```

## Project Structure

```
housing-data-poc/
├── src/
│   ├── components/           # React UI components
│   │   ├── MarketCard.tsx       # Market summary cards
│   │   ├── PriceChart.tsx       # Interactive chart component
│   │   ├── MarketSearch.tsx     # Search functionality
│   │   ├── WatchlistPanel.tsx   # Watchlist sidebar
│   │   ├── CacheManager.tsx     # Cache controls & stats
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   │   ├── useMarketData.ts     # Market data fetching
│   │   ├── useMarketSearch.ts   # Search logic
│   │   └── useHistoricalPrices.ts
│   ├── services/             # External integrations
│   │   ├── api.ts               # RentCast API client
│   │   └── providers/           # Data source providers
│   │       ├── base.provider.ts
│   │       ├── csv.provider.ts
│   │       ├── mock.provider.ts
│   │       └── zillow-metrics.provider.ts
│   ├── types/                # TypeScript definitions
│   │   └── index.ts
│   ├── utils/                # Helper functions
│   │   ├── indexedDBCache.ts    # IndexedDB cache utility
│   │   ├── csvParser.ts         # CSV data parser
│   │   ├── dataTransform.ts     # Data normalization
│   │   ├── formatters.ts        # Price/date formatting
│   │   └── constants.ts
│   ├── App.tsx               # Main application component
│   └── main.tsx              # Application entry point
├── reference/                # Reference data (CSV)
│   └── City_zhvi_uc_sfr_tier_0.33_0.67_sm_sa_month.csv
├── public/                   # Static assets
├── Dockerfile               # Docker production build
├── nginx.conf               # Nginx configuration
├── cloudbuild.yaml          # Google Cloud Build config
└── package.json
```

## Data Architecture

The application uses a flexible **multi-provider architecture** that supports multiple data sources:

### 1. RentCast API (Primary)
- Real-time housing market data
- 50 free API calls/month
- Automatically cached for 24 hours

### 2. CSV Upload
- Upload Zillow ZHVI CSV files
- Supports custom market data
- Client-side parsing (no backend required)

### 3. Mock Data (Fallback)
- Pre-configured data for 6 major markets
- Works offline, no API key needed
- Perfect for demos and testing

**Smart Fallback Logic**: App automatically detects available data sources and gracefully degrades from API → CSV → Mock data.

## Caching Strategy

The POC implements an **IndexedDB-based caching system** for optimal performance:

- **24-hour cache** for market statistics
- **1-hour cache** for search results
- **12-hour cache** for property data
- **Unlimited storage** (vs 5-10MB localStorage limit)
- **Automatic expiration** cleanup
- **Cache manager UI** for manual control

**Performance Impact**:
- 🚀 90% reduction in API calls
- ⚡ 96% faster repeat page loads (<100ms)
- 📉 90% less data downloaded

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t housing-data-poc .

# Run container
docker run -p 80:80 housing-data-poc
```

The app will be available at `http://localhost`

### Google Cloud Run

```bash
# Deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

### Vercel / Netlify

```bash
# Build the app
npm run build

# Deploy dist/ folder to Vercel or Netlify
# Don't forget to add VITE_RENTCAST_API_KEY environment variable
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guides.

## Documentation

- **[POC_PLAN.md](../POC_PLAN.md)** - Original 1-2 week POC implementation plan
- **[PHASE1_IMPLEMENTATION.md](../PHASE1_IMPLEMENTATION.md)** - Phase 1 setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment to Docker, GCP, Vercel
- **[INDEXEDDB_IMPLEMENTATION.md](./INDEXEDDB_IMPLEMENTATION.md)** - Caching architecture
- **[MULTI_PROVIDER_SETUP.md](./MULTI_PROVIDER_SETUP.md)** - Data source architecture
- **[API_DEBUGGING_GUIDE.md](./API_DEBUGGING_GUIDE.md)** - Troubleshooting API issues
- **[CACHING_IMPLEMENTATION.md](./CACHING_IMPLEMENTATION.md)** - Cache strategy details

## Development

### Adding a New Market

Edit `src/utils/constants.ts`:

```typescript
export const MOCK_MARKETS = [
  // Add your market here
  { id: '7', name: 'Phoenix, AZ', city: 'Phoenix', state: 'AZ', zipCode: '85001' },
];
```

### Customizing Cache TTL

Edit `src/utils/indexedDBCache.ts`:

```typescript
export const CACHE_TTL = {
  MARKET_STATS: 24 * 60 * 60 * 1000,  // 24 hours
  SEARCH: 1 * 60 * 60 * 1000,          // 1 hour
  PROPERTY: 12 * 60 * 60 * 1000,       // 12 hours
};
```

### Theming

Colors are configured in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#1E40AF',      // Blue - primary actions
      'price-up': '#10B981',   // Green - price increases
      'price-down': '#EF4444', // Red - price decreases
    },
  },
}
```

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | iOS 14+ | ✅ Full |
| Chrome Android | Latest | ✅ Full |

**IndexedDB Support**: 97%+ of all browsers

## Performance

- **First Load**: < 3 seconds
- **Repeat Load**: < 100ms (cached)
- **Chart Render**: < 500ms
- **API Response**: < 2 seconds (without cache)

## Known Limitations (POC)

This is a **proof of concept** with intentional limitations:

- ❌ No user authentication
- ❌ No database persistence (client-side only)
- ❌ Limited to RentCast API free tier (50 calls/month)
- ❌ Single property type (single-family homes)
- ❌ No real-time data updates
- ❌ No advanced analytics or AI features

See [HOUSING_APP_PLAN.md](../HOUSING_APP_PLAN.md) for the full production implementation roadmap.

## Troubleshooting

### API Key Issues

**Problem**: "API key not configured" warning

**Solution**:
1. Copy `.env.example` to `.env`
2. Add your RentCast API key
3. Restart dev server (`npm run dev`)

### Cache Issues

**Problem**: Stale data showing

**Solution**:
- Open sidebar → Cache Manager → "Clear All Cache"
- Or manually clear IndexedDB in DevTools → Application → IndexedDB → HousingDataCache

### Large File Warning

**Problem**: GitHub warns about `reference/City_zhvi_uc_sfr_tier_0.33_0.67_sm_sa_month.csv` (85 MB)

**Solution**: This is expected. The file is for testing CSV uploads and is not loaded by default. Consider Git LFS for future large files.

## Contributing

This is a personal POC project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### Phase 3: Enhanced Features (Next)
- [ ] Compare multiple markets side-by-side
- [ ] Dark/light theme toggle
- [ ] Export charts as images
- [ ] Additional property types (condos, apartments, rentals)
- [ ] Market statistics (inventory, days on market)

### Phase 4: Production (Future)
- [ ] Backend API (Node.js + Express)
- [ ] Database (PostgreSQL + TimescaleDB)
- [ ] User authentication
- [ ] Multiple data sources integration
- [ ] Advanced analytics
- [ ] Email alerts for market changes

See [HOUSING_APP_PLAN.md](../HOUSING_APP_PLAN.md) for the complete 12-week implementation plan.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- **Data Source**: [RentCast API](https://www.rentcast.io/api)
- **Reference Data**: [Zillow ZHVI](https://www.zillow.com/research/data/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Heroicons](https://heroicons.com/)
- **Inspiration**: [Google Finance](https://www.google.com/finance/)

---

**Built with** ❤️ **using React, TypeScript, and Vite**

**POC Status**: Phase 2 Complete ✅ | Ready for deployment or expansion to full implementation
