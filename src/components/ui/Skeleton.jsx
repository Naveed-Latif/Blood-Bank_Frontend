import React from 'react';

// Base skeleton component with animation
const Skeleton = ({ className = '', width, height, ...props }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  const sizeClasses = width && height ? '' : 'h-4 w-full';
  const customStyle = width || height ? { width, height } : {};
  
  return (
    <div 
      className={`${baseClasses} ${sizeClasses} ${className}`}
      style={customStyle}
      {...props}
    />
  );
};

// Skeleton for text lines
export const SkeletonText = ({ lines = 1, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          className={index === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
};

// Skeleton for circular elements (like avatars)
export const SkeletonCircle = ({ size = 'w-10 h-10', className = '' }) => {
  return (
    <Skeleton className={`rounded-full ${size} ${className}`} />
  );
};

// Skeleton for rectangular elements
export const SkeletonRect = ({ width = 'w-full', height = 'h-4', className = '' }) => {
  return (
    <Skeleton className={`${width} ${height} ${className}`} />
  );
};

export default Skeleton;