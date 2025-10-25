# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite housing market data visualization application (POC Phase 2). It displays housing market data with interactive charts and market cards, designed to work with both live API data (RentCast API) and mock data fallback.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Core Data Flow
- **Data Sources**: Dual-mode architecture supporting both RentCast API and mock data
- **State Management**: React hooks with custom data fetching hooks
- **API Integration**: Axios-based service layer with error handling and fallback mechanisms
- **UI Framework**: React with Tailwind CSS for styling

### Key Architectural Patterns

**Hybrid Data Strategy**: The app automatically detects API configuration and falls back to mock data. The `useMarketData` hook handles this switching logic, checking `isAPIConfigured()` and gracefully degrading to mock data on API failures.

**Service Layer**: Centralized API client in `src/services/api.ts` with comprehensive error handling, rate limiting detection, and timeout management. All external API calls go through this layer.

**Type Safety**: Comprehensive TypeScript interfaces in `src/types/index.ts` covering all data models, component props, and API responses. The app maintains type safety across the mock/API data boundary.

**Component Architecture**: 
- Container components (App.tsx) handle state and data fetching
- Presentation components focus on UI rendering
- Custom hooks encapsulate data logic (`useMarketData`, `useHistoricalPrices`, etc.)

### Directory Structure
- `src/components/` - React UI components
- `src/hooks/` - Custom React hooks for data fetching
- `src/services/` - API client and external service integration
- `src/types/` - TypeScript type definitions
- `src/utils/` - Constants, data transformation, and utility functions

## Environment Setup

The application requires a RentCast API key for live data:
- Set `VITE_RENTCAST_API_KEY` in `.env` file
- Without API key, the app automatically uses mock data
- API configuration is checked via `isAPIConfigured()` function

## Data Transformation

The app includes robust data transformation utilities in `src/utils/dataTransform.ts` that normalize API responses into internal data models, generate historical data for visualization, and validate data integrity before rendering.

## Testing Strategy

Currently no test framework is configured. When adding tests, examine the codebase for the appropriate testing approach rather than assuming a specific framework.