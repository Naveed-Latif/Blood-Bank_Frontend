import { createContext, useContext, useCallback, useRef } from 'react';

const DashboardRefreshContext = createContext({});

export const useDashboardRefresh = () => {
  const context = useContext(DashboardRefreshContext);
  if (!context) {
    throw new Error('useDashboardRefresh must be used within a DashboardRefreshProvider');
  }
  return context;
};

export const DashboardRefreshProvider = ({ children }) => {
  const refreshCallbacksRef = useRef(new Set());

  // Register a refresh callback
  const registerRefreshCallback = useCallback((callback) => {
    refreshCallbacksRef.current.add(callback);
    
    // Return unregister function
    return () => {
      refreshCallbacksRef.current.delete(callback);
    };
  }, []);

  // Trigger refresh for all registered callbacks
  const triggerRefresh = useCallback((reason = 'user_action') => {
    console.log(`Triggering dashboard refresh due to: ${reason}`);
    refreshCallbacksRef.current.forEach(callback => {
      try {
        callback(reason);
      } catch (error) {
        console.error('Error in refresh callback:', error);
      }
    });
  }, []);

  // Specific refresh triggers for different user actions
  const refreshAfterProfileUpdate = useCallback(() => {
    triggerRefresh('profile_update');
  }, [triggerRefresh]);

  const refreshAfterLogin = useCallback(() => {
    triggerRefresh('login');
  }, [triggerRefresh]);

  const refreshAfterSignup = useCallback(() => {
    triggerRefresh('signup');
  }, [triggerRefresh]);

  const refreshAfterDonation = useCallback(() => {
    triggerRefresh('donation_added');
  }, [triggerRefresh]);

  const value = {
    registerRefreshCallback,
    triggerRefresh,
    refreshAfterProfileUpdate,
    refreshAfterLogin,
    refreshAfterSignup,
    refreshAfterDonation,
  };

  return (
    <DashboardRefreshContext.Provider value={value}>
      {children}
    </DashboardRefreshContext.Provider>
  );
};