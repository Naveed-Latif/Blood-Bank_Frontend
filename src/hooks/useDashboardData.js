import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { debounceAsync } from '../utils/debounce';
import { useDashboardRefresh } from '../contexts/DashboardRefreshContext';
import { useNetworkStatus } from './useNetworkStatus';
import { 
  categorizeError, 
  shouldRetry, 
  calculateRetryDelay, 
  formatErrorMessage
} from '../utils/errorHandling';

const useDashboardData = () => {
  // Get dashboard refresh context and network status
  const { registerRefreshCallback } = useDashboardRefresh();
  const { isOnline, connectionQuality } = useNetworkStatus();
  
  // State management for all dashboard data
  const [userData, setUserData] = useState(null);
  const [donations, setDonations] = useState(null);
  const [bloodBankStats, setBloodBankStats] = useState(null);
  const [upcomingDrives, setUpcomingDrives] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Section-specific loading states
  const [sectionLoading, setSectionLoading] = useState({
    userData: false,
    donations: false,
    bloodBankStats: false,
    upcomingDrives: false
  });
  
  // Loading progress tracking
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSteps] = useState([
    'Loading user data...',
    'Fetching donation history...',
    'Getting blood bank statistics...',
    'Loading upcoming drives...'
  ]);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  
  // Error states
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({
    userData: null,
    donations: null,
    bloodBankStats: null,
    upcomingDrives: null
  });
  
  // Enhanced error tracking
  const [errorDetails, setErrorDetails] = useState({});
  const [retryAttempts, setRetryAttempts] = useState({
    userData: 0,
    donations: 0,
    bloodBankStats: 0,
    upcomingDrives: 0
  });
  const [partialDataLoaded, setPartialDataLoaded] = useState(false);

  // Retry configuration
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second base delay
  
  // Auto-refresh configuration
  const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const intervalRef = useRef(null);
  const isRefreshingRef = useRef(false);
  
  // Debounced refresh to prevent rapid successive calls
  const debouncedRefresh = useRef(
    debounceAsync(async (isRefresh, isAutoRefresh) => {
      return fetchDashboardDataInternal(isRefresh, isAutoRefresh);
    }, 300)
  );

  // Helper function for exponential backoff delay (unused but kept for future use)
  // const getRetryDelay = (attempt) => RETRY_DELAY * Math.pow(2, attempt);

  // Enhanced retry logic with comprehensive error handling
  const retryApiCall = useCallback(async (apiCall, sectionName, maxRetries = MAX_RETRIES) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Don't attempt if offline
        if (!isOnline && attempt > 0) {
          throw new Error('No internet connection');
        }
        
        const result = await apiCall();
        
        // Reset retry count on success
        setRetryAttempts(prev => ({ ...prev, [sectionName]: 0 }));
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Update retry attempts
        setRetryAttempts(prev => ({ ...prev, [sectionName]: attempt + 1 }));
        
        // Check if we should retry
        if (shouldRetry(error, attempt, maxRetries) && isOnline) {
          const delay = calculateRetryDelay(attempt);
        // Retry attempt - no logging in production
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }
    
    // Store detailed error information
    const categorized = categorizeError(lastError);
    setErrorDetails(prev => ({
      ...prev,
      [sectionName]: {
        ...categorized,
        originalError: lastError,
        attempts: retryAttempts[sectionName] + 1,
        timestamp: Date.now()
      }
    }));
    
    throw lastError;
  }, [isOnline, retryAttempts]);

  // Fetch individual data sections with enhanced error handling
  const fetchUserData = useCallback(async () => {
    setSectionLoading(prev => ({ ...prev, userData: true }));
    try {
      const data = await retryApiCall(() => api.getUserDashboardData(), 'userData');
      setUserData(data);
      setErrors(prev => ({ ...prev, userData: null }));
      return data;
    } catch (error) {
      // Failed to fetch user dashboard data - only log in development
      const userMessage = formatErrorMessage(error, 'User data');
      setErrors(prev => ({ ...prev, userData: userMessage }));
      throw error;
    } finally {
      setSectionLoading(prev => ({ ...prev, userData: false }));
    }
  }, [retryApiCall]);

  const fetchDonations = useCallback(async () => {
    setSectionLoading(prev => ({ ...prev, donations: true }));
    try {
      const data = await retryApiCall(() => api.getUserDonations(), 'donations');
      setDonations(data);
      setErrors(prev => ({ ...prev, donations: null }));
      return data;
    } catch (error) {
      // Failed to fetch donations - only log in development
      const userMessage = formatErrorMessage(error, 'Donation history');
      setErrors(prev => ({ ...prev, donations: userMessage }));
      throw error;
    } finally {
      setSectionLoading(prev => ({ ...prev, donations: false }));
    }
  }, [retryApiCall]);

  const fetchBloodBankStats = useCallback(async () => {
    setSectionLoading(prev => ({ ...prev, bloodBankStats: true }));
    try {
      const data = await retryApiCall(() => api.getBloodBankStats(), 'bloodBankStats');
      setBloodBankStats(data);
      setErrors(prev => ({ ...prev, bloodBankStats: null }));
      return data;
    } catch (error) {
      // Failed to fetch blood bank stats - only log in development
      const userMessage = formatErrorMessage(error, 'Blood bank statistics');
      setErrors(prev => ({ ...prev, bloodBankStats: userMessage }));
      throw error;
    } finally {
      setSectionLoading(prev => ({ ...prev, bloodBankStats: false }));
    }
  }, [retryApiCall]);

  const fetchUpcomingDrives = useCallback(async () => {
    setSectionLoading(prev => ({ ...prev, upcomingDrives: true }));
    try {
      const data = await retryApiCall(() => api.getUpcomingDrives(), 'upcomingDrives');
      setUpcomingDrives(data);
      setErrors(prev => ({ ...prev, upcomingDrives: null }));
      return data;
    } catch (error) {
      // Failed to fetch upcoming drives - only log in development
      const userMessage = formatErrorMessage(error, 'Upcoming drives');
      setErrors(prev => ({ ...prev, upcomingDrives: userMessage }));
      throw error;
    } finally {
      setSectionLoading(prev => ({ ...prev, upcomingDrives: false }));
    }
  }, [retryApiCall]);

  // Internal function to fetch all dashboard data
  const fetchDashboardDataInternal = useCallback(async (isRefresh = false, isAutoRefresh = false) => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) {
        // Refresh already in progress - no logging in production
      return;
    }
    
    isRefreshingRef.current = true;
    
    if (isRefresh || isAutoRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);

    const fetchFunctions = [
      { fn: fetchUserData, name: 'userData' },
      { fn: fetchDonations, name: 'donations' },
      { fn: fetchBloodBankStats, name: 'bloodBankStats' },
      { fn: fetchUpcomingDrives, name: 'upcomingDrives' }
    ];

    try {
      // Reset progress tracking
      setCurrentLoadingStep(0);
      setLoadingProgress(0);
      
      // Fetch data with progress tracking
      const results = [];
      for (let i = 0; i < fetchFunctions.length; i++) {
        setCurrentLoadingStep(i + 1);
        setLoadingProgress(((i + 1) / fetchFunctions.length) * 100);
        
        try {
          const result = await fetchFunctions[i].fn();
          results.push({ status: 'fulfilled', value: result });
        } catch (error) {
          results.push({ status: 'rejected', reason: error });
        }
      }
      
      // Analyze results for partial data loading
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      // Set partial data loaded flag
      setPartialDataLoaded(successful > 0 && failed > 0);
      
      // Check for critical errors (user data is essential)
      const hasUserDataError = errors.userData !== null;
      const hasCriticalError = hasUserDataError && !userData; // Only critical if we have no user data at all
      
      if (hasCriticalError && !isRefresh && !isAutoRefresh) {
        if (!isOnline) {
          setError('No internet connection. Please check your connection and try again.');
        } else {
          setError('Failed to load essential dashboard data. Please try again.');
        }
      } else if (failed > 0 && successful === 0 && !isRefresh && !isAutoRefresh) {
        // All requests failed
        if (!isOnline) {
          setError('No internet connection. Some features may not work properly.');
        } else {
          setError('Failed to load dashboard data. Please check your connection and try again.');
        }
      } else if (partialDataLoaded && !isRefresh && !isAutoRefresh) {
        // Partial success - show what we have
        // Partial data loaded - no logging in production
      }
      
      if (isAutoRefresh) {
        // Auto-refresh completed - no logging in production
      }
      
    } catch (error) {
      // Dashboard data fetch failed - only log in development
      if (!isRefresh && !isAutoRefresh) {
        const userMessage = formatErrorMessage(error, 'Dashboard');
        setError(userMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      isRefreshingRef.current = false;
    }
  }, [fetchUserData, fetchDonations, fetchBloodBankStats, fetchUpcomingDrives, errors.userData, userData, isOnline, partialDataLoaded]);

  // Main function to fetch all dashboard data (debounced)
  const fetchDashboardData = useCallback(async (isRefresh = false, isAutoRefresh = false) => {
    return debouncedRefresh.current(isRefresh, isAutoRefresh);
  }, []);

  // Refresh function for manual refresh
  const refreshDashboardData = useCallback(() => {
    return fetchDashboardData(true, false);
  }, [fetchDashboardData]);

  // Auto-refresh function
  const autoRefreshData = useCallback(() => {
    return fetchDashboardData(true, true);
  }, [fetchDashboardData]);

  // Start periodic refresh
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      // Auto-refreshing dashboard data - no logging in production
      autoRefreshData();
    }, AUTO_REFRESH_INTERVAL);
    
    // Auto-refresh started - no logging in production
  }, [autoRefreshData, AUTO_REFRESH_INTERVAL]);

  // Stop periodic refresh
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      // Auto-refresh stopped - no logging in production
    }
  }, []);

  // Handle window focus refresh
  const handleWindowFocus = useCallback(() => {
    // Window focused refresh - no logging in production
    autoRefreshData();
  }, [autoRefreshData]);

  // Initial data fetch on mount
  useEffect(() => {
    fetchDashboardData();
  }, []); // Empty dependency array - only run once on mount

  // Set up auto-refresh and window focus listeners
  useEffect(() => {
    // Start auto-refresh
    startAutoRefresh();
    
    // Add window focus listener
    window.addEventListener('focus', handleWindowFocus);
    
    // Register for dashboard refresh events
    const unregisterRefresh = registerRefreshCallback((_reason) => {
      // Dashboard refresh triggered - no logging in production
      autoRefreshData();
    });
    
    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
      window.removeEventListener('focus', handleWindowFocus);
      unregisterRefresh();
    };
  }, []); // Empty dependency array - only run once on mount

  // Computed values
  const hasAnyData = userData || donations || bloodBankStats || upcomingDrives;
  const hasAnyError = Object.values(errors).some(error => error !== null);
  const isInitialLoading = loading && !hasAnyData;

  return {
    // Data
    userData,
    donations,
    bloodBankStats,
    upcomingDrives,
    
    // Loading states
    loading: isInitialLoading,
    refreshing,
    sectionLoading,
    loadingProgress,
    loadingSteps,
    currentLoadingStep,
    
    // Error states
    error,
    errors,
    hasAnyError,
    errorDetails,
    retryAttempts,
    partialDataLoaded,
    
    // Network status
    isOnline,
    connectionQuality,
    
    // Actions
    fetchDashboardData,
    refreshDashboardData,
    
    // Auto-refresh controls
    startAutoRefresh,
    stopAutoRefresh,
    
    // Individual fetch functions for granular control
    fetchUserData,
    fetchDonations,
    fetchBloodBankStats,
    fetchUpcomingDrives,
    
    // Computed states
    hasAnyData
  };
};

export default useDashboardData;