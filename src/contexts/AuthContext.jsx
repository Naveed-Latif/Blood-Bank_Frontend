import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useDashboardRefresh } from './DashboardRefreshContext';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook to safely use dashboard refresh
const useDashboardRefreshSafe = () => {
  try {
    return useDashboardRefresh();
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get dashboard refresh functions (only available when inside DashboardRefreshProvider)
  const dashboardRefresh = useDashboardRefreshSafe();

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuthStatus();
  }, []); // checkAuthStatus is stable and doesn't need to be in deps

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const userData = await api.getCurrentUser();
        setUser(userData);
      }
    } catch (_error) {
      // Auth check failed - only log in development
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      await api.login(username, password);
      
      // Get user data after successful login
      const userData = await api.getCurrentUser();
      setUser(userData);
      
      // Trigger dashboard refresh after login
      if (dashboardRefresh) {
        dashboardRefresh.refreshAfterLogin();
      }
      
      return userData;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (userData) => {
    try {
      await api.signup(userData);
      
      // After signup, login the user automatically
      await login(userData.email || userData.phone_number, userData.password);
      
      // Trigger dashboard refresh after signup
      if (dashboardRefresh) {
        dashboardRefresh.refreshAfterSignup();
      }
      
      return { success: true };
    } catch (error) {
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (_error) {
      // Logout error - only log in development
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const response = await api.updateUser(updatedData);
      setUser(response);
      
      // Trigger dashboard refresh after profile update
      if (dashboardRefresh) {
        dashboardRefresh.refreshAfterProfileUpdate();
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Update failed');
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};