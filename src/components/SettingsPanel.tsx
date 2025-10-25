import { useState, useEffect } from 'react';
import { getProviderType } from '../services/providers';
import { IndexedDBCache as APICache } from '../utils/indexedDBCache';
import { CSVUpload } from './CSVUpload';

interface SettingsPanelProps {
  onProviderChange?: () => void;
}

const PROVIDER_INFO = [
  {
    id: 'mock',
    name: 'Mock Data',
    icon: '🎭',
    limits: 'Unlimited',
    description: 'Sample data for development and testing',
    requiresKey: false,
    status: 'available' as const,
  },
  {
    id: 'csv',
    name: 'CSV File',
    icon: '📊',
    limits: 'Unlimited',
    description: 'Upload your own market data from a CSV file',
    requiresKey: false,
    status: 'available' as const,
  },
  {
    id: 'zillow-metrics',
    name: 'Zillow Market Metrics',
    icon: '🏘️',
    limits: 'TBD (testing needed)',
    description: 'Market-level statistics from national to neighborhood',
    requiresKey: true,
    status: 'pending' as const,
  },
  {
    id: 'rentcast',
    name: 'RentCast',
    icon: '🏠',
    limits: '50 calls/month',
    description: 'Property and market data with valuations',
    requiresKey: true,
    status: 'pending' as const,
  },
];

export const SettingsPanel = ({ onProviderChange }: SettingsPanelProps) => {
  const [selectedProvider, setSelectedProvider] = useState(getProviderType());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Update selected provider if it changes externally
    const currentProvider = getProviderType();
    if (currentProvider !== selectedProvider) {
      setSelectedProvider(currentProvider);
    }
  }, []);

  const handleProviderChange = async (providerId: string) => {
    const provider = PROVIDER_INFO.find(p => p.id === providerId);

    // Warn if provider is not yet available
    if (provider?.status === 'pending') {
      const proceed = window.confirm(
        `${provider.name} is not yet fully implemented. ` +
        `The app will fall back to Mock Data. Continue anyway?`
      );
      if (!proceed) return;
    }

    // Confirm provider change
    const confirmed = window.confirm(
      `Switch to ${provider?.name}?\n\n` +
      `This will:\n` +
      `• Clear all cached data\n` +
      `• Reload the application\n` +
      `• Use ${provider?.name} for all future requests`
    );

    if (!confirmed) return;

    // Save selection to localStorage
    localStorage.setItem('housing-data-provider', providerId);
    setSelectedProvider(providerId);

    // Clear cache
    await APICache.clear();

    // Trigger callback
    if (onProviderChange) {
      onProviderChange();
    } else {
      // Default: reload the page
      window.location.reload();
    }
  };

  const getStatusBadge = (status: 'available' | 'pending') => {
    if (status === 'available') {
      return <span className="text-xs text-green-600">✓ Available</span>;
    }
    return <span className="text-xs text-yellow-600">⚠ In Development</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Data Source</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-primary hover:underline"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      <div className="space-y-3">
        {PROVIDER_INFO.map((provider) => (
          <label
            key={provider.id}
            className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${
              selectedProvider === provider.id
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="data-provider"
              value={provider.id}
              checked={selectedProvider === provider.id}
              onChange={() => handleProviderChange(provider.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>{provider.icon}</span>
                <span className="font-medium text-gray-900">{provider.name}</span>
                {getStatusBadge(provider.status)}
              </div>

              {showDetails && (
                <div className="mt-1 space-y-1">
                  <div className="text-xs text-gray-600">{provider.description}</div>
                  <div className="text-xs text-gray-500">
                    Rate Limit: {provider.limits}
                  </div>
                  {provider.requiresKey && (
                    <div className="text-xs text-gray-500">
                      Requires API key in .env
                    </div>
                  )}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* CSV Upload Section */}
      {selectedProvider === 'csv' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <CSVUpload onUploadSuccess={() => {
            console.log('%c[Settings Panel] CSV uploaded, refreshing...', 'color: #8B5CF6');
            // Optionally trigger a data refresh
            if (onProviderChange) {
              onProviderChange();
            }
          }} />
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 <strong>Tip:</strong> Switch providers to compare data sources or work around rate limits.
          {selectedProvider === 'csv' ? ' Upload a CSV file to use your own data.' : ' Mock data is perfect for development without using API credits.'}
        </p>
      </div>
    </div>
  );
};
