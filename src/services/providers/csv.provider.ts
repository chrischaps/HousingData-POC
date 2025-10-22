/**
 * CSV File Provider
 *
 * Loads housing market data from a user-uploaded CSV file.
 * Data is stored in localStorage for persistence across sessions.
 */

import { BaseProvider } from './base.provider';
import type { MarketStats, ProviderInfo } from './types';
import { parseCSV, validateCSVContent } from '../../utils/csvParser';
import { IndexedDBCache } from '../../utils/indexedDBCache';

const CSV_DATA_STORAGE_KEY = 'csv-file-content';
const CSV_FILENAME_STORAGE_KEY = 'csv-file-name';
const CSV_MARKETS_STORAGE_KEY = 'csv-parsed-markets';

export class CSVProvider extends BaseProvider {
  private cachedMarkets: Map<string, MarketStats> = new Map();
  private isDataLoaded: boolean = false;
  private loadingPromise: Promise<void> | null = null;

  readonly info: ProviderInfo = {
    id: 'csv',
    name: 'CSV File',
    description: 'Upload your own market data from a CSV file',
    icon: '📊',
    requiresApiKey: false,
    rateLimits: {
      limit: Infinity,
      period: 'unlimited',
    },
    features: {
      marketStats: true,
      propertySearch: false,
      propertyDetails: false,
    },
  };

  constructor() {
    super();
    // Load data asynchronously and store the promise
    this.loadingPromise = this.loadDataFromStorage().catch(error => {
      console.error('[CSV Provider] Failed to load on construction', error);
    });
    this.logInitialization();
  }

  /**
   * Wait for data to finish loading
   */
  async waitForDataLoad(): Promise<void> {
    if (this.loadingPromise) {
      await this.loadingPromise;
    }
  }

  isConfigured(): boolean {
    return this.isDataLoaded && this.cachedMarkets.size > 0;
  }

  /**
   * Load CSV data from IndexedDB if available
   */
  private async loadDataFromStorage(): Promise<void> {
    try {
      // Try to load pre-parsed markets first (faster)
      const cachedMarkets = await IndexedDBCache.get<MarketStats[]>(CSV_MARKETS_STORAGE_KEY);

      if (cachedMarkets && cachedMarkets.length > 0) {
        const filename = localStorage.getItem(CSV_FILENAME_STORAGE_KEY) || 'unknown.csv';

        console.log(
          '%c[CSV Provider] Loading parsed markets from IndexedDB',
          'color: #8B5CF6; font-weight: bold',
          { filename, markets: cachedMarkets.length }
        );

        this.cacheMarkets(cachedMarkets);
        this.isDataLoaded = true;

        console.log(
          '%c[CSV Provider] ✓ Data loaded successfully',
          'color: #10B981; font-weight: bold',
          { markets: cachedMarkets.length, filename }
        );
        return;
      }

      console.log(
        '%c[CSV Provider] No data in storage',
        'color: #8B5CF6',
        'Upload a CSV file to use this provider'
      );
    } catch (error) {
      console.error(
        '%c[CSV Provider] Failed to load data from storage',
        'color: #EF4444; font-weight: bold',
        error
      );
      await this.clearData();
    }
  }

  /**
   * Cache parsed markets for quick lookup
   */
  private cacheMarkets(markets: MarketStats[]): void {
    this.cachedMarkets.clear();

    markets.forEach(market => {
      // Create multiple lookup keys for flexibility
      const keys = [];

      if (market.zipCode) {
        keys.push(market.zipCode);
        keys.push(market.zipCode.toLowerCase());
      }

      if (market.city && market.state) {
        keys.push(`${market.city}, ${market.state}`);
        keys.push(`${market.city.toLowerCase()}, ${market.state.toLowerCase()}`);
        keys.push(`${market.city}-${market.state}`);
        keys.push(`${market.city.toLowerCase()}-${market.state.toLowerCase()}`);
      }

      keys.forEach(key => {
        this.cachedMarkets.set(key, market);
      });
    });

    console.log(
      '%c[CSV Provider] Cached markets',
      'color: #8B5CF6',
      { markets: markets.length, lookupKeys: this.cachedMarkets.size }
    );
  }

