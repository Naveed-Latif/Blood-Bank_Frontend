import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

// Error type mapping for user-friendly messages
const ERROR_MESSAGES = {
  network: {
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    icon: '🌐'
  },
  auth: {
    title: 'Authentication Error',
    message: 'Your session has expired. Please log in again to continue.',
    icon: '🔒'
  },
  data: {
    title: 'Data Loading Error',
    message: 'There was a problem loading your dashboard data. Please try refreshing the page.',
    icon: '📊'
  },
  server: {
    title: 'Server Error',
    message: 'Our servers are experiencing issues. Please try again in a few moments.',
    icon: '⚠️'
  },
  timeout: {
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please try again.',
    icon: '⏱️'
  },
  default: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    icon: '❌'
  }
};

// Helper function to determine error type from error message
const getErrorType = (error) => {
  if (!error) return 'default';
  
  const errorMessage = error.message || error.toString().toLowerCase();
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connect')) {
    return 'network';
  }
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('auth')) {
    return 'auth';
  }
  if (errorMessage.includes('timeout')) {
    return 'timeout';
  }
  if (errorMessage.includes('500') || errorMessage.includes('server')) {
    return 'server';
  }
  if (errorMessage.includes('data') || errorMessage.includes('load')) {
    return 'data';
  }
  
  return 'default';
};

// Individual error component for specific sections
export const SectionError = ({ 
  error, 
  onRetry, 
  sectionName = 'section',
  compact = false 
}) => {
  const errorType = getErrorType(error);
  const errorInfo = ERROR_MESSAGES[errorType];
  
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center space-x-2">
          <span className="text-red-500 text-sm">{errorInfo.icon}</span>
          <span className="text-sm text-red-700">Failed to load {sectionName}</span>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <Card className="p-6 border-red-200 bg-red-50">
      <div className="text-center">
        <div className="text-3xl mb-3">{errorInfo.icon}</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Failed to load {sectionName}
        </h3>
        <p className="text-red-600 mb-4">
          {errorInfo.message}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
};

// Main dashboard error component
const DashboardError = ({ 
  error, 
  onRetry, 
  onGoHome,
  showDetails = false 
}) => {
  const errorType = getErrorType(error);
  const errorInfo = ERROR_MESSAGES[errorType];
  
  const handleAuthError = () => {
    // Clear local storage and redirect to login
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-6">{errorInfo.icon}</div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {errorInfo.title}
          </h1>
          
          <p className="text-gray-600 mb-6 text-lg">
            {errorInfo.message}
          </p>
          
          {showDetails && error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show technical details
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-sm font-mono text-gray-700">
                {error.message || error.toString()}
              </div>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {errorType === 'auth' ? (
              <Button
                onClick={handleAuthError}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Go to Login
              </Button>
            ) : (
              <>
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Try Again
                  </Button>
                )}
                {onGoHome && (
                  <Button
                    onClick={onGoHome}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Go to Home
                  </Button>
                )}
              </>
            )}
          </div>
          
          {errorType === 'network' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                Troubleshooting Tips:
              </h4>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                <li>• Check your internet connection</li>
                <li>• Make sure the server is running</li>
                <li>• Try refreshing the page</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardError;