import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { SectionError } from './DashboardError';

// Error component for stats cards
export const StatsCardError = ({ error, onRetry, statName }) => {
  return (
    <Card className="p-6 border-red-200 bg-red-50">
      <div className="text-center">
        <div className="text-2xl mb-2">📊</div>
        <h3 className="text-sm font-semibold text-red-800 mb-1">
          {statName || 'Stat'} Unavailable
        </h3>
        <p className="text-xs text-red-600 mb-3">
          Failed to load data
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50 text-xs px-2 py-1"
          >
            Retry
          </Button>
        )}
      </div>
    </Card>
  );
};

// Error component for donation history
export const DonationHistoryError = ({ error, onRetry }) => {
  return (
    <SectionError
      error={error}
      onRetry={onRetry}
      sectionName="donation history"
    />
  );
};

// Error component for blood bank stats
export const BloodBankStatsError = ({ error, onRetry }) => {
  return (
    <SectionError
      error={error}
      onRetry={onRetry}
      sectionName="blood bank statistics"
    />
  );
};

// Error component for upcoming drives
export const UpcomingDrivesError = ({ error, onRetry }) => {
  return (
    <SectionError
      error={error}
      onRetry={onRetry}
      sectionName="upcoming blood drives"
    />
  );
};

// Error component for user data
export const UserDataError = ({ error, onRetry }) => {
  return (
    <Card className="p-6 border-red-200 bg-red-50">
      <div className="flex items-center space-x-4">
        <div className="text-3xl">👤</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-1">
            Unable to load your profile
          </h3>
          <p className="text-red-600 text-sm mb-3">
            We couldn't retrieve your dashboard information. This may affect the display of your stats.
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Retry Loading Profile
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// Inline error component for small sections
export const InlineError = ({ 
  error, 
  onRetry, 
  message = 'Failed to load',
  showIcon = true 
}) => {
  return (
    <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded text-sm">
      <div className="flex items-center space-x-2 text-red-700">
        {showIcon && <span>⚠️</span>}
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-600 hover:text-red-800 underline text-xs"
        >
          Retry
        </button>
      )}
    </div>
  );
};

// Network status error component
export const NetworkError = ({ onRetry, isOnline = true }) => {
  if (isOnline) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center text-sm z-50">
      <div className="flex items-center justify-center space-x-2">
        <span>🌐</span>
        <span>You're offline. Some features may not work properly.</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="underline hover:no-underline ml-2"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

// Partial data error component (when some data loads but others fail)
export const PartialDataError = ({ 
  failedSections = [], 
  onRetrySection,
  onRetryAll 
}) => {
  if (failedSections.length === 0) return null;
  
  return (
    <Card className="p-4 border-yellow-200 bg-yellow-50 mb-6">
      <div className="flex items-start space-x-3">
        <div className="text-yellow-600 text-xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 mb-1">
            Some data couldn't be loaded
          </h3>
          <p className="text-yellow-700 text-sm mb-3">
            The following sections failed to load: {failedSections.join(', ')}
          </p>
          <div className="flex flex-wrap gap-2">
            {onRetryAll && (
              <Button
                onClick={onRetryAll}
                size="sm"
                variant="outline"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                Retry All
              </Button>
            )}
            {onRetrySection && failedSections.map(section => (
              <Button
                key={section}
                onClick={() => onRetrySection(section)}
                size="sm"
                variant="outline"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100 text-xs"
              >
                Retry {section}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default {
  StatsCardError,
  DonationHistoryError,
  BloodBankStatsError,
  UpcomingDrivesError,
  UserDataError,
  InlineError,
  NetworkError,
  PartialDataError
};