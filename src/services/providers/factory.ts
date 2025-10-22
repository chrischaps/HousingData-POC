/**
 * Provider Factory
 *
 * Creates and returns the appropriate housing data provider based on
 * environment configuration or user selection.
 */

import type { IHousingDataProvider } from './types';
import { MockProvider } from './mock.provider';
import { ZillowMetricsProvider } from './zillow-metrics.provider';
import { CSVProvider } from './csv.provider';

/**
 * Get the configured provider type from environment or localStorage
 */
export function getProviderType(): string {
  // Check localStorage first (user selection takes precedence)
  const storedProvider = localStorage.getItem('housing-data-provider');
  if (storedProvider) {
    console.log(
      '%c[Provider Factory] Using provider from localStorage',
      'color: #8B5CF6; font-weight: bold',
      { provider: storedProvider }
    );
    return storedProvider;
  }

  // Fall back to environment variable
  const envProvider = import.meta.env.VITE_DATA_PROVIDER || 'mock';
  console.log(
    '%c[Provider Factory] Using provider from environment',
    'color: #8B5CF6; font-weight: bold',
    { provider: envProvider }
  );
  return envProvider;
}

/**
 * Create and return the appropriate housing data provider
 */
export function createProvider(): IHousingDataProvider {
  const providerType = getProviderType();

  console.log(
    '%c[Provider Factory] Creating provider',
    'color: #8B5CF6; font-weight: bold; font-size: 14px',
    { type: providerType }
  );

  switch (providerType) {
    case 'zillow-metrics':
      // Lazy load Zillow provider
      return createZillowMetricsProvider();

    case 'rentcast':
      // Lazy load RentCast provider
      return createRentCastProvider();

    case 'csv':
      // CSV file provider
      return createCSVProvider();

    case 'mock':
    default:
      return new MockProvider();
  }
}

/**
 * Create Zillow Metrics provider
 */
function createZillowMetricsProvider(): IHousingDataProvider {
  const provider = new ZillowMetricsProvider();

  if (!provider.isConfigured()) {
    console.warn(
      '%c[Provider Factory] Zillow Metrics not configured',
      'color: #F59E0B; font-weight: bold',
      'Falling back to Mock provider. Add VITE_ZILLOW_METRICS_API_KEY to .env'
    );
    return new MockProvider();
  }

  return provider;
}

/**
 * Create RentCast provider
 * (Will be implemented in refactoring step)
 */
function createRentCastProvider(): IHousingDataProvider {
  console.warn(
    '%c[Provider Factory] RentCast provider not yet migrated',
    'color: #F59E0B; font-weight: bold',
    'Falling back to Mock provider'
  );

  // TODO: Implement RentCastProvider by refactoring existing code
  // For now, fall back to mock
  return new MockProvider();
}

/**
 * Create CSV provider
 */
function createCSVProvider(): IHousingDataProvider {
  const provider = new CSVProvider();

  if (!provider.isConfigured()) {
    console.warn(
      '%c[Provider Factory] CSV provider not configured',
      'color: #F59E0B; font-weight: bold',
      'No CSV file loaded. Upload a CSV file to use this provider'
    );
  }

  return provider;
}

/**
 * Get available provider types
 */
export function getAvailableProviders(): Array<{
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'available' | 'pending' | 'requires-setup';
}> {
  return [
    {
      id: 'mock',
      name: 'Mock Data',
      icon: '🎭',
      description: 'Sample data for development and testing',
      status: 'available',
    },
    {
      id: 'csv',
      name: 'CSV File',
      icon: '📊',
      description: 'Upload your own market data from a CSV file',
      status: 'available',
    },
    {
      id: 'zillow-metrics',
      name: 'Zillow Market Metrics',
      icon: '🏘️',
      description: 'Market-level statistics from national to neighborhood',
      status: 'requires-setup',
    },
    {
      id: 'rentcast',
      name: 'RentCast',
      icon: '🏠',
      description: 'Property and market data with valuations',
      status: 'pending', // Will be 'requires-setup' after implementation
    },
  ];
}
