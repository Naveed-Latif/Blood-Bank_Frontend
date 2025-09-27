import React from 'react';
import { Card } from './Card';
import { SubtleRefreshIndicator, AnimatedSkeleton, ShimmerLoader } from './LoadingTransitions';

/**
 * Loading indicator for stats cards
 */
export const StatsCardLoader = ({ title, isRefreshing = false }) => {
  return (
    <Card className="p-6 relative">
      {isRefreshing && (
        <div className="absolute top-2 right-2">
          <SubtleRefreshIndicator isRefreshing={true} />
        </div>
      )}
      
      <div className="animate-pulse">
        <div className="h-5 bg-gray-300 rounded w-2/3 mb-3"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/3"></div>
      </div>
    </Card>
  );
};

/**
 * Loading indicator for donation history
 */
export const DonationHistoryLoader = ({ isRefreshing = false }) => {
  return (
    <Card className="p-6 relative">
      {isRefreshing && (
        <div className="absolute top-4 right-4">
          <SubtleRefreshIndicator isRefreshing={true} />
        </div>
      )}
      
      <div className="mb-4">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-2 animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * Loading indicator for blood bank stats
 */
export const BloodBankStatsLoader = ({ isRefreshing = false }) => {
  return (
    <Card className="p-6 relative">
      {isRefreshing && (
        <div className="absolute top-4 right-4">
          <SubtleRefreshIndicator isRefreshing={true} />
        </div>
      )}
      
      <div className="mb-6">
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-300 rounded w-1/4 animate-pulse"></div>
      </div>
      
      {/* Blood type grid skeleton */}
      <div className="mb-6">
        <div className="h-5 bg-gray-300 rounded w-1/3 mb-3 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-12"></div>
                </div>
              </div>
              <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Community stats skeleton */}
      <div>
        <div className="h-5 bg-gray-300 rounded w-1/3 mb-3 animate-pulse"></div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg border animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-12 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-16 mx-auto mb-1"></div>
              <div className="h-2 bg-gray-300 rounded w-12 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

/**
 * Loading indicator for quick actions
 */
export const QuickActionsLoader = ({ isRefreshing = false }) => {
  return (
    <Card className="p-6 relative">
      {isRefreshing && (
        <div className="absolute top-4 right-4">
          <SubtleRefreshIndicator isRefreshing={true} />
        </div>
      )}
      
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-4 animate-pulse"></div>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-10 bg-gray-300 rounded animate-pulse"></div>
        ))}
      </div>
    </Card>
  );
};

/**
 * Inline section refresh indicator
 */
export const InlineSectionRefresh = ({ 
  isRefreshing, 
  sectionName, 
  className = '' 
}) => {
  if (!isRefreshing) return null;

  return (
    <div className={`flex items-center space-x-2 text-sm text-blue-600 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>Refreshing {sectionName}...</span>
    </div>
  );
};

/**
 * Progress indicator for multi-step loading
 */
export const MultiStepLoadingIndicator = ({ 
  steps, 
  currentStep, 
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Loading dashboard data...</span>
        <span>{currentStep}/{steps.length}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>
      
      <div className="space-y-1">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              index < currentStep 
                ? 'bg-green-500' 
                : index === currentStep 
                ? 'bg-blue-500 animate-pulse' 
                : 'bg-gray-300'
            }`} />
            <span className={
              index < currentStep 
                ? 'text-green-600' 
                : index === currentStep 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  StatsCardLoader,
  DonationHistoryLoader,
  BloodBankStatsLoader,
  QuickActionsLoader,
  InlineSectionRefresh,
  MultiStepLoadingIndicator
};