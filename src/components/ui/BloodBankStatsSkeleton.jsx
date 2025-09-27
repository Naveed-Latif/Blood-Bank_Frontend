import React from 'react';
import { Card } from './Card';
import Skeleton, { SkeletonRect } from './Skeleton';

// Skeleton for blood type inventory item
export const BloodTypeInventorySkeleton = () => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        {/* Blood type circle */}
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
          <SkeletonRect width="w-4" height="h-4" />
        </div>
        {/* Blood type label */}
        <SkeletonRect width="w-8" height="h-4" />
      </div>
      {/* Inventory level */}
      <div className="flex items-center space-x-2">
        <SkeletonRect width="w-12" height="h-4" />
        <SkeletonRect width="w-16" height="h-6" className="rounded-full" />
      </div>
    </div>
  );
};

// Skeleton for community stats
export const CommunityStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="text-center">
          <SkeletonRect width="w-full" height="h-8" className="mb-1" />
          <SkeletonRect width="w-3/4 mx-auto" height="h-4" />
        </div>
      ))}
    </div>
  );
};

// Main Blood Bank Stats skeleton component
const BloodBankStatsSkeleton = () => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Title */}
        <SkeletonRect width="w-1/3" height="h-6" />
        
        {/* Blood inventory section */}
        <div>
          <SkeletonRect width="w-1/4" height="h-5" className="mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <BloodTypeInventorySkeleton key={index} />
            ))}
          </div>
        </div>
        
        {/* Community stats section */}
        <div>
          <SkeletonRect width="w-1/3" height="h-5" className="mb-4" />
          <CommunityStatsSkeleton />
        </div>
      </div>
    </Card>
  );
};

export default BloodBankStatsSkeleton;