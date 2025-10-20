import axios, { type AxiosInstance } from 'axios';
import { API_BASE_URL, API_KEY } from '../utils/constants';

/**
 * API Response types from RentCast
 */
interface RentCastProperty {
  id: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
}

interface RentCastMarketStats {
  city?: string;
  state?: string;
  zipCode?: string;
  averagePrice?: number;
  medianPrice?: number;
  percentChange?: number;
}

/**
 * API Error handling
 */
export class APIError extends Error {
  statusCode?: number;
  isRateLimit: boolean;

  constructor(
    message: string,
    statusCode?: number,
    isRateLimit: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.isRateLimit = isRateLimit;
  }
}

/**
 * Axios instance configured for RentCast API
 */
const createAPIClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
  });

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const status = error.response.status;
        const isRateLimit = status === 429;

        if (isRateLimit) {
          throw new APIError(
            'API rate limit exceeded. Please try again later.',
            status,
            true
          );
        }

        if (status === 401 || status === 403) {
          throw new APIError(
            'Invalid API key. Please check your configuration.',
            status
          );
        }

        throw new APIError(
          `API request failed: ${error.response.data?.message || error.message}`,
          status
        );
      }

      if (error.code === 'ECONNABORTED') {
        throw new APIError('Request timeout. Please try again.');
      }

      throw new APIError('Network error. Please check your connection.');
    }
  );

  return client;
};

const apiClient = createAPIClient();

/**
 * Search for properties by location
 * @param query - City name or ZIP code
 * @returns Array of properties
 */
export const searchProperties = async (query: string): Promise<RentCastProperty[]> => {
  try {
    // Try ZIP code first (numeric)
    if (/^\d{5}$/.test(query)) {
      const response = await apiClient.get('/properties', {
        params: {
          zipCode: query,
          limit: 50,
        },
      });
      return response.data || [];
    }

    // Otherwise search by city
    const response = await apiClient.get('/properties', {
      params: {
        city: query,
        limit: 50,
      },
    });
    return response.data || [];
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to search properties');
  }
};

/**
 * Get market statistics for a location
 * @param location - City name or ZIP code
 * @returns Market statistics
 */
export const getMarketStats = async (
  location: string
): Promise<RentCastMarketStats | null> => {
  try {
    const isZipCode = /^\d{5}$/.test(location);

    const response = await apiClient.get('/markets/statistics', {
      params: isZipCode ? { zipCode: location } : { city: location },
    });

    return response.data || null;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to fetch market statistics');
  }
};

/**
 * Get property value estimate
 * @param address - Full address or ZIP code
 * @returns Value estimate data
 */
export const getValueEstimate = async (address: string) => {
  try {
    const response = await apiClient.get('/value-estimate', {
      params: { address },
    });
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to fetch value estimate');
  }
};

/**
 * Check if API key is configured
 */
export const isAPIConfigured = (): boolean => {
  return Boolean(API_KEY && API_KEY !== 'your_api_key_here');
};

export default apiClient;
