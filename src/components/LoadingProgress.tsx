import { useEffect, useState } from 'react';
import { createProvider, getProviderType, CSVProvider } from '../services/providers';

export const LoadingProgress = () => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const providerType = getProviderType();

    // Only show progress for CSV provider
    if (providerType !== 'csv') {
      setIsLoading(false);
      return;
    }

    const provider = createProvider();
    if (!(provider instanceof CSVProvider)) {
      setIsLoading(false);
      return;
    }

    // Poll for progress updates
    const interval = setInterval(() => {
      const currentProgress = provider.getLoadingProgress();
      const currentMessage = provider.getLoadingMessage();

      setProgress(currentProgress);
      setMessage(currentMessage);

      // Stop polling when complete
      if (currentProgress >= 100 || currentProgress === 0 && currentMessage === '') {
        setIsLoading(false);
        clearInterval(interval);
      }
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, []);

  if (!isLoading || progress >= 100) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-blue-600 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Housing Data
          </h3>
          <p className="text-sm text-gray-600">
            {message || 'Preparing data...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
            ></div>
          </div>
          <div className="mt-2 text-center">
            <span className="text-sm font-medium text-gray-700">
              {progress}%
            </span>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>First-time data download</p>
          <p className="mt-1">Future visits will load instantly from cache</p>
        </div>
      </div>
    </div>
  );
};
