import React from 'react';
import { Card } from './Card';
import Skeleton, { SkeletonRect, SkeletonCircle } from './Skeleton';

// Skeleton for individual blood drive card
export const BloodDriveCardSkeleton = () => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Date and time */}
        <div className="flex items-center space-x-2">
          <SkeletonCircle size="w-8 h-8" />
          <div className="space-y-1">
            <SkeletonRect width="w-24" height="h-4" />
            <SkeletonRect width="w-16" height="h-3" />
          </div>
        </div>
        
        {/* Drive title */}
        <SkeletonRect width="w-3/4" height="h-5" />
        
        {/* Location */}
        <div className="flex items-center space-x-2">
          <SkeletonRect width="w-4" height="h-4" />
          <SkeletonRect width="w-1/2" height="h-4" />
        </div>
        
        {/* Additional details */}
        <div className="flex items-center justify-between">
          <SkeletonRect width="w-1/3" height="h-4" />
          <SkeletonRect width="w-20" height="h-8" className="rounded-md" />
        </div>
      </div>
    </Card>
  );
};

// Skeleton for drive list view
export const DriveListItemSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
      {/* Date */}
      <div className="flex-shrink-0">
        <SkeletonRect width="w-16" height="h-12" className="rounded-lg" />
      </div>
      
      {/* Drive details */}
      <div className="flex-1 space-y-2">
        <SkeletonRect width="w-2/3" height="h-5" />
        <SkeletonRect width="w-1/2" height="h-4" />
        <SkeletonRect width="w-1/3" height="h-3" />
      </div>
      
      {/* Action button */}
      <div className="flex-shrink-0">
        <SkeletonRect width="w-20" height="h-8" className="rounded-md" />
      </div>
    </div>
  );
};

// Skeleton for filter/search bar
export const DriveFilterSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <SkeletonRect width="w-1/3" height="h-10" className="rounded-md" />
      <SkeletonRect width="w-1/4" height="h-10" className="rounded-md" />
      <SkeletonRect width="w-20" height="h-10" className="rounded-md" />
    </div>
  );
};

// Main Upcoming Drives skeleton component
const UpcomingDrivesSkeleton = ({ 
  layout = 'grid', // 'grid' or 'list'
  showFilters = false,
  driveCount = 6 
}) => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Title */}
        <SkeletonRect width="w-1/3" height="h-6" />
        
        {/* Filters (optional) */}
        {showFilters && <DriveFilterSkeleton />}
        
        {/* Drives content */}
        {layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: driveCount }).map((_, index) => (
              <BloodDriveCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {Array.from({ length: driveCount }).map((_, index) => (
              <DriveListItemSkeleton key={index} />
            ))}
          </div>
        )}
        
        {/* Load more button */}
        <div className="text-center pt-4">
          <SkeletonRect width="w-32 mx-auto" height="h-10" className="rounded-md" />
        </div>
      </div>
    </Card>
  );
};

export default UpcomingDrivesSkeleton;