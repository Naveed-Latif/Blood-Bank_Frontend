import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute = React.memo(({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Reset redirect flag when location changes
    hasRedirected.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && !user && !hasRedirected.current) {
      // Redirecting to login - no logging in production
      hasRedirected.current = true;
      
      // Store the attempted location for redirect after login
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    // Don't render anything while redirecting
    return null;
  }

  return children;
});