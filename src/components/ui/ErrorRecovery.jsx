import React, { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { getRecoverySuggestions, categorizeError } from '../../utils/errorHandling';

const ErrorRecovery = ({ 
  error, 
  onRetry, 
  context = '', 
  showDetails = false,
  retryAttempts = 0,
  maxRetries = 3 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  if (!error) return null;

  const categorized = categorizeError(error);
  const suggestions = getRecoverySuggestions(error);
  const canRetry = categorized.retryable && retryAttempts < maxRetries;

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getSeverityColor = () => {
    switch (categorized.severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-red-400 bg-red-50';
      case 'medium':
        return 'border-yellow-400 bg-yellow-50';
      case 'low':
        return 'border-blue-400 bg-blue-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  const getSeverityIcon = () => {
    switch (categorized.severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  return (
    <Card className={`p-4 border-2 ${getSeverityColor()}`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getSeverityIcon()}</div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {context ? `${context} Error` : 'Error'}
          </h3>
          
          <p className="text-gray-700 text-sm mb-3">
            {categorized.userMessage}
          </p>

          {retryAttempts > 0 && (
            <p className="text-xs text-gray-500 mb-3">
              Retry attempts: {retryAttempts}/{maxRetries}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {canRetry && (
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}
            
            <Button
              onClick={() => setShowSuggestions(!showSuggestions)}
              variant="outline"
              size="sm"
            >
              {showSuggestions ? 'Hide Help' : 'Get Help'}
            </Button>
          </div>

          {showSuggestions && (
            <div className="mt-3 p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-900 mb-2">What you can try:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showDetails && (
            <details className="mt-3">
              <summary className="text-xs text-gray-500 cursor-pointer">
                Technical Details
              </summary>
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
                <div><strong>Type:</strong> {categorized.type}</div>
                <div><strong>Severity:</strong> {categorized.severity}</div>
                <div><strong>Retryable:</strong> {categorized.retryable ? 'Yes' : 'No'}</div>
                <div><strong>Message:</strong> {error.message}</div>
                {error.stack && (
                  <div className="mt-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </Card>
  );
};

// Simplified error display for inline use
export const InlineErrorRecovery = ({ 
  error, 
  onRetry, 
  context = '',
  retryAttempts = 0 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  if (!error) return null;

  const categorized = categorizeError(error);
  const canRetry = categorized.retryable && retryAttempts < 3;

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded text-sm">
      <div className="flex items-center space-x-2 text-red-700">
        <span>⚠️</span>
        <span>{context}: {categorized.userMessage}</span>
        {retryAttempts > 0 && (
          <span className="text-xs text-red-500">({retryAttempts} attempts)</span>
        )}
      </div>
      {canRetry && (
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="text-red-600 hover:text-red-800 underline text-xs"
        >
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
      )}
    </div>
  );
};

export default ErrorRecovery;