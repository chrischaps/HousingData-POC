import { isAPIConfigured } from '../services/api';

interface ApiStatusIndicatorProps {
  hasError: boolean;
  dataSource: 'api' | 'mock' | 'partial';
}

export const ApiStatusIndicator = ({ hasError, dataSource }: ApiStatusIndicatorProps) => {
  const apiConfigured = isAPIConfigured();

  // Determine status based on configuration and data source
  let status: 'live' | 'mock' | 'error' | 'partial';
  let icon: string;
  let label: string;
  let colorClasses: string;

  if (hasError) {
    status = 'error';
    icon = '🔴';
    label = 'API Error';
    colorClasses = 'bg-red-100 text-red-800 border-red-300';
  } else if (!apiConfigured) {
    status = 'mock';
    icon = '🟡';
    label = 'Mock Data';
    colorClasses = 'bg-yellow-100 text-yellow-800 border-yellow-300';
  } else if (dataSource === 'partial') {
    status = 'partial';
    icon = '🟠';
    label = 'Partial API';
    colorClasses = 'bg-orange-100 text-orange-800 border-orange-300';
  } else if (dataSource === 'api') {
    status = 'live';
    icon = '🟢';
    label = 'Live API';
    colorClasses = 'bg-green-100 text-green-800 border-green-300';
  } else {
    status = 'mock';
    icon = '🟡';
    label = 'Mock Data';
    colorClasses = 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${colorClasses}`}
      title={getTooltipText(status, apiConfigured)}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
};

function getTooltipText(status: 'live' | 'mock' | 'error' | 'partial', apiConfigured: boolean): string {
  switch (status) {
    case 'live':
      return 'Connected to RentCast API - Showing real market data';
    case 'mock':
      return apiConfigured
        ? 'API configured but using mock data as fallback'
        : 'API key not configured - Using mock data (check .env file)';
    case 'error':
      return 'API request failed - Showing cached/mock data';
    case 'partial':
      return 'Some API calls succeeded - Using mix of real and mock data';
    default:
      return 'Data source unknown';
  }
}
