import { useState, useCallback, useEffect, useRef } from 'react';
import type { Market } from '../types';
import { searchProperties, isAPIConfigured, APIError } from '../services/api';
import { transformToMarket, deduplicateMarkets } from '../utils/dataTransform';
import { MOCK_MARKETS } from '../utils/constants';

interface UseMarketSearchResult {
  results: Market[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
}

/**
 * Custom hook for searching markets with debouncing
 * Falls back to mock data filtering if API is not available
 */
export const useMarketSearch = (): UseMarketSearchResult => {
  const [results, setResults] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer reference
  const debounceTimerRef = useRef<number | null>(null);

  // Abort controller for canceling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Search using mock data (fallback when API is not available)
   */
  const searchMockData = useCallback((query: string): Market[] => {
    const lowerQuery = query.toLowerCase();
    return MOCK_MARKETS.filter(
      (market) =>
        market.name.toLowerCase().includes(lowerQuery) ||
        market.city.toLowerCase().includes(lowerQuery) ||
        market.state.toLowerCase().includes(lowerQuery) ||
        market.zipCode?.includes(query)
    );
  }, []);

  /**
   * Perform the actual search
   */
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check if API is configured
    if (!isAPIConfigured()) {
      console.warn('API not configured, searching mock data');
      const mockResults = searchMockData(query);
      setResults(mockResults);
      setLoading(false);
      return;
    }

    try {
      abortControllerRef.current = new AbortController();

      const properties = await searchProperties(query);

      // Transform properties to markets
      const markets = properties.map(transformToMarket);

      // Deduplicate markets
      const uniqueMarkets = deduplicateMarkets(markets);

      // Limit results to top 10
      const limitedResults = uniqueMarkets.slice(0, 10);

      setResults(limitedResults);
      setError(null);
    } catch (err) {
      // If request was aborted, don't update state
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      console.error('Search error:', err);

      if (err instanceof APIError) {
        if (err.isRateLimit) {
          setError('Search rate limit exceeded. Please try again later.');
        } else {
          setError(err.message);
        }

        // Fall back to mock data on API error
        const mockResults = searchMockData(query);
        setResults(mockResults);
      } else {
        setError('Search failed. Showing available markets.');
        const mockResults = searchMockData(query);
        setResults(mockResults);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [searchMockData]);

  /**
   * Debounced search function
   */
  const search = useCallback(
    (query: string) => {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // If query is empty, clear results immediately
      if (!query || query.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      // Set loading state immediately for better UX
      setLoading(true);

      // Set new timer (300ms debounce)
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    },
    [performSearch]
  );

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setLoading(false);

    // Cancel any pending search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
};
