import React, { useState, useEffect } from 'react';

/**
 * Smooth transition wrapper for loading states
 */
export const LoadingTransition = ({ 
  isLoading, 
  children, 
  loadingComponent, 
  className = '',
  transitionDuration = 300 
}) => {
  return (
    <div className={`transition-opacity duration-${transitionDuration} ${className}`}>
      {isLoading ? loadingComponent : children}
    </div>
  );
};

/**
 * Subtle refresh indicator that doesn't disrupt the UI
 */
export const SubtleRefreshIndicator = ({ isRefreshing, className = '' }) => {
  if (!isRefreshing) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="text-xs text-blue-600">Updating...</span>
    </div>
  );
};

/**
 * Progressive loading bar
 */
export const ProgressiveLoadingBar = ({ 
  progress = 0, 
  isVisible = true, 
  className = '' 
}) => {
  if (!isVisible) return null;

  return (
    <div className={`w-full bg-gray-200 rounded-full h-1 ${className}`}>
      <div
        className="bg-blue-600 h-1 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};

/**
 * Shimmer loading effect
 */
export const ShimmerLoader = ({ className = '', height = 'h-4' }) => {
  return (
    <div className={`${height} bg-gray-200 rounded animate-pulse ${className}`}>
      <div className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
    </div>
  );
};

/**
 * Skeleton loader with fade-in animation
 */
export const AnimatedSkeleton = ({ 
  lines = 3, 
  className = '',
  showAvatar = false 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-4 bg-gray-300 rounded"
            style={{
              width: `${Math.random() * 40 + 60}%`,
              animationDelay: `${index * 0.1}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Fade transition component
 */
export const FadeTransition = ({ 
  show, 
  children, 
  duration = 300,
  className = '' 
}) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={`transition-opacity duration-${duration} ${
        show ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Slide transition component
 */
export const SlideTransition = ({ 
  show, 
  children, 
  direction = 'up',
  duration = 300,
  className = '' 
}) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  const getTransformClass = () => {
    const base = `transition-all duration-${duration}`;
    if (!show) {
      switch (direction) {
        case 'up':
          return `${base} transform translate-y-2 opacity-0`;
        case 'down':
          return `${base} transform -translate-y-2 opacity-0`;
        case 'left':
          return `${base} transform translate-x-2 opacity-0`;
        case 'right':
          return `${base} transform -translate-x-2 opacity-0`;
        default:
          return `${base} opacity-0`;
      }
    }
    return `${base} transform translate-x-0 translate-y-0 opacity-100`;
  };

  return (
    <div className={`${getTransformClass()} ${className}`}>
      {children}
    </div>
  );
};