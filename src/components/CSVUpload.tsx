/**
 * CSV File Upload Component
 *
 * Allows users to upload a CSV file containing housing market data.
 * Shows upload status, file info, and provides download template option.
 */

import { useState, useRef } from 'react';
import { CSVProvider } from '../services/providers';
import { generateSampleCSV } from '../utils/csvParser';

interface CSVUploadProps {
  onUploadSuccess?: () => void;
}

export const CSVUpload = ({ onUploadSuccess }: CSVUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [provider] = useState(() => new CSVProvider());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress('Reading file...');

    console.log(
      '%c[CSV Upload] File selected',
      'color: #8B5CF6; font-weight: bold',
      { name: file.name, size: file.size, type: file.type }
    );

    try {
      // Simulate progress steps for better UX
      setTimeout(() => setUploadProgress('Validating format...'), 200);
      setTimeout(() => setUploadProgress('Parsing data...'), 400);

      const result = await provider.uploadCSVFile(file);

      if (result.success) {
        setSuccess(`Successfully loaded ${result.markets} markets from ${file.name}`);
        console.log(
          '%c[CSV Upload] ✓ Upload successful',
          'color: #10B981; font-weight: bold',
          { markets: result.markets }
        );

        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setError(result.error || 'Failed to upload CSV file');
        console.error(
          '%c[CSV Upload] Upload failed',
          'color: #EF4444; font-weight: bold',
          result.error
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('%c[CSV Upload] Upload error', 'color: #EF4444; font-weight: bold', err);
    } finally {
      setUploading(false);
      setUploadProgress('');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'housing-data-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('%c[CSV Upload] Template downloaded', 'color: #8B5CF6');
  };

  const currentFile = provider.getFilename();
  const isConfigured = provider.isConfigured();

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">CSV File Upload</h3>
        <button
          onClick={handleDownloadTemplate}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          title="Download a sample CSV file template"
        >
          📥 Template
        </button>
      </div>

      {/* Current file info */}
      {isConfigured && currentFile && (
        <div className="bg-green-50 border border-green-200 rounded px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-xs text-green-800 font-medium truncate">{currentFile}</span>
            </div>
            <button
              onClick={async () => {
                await provider.clearData();
                setSuccess(null);
                setError(null);
              }}
              className="text-xs text-red-600 hover:text-red-800"
              title="Remove CSV file"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-green-700 mt-1">
            {provider.getAllMarkets().length} markets loaded
          </p>
        </div>
      )}

      {/* File input */}
      <div>
        <label
          htmlFor="csv-file-input"
          className={`
            block w-full px-4 py-3 border-2 border-dashed rounded-lg text-center cursor-pointer
            transition-colors
            ${uploading ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}
          `}
        >
          <input
            ref={fileInputRef}
            id="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-1">
            {uploading ? (
              <>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute w-12 h-12 border-4 border-indigo-200 rounded-full"></div>
                  <div className="absolute w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                  <span className="text-sm">📄</span>
                </div>
                <span className="text-sm font-medium text-indigo-700">
                  {uploadProgress}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl">📄</span>
                <span className="text-sm font-medium text-gray-700">
                  Choose CSV File
                </span>
                <span className="text-xs text-gray-500">
                  or drag and drop
                </span>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded px-3 py-2">
          <p className="text-xs text-green-800">{success}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-3 py-2 animate-slideIn">
          <div className="flex items-start gap-2">
            <span className="text-red-500 flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-red-900 mb-1">Upload Failed</p>
              <p className="text-xs text-red-800">{error}</p>
              <p className="text-xs text-red-700 mt-1">
                Please check your CSV format and try again. Need help? Download the template.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CSV format info */}
      <details className="text-xs text-gray-600">
        <summary className="cursor-pointer font-medium hover:text-gray-900">
          Supported CSV Formats
        </summary>
        <div className="mt-2 space-y-2 pl-2">
          <div>
            <p className="font-medium text-indigo-700">Simple Format:</p>
            <p className="text-xs text-gray-600 mb-1">Required: city, state</p>
            <p className="text-xs text-gray-600">Optional: zipCode, medianPrice, averagePrice, percentChange</p>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="font-medium text-indigo-700">Zillow ZHVI Format:</p>
            <p className="text-xs text-gray-600">
              Automatically detected! Supports Zillow's time-series ZHVI data.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Extracts most recent values and calculates statistics from time series.
            </p>
          </div>
        </div>
      </details>
    </div>
  );
};
