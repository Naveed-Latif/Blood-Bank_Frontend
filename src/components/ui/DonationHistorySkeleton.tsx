import React from 'react';
import { Card } from './Card';
import Skeleton, { SkeletonRect, SkeletonCircle } from './Skeleton';

// Skeleton for individual donation record
export const DonationRecordSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
      {/* Date circle */}
      <SkeletonCircle size="w-12 h-12" />
      
      {/* Donation details */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <SkeletonRect width="w-1/3" height="h-4" />
          <SkeletonRect width="w-16" height="h-6" className="rounded-full" />
        </div>
        <SkeletonRect width="w-1/2" height="h-3" />
        <SkeletonRect width="w-1/4" height="h-3" />
      </div>
    </div>
  );
};

// Skeleton for donation stats summary
export const DonationStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="text-center">
          <SkeletonRect width="w-full" height="h-6" className="mb-1" />
          <SkeletonRect width="w-3/4 mx-auto" height="h-4" />
        </div>
      ))}
    </div>
  );
};

// Skeleton for empty state
export const EmptyDonationHistorySkeleton = () => {
  return (
    <div className="text-center py-12">
      <SkeletonCircle size="w-16 h-16 mx-auto mb-4" />
      <SkeletonRect width="w-1/2 mx-auto" height="h-5" className="mb-2" />
      <SkeletonRect width="w-3/4 mx-auto" height="h-4" />
    </div>
  );
};

// Main Donation History skeleton component
const DonationHistorySkeleton = ({ showStats = true, recordCount = 5 }) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Title */}
        <SkeletonRect width="w-1/4" height="h-6" />
        
        {/* Stats summary (optional) */}
        {showStats && <DonationStatsSkeleton />}
        
        {/* Donation records */}
        <div className="space-y-0">
          {Array.from({ length: recordCount }).map((_, index) => (
            <DonationRecordSkeleton key={index} />
          ))}
        </div>
        
        {/* Load more button skeleton */}
        <div className="pt-4">
          <SkeletonRect width="w-32 mx-auto" height="h-10" className="rounded-md" />
        </div>
      </div>
    </Card>
  );
};

export default DonationHistorySkeleton;