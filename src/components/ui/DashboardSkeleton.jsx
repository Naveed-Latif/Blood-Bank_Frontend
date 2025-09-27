import React from 'react';
import { Card } from './Card';
import Skeleton, { SkeletonText, SkeletonRect } from './Skeleton';

// Skeleton for individual stats cards
export const StatsCardSkeleton = () => {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        {/* Title skeleton */}
        <SkeletonRect width="w-3/4" height="h-5" />
        {/* Value skeleton */}
        <SkeletonRect width="w-1/2" height="h-8" />
      </div>
    </Card>
  );
};

// Skeleton for activity list items
export const ActivityItemSkeleton = () => {
  return (
    <div className="flex justify-between items-center py-2">
      <SkeletonRect width="w-2/3" height="h-4" />
      <SkeletonRect width="w-1/4" height="h-3" />
    </div>
  );
};

// Skeleton for content sections (Recent Activity, Quick Actions)
export const ContentSectionSkeleton = ({ title, children }) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Section title */}
        <SkeletonRect width="w-1/3" height="h-5" />
        {/* Content */}
        {children}
      </div>
    </Card>
  );
};

// Skeleton for Recent Activity section
export const RecentActivitySkeleton = () => {
  return (
    <ContentSectionSkeleton>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <ActivityItemSkeleton key={index} />
        ))}
      </div>
    </ContentSectionSkeleton>
  );
};

// Skeleton for Quick Actions section
export const QuickActionsSkeleton = () => {
  return (
    <ContentSectionSkeleton>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <SkeletonRect key={index} width="w-full" height="h-10" className="rounded-md" />
        ))}
      </div>
    </ContentSectionSkeleton>
  );
};

// Main Dashboard skeleton component
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <SkeletonRect width="w-1/4" height="h-8" className="mb-2" />
          <SkeletonRect width="w-1/2" height="h-4" />
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </div>
        
        {/* Content sections skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivitySkeleton />
          <QuickActionsSkeleton />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;