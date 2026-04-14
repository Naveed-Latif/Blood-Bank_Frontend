import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const NetworkStatusIndicator = ({ showWhenOnline = false, className = '' }) => {
  const { isOnline, connectionQuality, connectionType } = useNetworkStatus();

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
        return '📶';
      case 'fair':
        return '📶';
      case 'good':
        return '📶';
      default:
        return '🌐';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-xs text-gray-600">
        {getStatusIcon()} {getStatusText()}
        {connectionType !== 'unknown' && isOnline && (
          <span className="ml-1 text-gray-400">({connectionType})</span>
        )}
      </span>
    </div>
  );
};

// Offline banner component
export const OfflineBanner = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center text-sm z-50">
      <div className="flex items-center justify-center space-x-2">
        <span>📡</span>
        <span>You're offline. Some features may not work properly.</span>
      </div>
    </div>
  );
};

// Connection quality indicator
export const ConnectionQualityIndicator = ({ className = '' }) => {
  const { isOnline, connectionQuality } = useNetworkStatus();

  if (!isOnline) return null;

  const getBars = () => {
    switch (connectionQuality) {
      case 'poor':
        return 1;
      case 'fair':
        return 2;
      case 'good':
        return 3;
      default:
        return 2;
    }
  };

  const bars = getBars();

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3].map((bar) => (
        <div
          key={bar}
          className={`w-1 h-3 rounded-sm ${
            bar <= bars ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export default NetworkStatusIndicator;