  /**
   * Upload and parse a CSV file
   */
  async uploadCSVFile(file: File): Promise<{ success: boolean; error?: string; markets?: number }> {
    try {
      console.log(
        '%c[CSV Provider] Uploading file',
        'color: #8B5CF6; font-weight: bold',
        { filename: file.name, size: file.size, type: file.type }
      );

      // Read file content
      const csvContent = await this.readFileAsText(file);

      // Validate CSV content
      const validation = validateCSVContent(csvContent);
      if (!validation.valid) {
        console.error(
          '%c[CSV Provider] Validation failed',
          'color: #EF4444; font-weight: bold',
          validation.error
        );
        return { success: false, error: validation.error };
      }

      // Parse CSV
      const markets = parseCSV(csvContent);

      if (markets.length === 0) {
        return { success: false, error: 'No valid market data found in CSV file' };
      }

      // Store parsed markets in IndexedDB (more efficient than storing raw CSV)
      await IndexedDBCache.set(CSV_MARKETS_STORAGE_KEY, markets, Infinity);

      // Store filename in localStorage (small, so localStorage is fine)
      localStorage.setItem(CSV_FILENAME_STORAGE_KEY, file.name);

      // Cache markets in memory
      this.cacheMarkets(markets);
      this.isDataLoaded = true;

      console.log(
        '%c[CSV Provider] ✓ File uploaded successfully',
        'color: #10B981; font-weight: bold',
        { filename: file.name, markets: markets.length }
      );

      return { success: true, markets: markets.length };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      console.error(
        '%c[CSV Provider] Upload failed',
        'color: #EF4444; font-weight: bold',
        error
      );

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Read file content as text
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          resolve(content);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };

      reader.onerror = () => {
        reject(new Error('File reading error'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Get all markets from CSV
   */
  getAllMarkets(): MarketStats[] {
    if (!this.isDataLoaded) {
      return [];
    }

    // Get unique markets (deduplicate by id)
    const uniqueMarkets = new Map<string, MarketStats>();

    this.cachedMarkets.forEach(market => {
      if (market.id && !uniqueMarkets.has(market.id)) {
        uniqueMarkets.set(market.id, market);
      }
    });

    return Array.from(uniqueMarkets.values());
  }

  /**
   * Get loaded filename
   */
  getFilename(): string | null {
    return localStorage.getItem(CSV_FILENAME_STORAGE_KEY);
  }

  /**
   * Clear all CSV data
   */
  async clearData(): Promise<void> {
    await IndexedDBCache.delete(CSV_MARKETS_STORAGE_KEY);
    localStorage.removeItem(CSV_FILENAME_STORAGE_KEY);
    this.cachedMarkets.clear();
    this.isDataLoaded = false;

    console.log(
      '%c[CSV Provider] Data cleared',
      'color: #8B5CF6'
    );
  }

  /**
   * Fetch market stats from cached CSV data
   */
  protected async fetchMarketStatsFromAPI(location: string): Promise<MarketStats | null> {
    if (!this.isDataLoaded) {
      console.warn(
        '%c[CSV Provider] No data loaded',
        'color: #F59E0B; font-weight: bold',
        'Upload a CSV file first'
      );
      return null;
    }

    // Simulate slight delay for consistency with other providers
    await new Promise(resolve => setTimeout(resolve, 50));

    // Try exact match first
    let market = this.cachedMarkets.get(location);

    // Try case-insensitive match
    if (!market) {
      market = this.cachedMarkets.get(location.toLowerCase());
    }

    if (market) {
      console.log(
        '%c[CSV Provider] ✓ Found market',
        'color: #10B981',
        { location, market: market.city + ', ' + market.state }
      );
    } else {
      console.warn(
        '%c[CSV Provider] Market not found',
        'color: #F59E0B',
        { location, available: Array.from(this.cachedMarkets.keys()).slice(0, 10) }
      );
    }

    return market || null;
  }
}
