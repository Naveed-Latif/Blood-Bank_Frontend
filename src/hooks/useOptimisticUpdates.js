import { useState, useCallback } from 'react';
import { useDashboardRefresh } from '../contexts/DashboardRefreshContext';

/**
 * Hook for implementing optimistic updates with dashboard refresh
 * Provides immediate UI feedback while triggering background refresh
 */
export const useOptimisticUpdates = () => {
  const [optimisticState, setOptimisticState] = useState({});
  const { triggerRefresh } = useDashboardRefresh();

  // Apply optimistic update and trigger refresh
  const applyOptimisticUpdate = useCallback((key, value, refreshReason = 'optimistic_update') => {
    // Apply optimistic update immediately
    setOptimisticState(prev => ({
      ...prev,
      [key]: value
    }));

    // Trigger dashboard refresh to get real data
    triggerRefresh(refreshReason);

    // Clear optimistic state after a delay (real data should arrive by then)
    setTimeout(() => {
      setOptimisticState(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }, 2000);
  }, [triggerRefresh]);

  // Clear all optimistic updates
  const clearOptimisticUpdates = useCallback(() => {
    setOptimisticState({});
  }, []);

  // Get optimistic value for a key
  const getOptimisticValue = useCallback((key) => {
    return optimisticState[key];
  }, [optimisticState]);

  // Check if a key has an optimistic update
  const hasOptimisticUpdate = useCallback((key) => {
    return key in optimisticState;
  }, [optimisticState]);

  return {
    applyOptimisticUpdate,
    clearOptimisticUpdates,
    getOptimisticValue,
    hasOptimisticUpdate,
    optimisticState
  };
};