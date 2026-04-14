import React, { memo } from 'react';
import { Card } from '../ui/Card';

/**
 * Optimized StatCard component with React.memo
 */
export const OptimizedStatCard = memo(({ title, value, color, error, onRetry, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-300 rounded w-2/3 mb-3"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            {title} Unavailable
          </h3>
          <p className="text-xs text-red-600 mb-3">
            Failed to load data
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-600 border-red-300 hover:bg-red-50 text-xs px-2 py-1 border rounded"
            >
              Retry
            </button>
          )}
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.color === nextProps.color &&
    prevProps.error === nextProps.error &&
    prevProps.isLoading === nextProps.isLoading
  );
});

OptimizedStatCard.displayName = 'OptimizedStatCard';

/**
 * Optimized QuickActions component
 */
export const OptimizedQuickActions = memo(({ refreshing, onScheduleDonation, onUpdateProfile }) => {
  return (
    <Card className="p-6 relative">
      {refreshing && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span>Updating...</span>
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button 
          className="w-full bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
          disabled={refreshing}
          onClick={onScheduleDonation}
        >
          Schedule Donation
        </button>
        <button 
          className="w-full bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
          disabled={refreshing}
          onClick={onUpdateProfile}
        >
          Update Profile
        </button>
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  return prevProps.refreshing === nextProps.refreshing;
});

OptimizedQuickActions.displayName = 'OptimizedQuickActions';

/**
 * Optimized NetworkStatus component
 */
export const OptimizedNetworkStatus = memo(({ isOnline, connectionQuality, connectionType, showWhenOnline = false }) => {
  // Don't show anything if online and showWhenOnline is false
  if (isOnline && !showWhenOnline) {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    
    switch (connectionQuality) {
      case 'poor':
        return 'bg-red-400';
      case 'fair':
        return 'bg-yellow-400';
      case 'good':
        return 'bg-green-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    
    switch (connectionQuality) {
      case 'poor':
        return 'Poor connection';
      case 'fair':
        return 'Fair connection';
      case 'good':
        return 'Good connection';
      default:
        return 'Online';
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) return '📡';
    
    switch (connectionQuality) {
      case 'poor':
      case 'fair':
      case 'good':
        return '📶';
      default:
        return '🌐';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-xs text-gray-600">
        {getStatusIcon()} {getStatusText()}
        {connectionType !== 'unknown' && isOnline && (
          <span className="ml-1 text-gray-400">({connectionType})</span>
        )}
      </span>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isOnline === nextProps.isOnline &&
    prevProps.connectionQuality === nextProps.connectionQuality &&
    prevProps.connectionType === nextProps.connectionType &&
    prevProps.showWhenOnline === nextProps.showWhenOnline
  );
});

OptimizedNetworkStatus.displayName = 'OptimizedNetworkStatus';

/**
 * Optimized RefreshButton component
 */
export const OptimizedRefreshButton = memo(({ refreshing, onRefresh, autoRefreshInterval = '5min' }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="text-xs text-gray-500">
        Auto-refresh: {autoRefreshInterval}
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500 px-4 py-2 text-sm space-x-2"
      >
        <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.refreshing === nextProps.refreshing &&
    prevProps.autoRefreshInterval === nextProps.autoRefreshInterval
  );
});

OptimizedRefreshButton.displayName = 'OptimizedRefreshButton';