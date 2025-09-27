import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for detecting network connectivity status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');
  const [lastOnlineTime, setLastOnlineTime] = useState(Date.now());

  // Update connection type if available
  const updateConnectionType = useCallback(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
      }
    }
  }, []);

  // Handle online event
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setLastOnlineTime(Date.now());
    updateConnectionType();
    console.log('🌐 Network connection restored');
  }, [updateConnectionType]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    setIsOnline(false);
    console.log('🌐 Network connection lost');
  }, []);

  // Handle connection change
  const handleConnectionChange = useCallback(() => {
    updateConnectionType();
  }, [updateConnectionType]);

  useEffect(() => {
    // Initial connection type check
    updateConnectionType();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes if supported
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        connection.addEventListener('change', handleConnectionChange);
      }
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          connection.removeEventListener('change', handleConnectionChange);
        }
      }
    };
  }, [handleOnline, handleOffline, handleConnectionChange, updateConnectionType]);

  // Test network connectivity by making a small request
  const testConnectivity = useCallback(async () => {
    try {
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Get connection quality assessment
  const getConnectionQuality = useCallback(() => {
    if (!isOnline) return 'offline';
    
    switch (connectionType) {
      case 'slow-2g':
      case '2g':
        return 'poor';
      case '3g':
        return 'fair';
      case '4g':
      case '5g':
        return 'good';
      default:
        return 'unknown';
    }
  }, [isOnline, connectionType]);

  return {
    isOnline,
    connectionType,
    connectionQuality: getConnectionQuality(),
    lastOnlineTime,
    testConnectivity
  };
};