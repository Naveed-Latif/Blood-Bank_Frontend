import React, { useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import useDashboardData from '../hooks/useDashboardData';
import DashboardSkeleton, { StatsCardSkeleton, RecentActivitySkeleton } from '../components/ui/DashboardSkeleton';
import DashboardError from '../components/ui/DashboardError';
import { StatsCardError, UserDataError, InlineError, PartialDataError } from '../components/ui/ErrorComponents';
import DonationHistory from '../components/DonationHistory';
import BloodBankStats from '../components/BloodBankStats';
import NetworkStatusIndicator, { OfflineBanner } from '../components/ui/NetworkStatusIndicator';
import ErrorRecovery from '../components/ui/ErrorRecovery';
import { LoadingTransition, SubtleRefreshIndicator } from '../components/ui/LoadingTransitions';
import { 
  StatsCardLoader, 
  DonationHistoryLoader, 
  BloodBankStatsLoader, 
  QuickActionsLoader,
  MultiStepLoadingIndicator 
} from '../components/ui/SectionLoadingIndicators';
import { 
  OptimizedStatCard, 
  OptimizedQuickActions, 
  OptimizedNetworkStatus, 
  OptimizedRefreshButton 
} from '../components/optimized/OptimizedComponents';
import { liveAnnouncer, ScreenReaderOnly, SkipLink, generateId } from '../utils/accessibility';
import { getBloodTypeDisplay } from '../utils/dataTransform';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
};

// Helper function to calculate next eligible date
const calculateNextEligible = (lastDonationDate) => {
  if (!lastDonationDate) return 'Eligible now';
  
  const lastDonation = new Date(lastDonationDate);
  const nextEligible = new Date(lastDonation);
  nextEligible.setDate(nextEligible.getDate() + 56); // 8 weeks between donations
  
  const now = new Date();
  if (now >= nextEligible) return 'Eligible now';
  
  const diffTime = nextEligible - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) return `${diffDays} days`;
  return `${Math.ceil(diffDays / 7)} weeks`;
};

// Individual stat card component
const StatCard = ({ title, value, color, error, onRetry, isLoading }) => {
  if (isLoading) {
    return <StatsCardSkeleton />;
  }
  
  if (error) {
    return (
      <StatsCardError 
        error={error}
        onRetry={onRetry}
        statName={title}
      />
    );
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
    </Card>
  );
};



export default function Dashboard() {
  const {
    userData,
    donations,
    bloodBankStats,
    upcomingDrives,
    loading,
    refreshing,
    error,
    errors,
    hasAnyError,
    errorDetails,
    retryAttempts,
    partialDataLoaded,
    isOnline,
    connectionQuality,
    sectionLoading,
    loadingProgress,
    loadingSteps,
    currentLoadingStep,
    refreshDashboardData,
    fetchUserData,
    fetchDonations,
    fetchBloodBankStats
  } = useDashboardData();

  // Generate unique IDs for accessibility
  const dashboardId = generateId('dashboard');
  const statsId = generateId('stats');
  const contentId = generateId('content');

  // Announce loading states to screen readers
  useEffect(() => {
    try {
      if (loading) {
        liveAnnouncer.announceLoading('Loading dashboard data');
      } else if (error) {
        liveAnnouncer.announceError('Failed to load dashboard');
      } else if (!loading && !error) {
        liveAnnouncer.announceSuccess('Dashboard loaded successfully');
      }
    } catch (e) {
      console.warn('Live announcer error:', e);
    }
  }, [loading, error]);

  // Handle critical errors that prevent dashboard from loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
            <MultiStepLoadingIndicator
              steps={loadingSteps}
              currentStep={currentLoadingStep}
              className="max-w-md"
            />
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <DashboardError 
        error={error}
        onRetry={refreshDashboardData}
        onGoHome={() => window.location.href = '/'}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  // Get failed sections for partial error display
  const failedSections = Object.entries(errors)
    .filter(([_, error]) => error !== null)
    .map(([section, _]) => section.replace(/([A-Z])/g, ' $1').toLowerCase());

  // Extract user data with fallbacks
  const userDisplayName = userData?.name || userData?.username || 'User';
  const totalDonations = userData?.totalDonations || donations?.length || 0;
  const lastDonationDate = userData?.lastDonation?.date || donations?.[0]?.date;
  const bloodType = getBloodTypeDisplay(userData?.blood_group || userData?.bloodType);
  const nextEligible = calculateNextEligible(lastDonationDate);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SkipLink href={`#${contentId}`}>Skip to main content</SkipLink>
      <OfflineBanner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id={dashboardId}>
        {/* Header with refresh button */}
        <header className="mb-8 flex justify-between items-start" role="banner">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" id="dashboard-title">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-600" aria-describedby="dashboard-title">
              Welcome back, {userDisplayName}
            </p>
            <ScreenReaderOnly>
              Dashboard for {userDisplayName}. Your donation statistics and quick actions are available below.
            </ScreenReaderOnly>
            {refreshing && (
              <div className="mt-1" role="status" aria-live="polite">
                <SubtleRefreshIndicator isRefreshing={true} />
                <ScreenReaderOnly>Refreshing dashboard data</ScreenReaderOnly>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <OptimizedNetworkStatus 
              isOnline={isOnline}
              connectionQuality={connectionQuality}
              showWhenOnline={true}
            />
            <OptimizedRefreshButton
              refreshing={refreshing}
              onRefresh={refreshDashboardData}
              autoRefreshInterval="5min"
            />
          </div>
        </header>

        {/* Show user data error if critical */}
        {errors.userData && (
          <div className="mb-6">
            <ErrorRecovery
              error={errorDetails.userData?.originalError || new Error(errors.userData)}
              onRetry={fetchUserData}
              context="User Data"
              retryAttempts={retryAttempts.userData}
              showDetails={process.env.NODE_ENV === 'development'}
            />
          </div>
        )}

        {/* Show partial data error if some sections failed */}
        {partialDataLoaded && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-600 text-xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  Some data couldn't be loaded
                </h3>
                <p className="text-yellow-700 text-sm mb-3">
                  We're showing what we could load. Failed sections: {failedSections.join(', ')}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={refreshDashboardData}
                    size="sm"
                    variant="outline"
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    Retry All
                  </Button>
                  <NetworkStatusIndicator />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats cards */}
        <section 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" 
          id={statsId}
          role="region"
          aria-labelledby="stats-heading"
        >
          <ScreenReaderOnly>
            <h2 id="stats-heading">Your Donation Statistics</h2>
          </ScreenReaderOnly>
          
          <OptimizedStatCard
            title="Total Donations"
            value={totalDonations}
            color="text-red-600"
            error={errors.userData || errors.donations}
            onRetry={() => {
              if (errors.userData) fetchUserData();
              if (errors.donations) fetchDonations();
            }}
            isLoading={loading && !userData && !donations}
          />
          
          <OptimizedStatCard
            title="Last Donation"
            value={formatDate(lastDonationDate)}
            color="text-blue-600"
            error={errors.userData || errors.donations}
            onRetry={() => {
              if (errors.userData) fetchUserData();
              if (errors.donations) fetchDonations();
            }}
            isLoading={loading && !userData && !donations}
          />
          
          <OptimizedStatCard
            title="Next Eligible"
            value={nextEligible}
            color="text-green-600"
            error={errors.userData || errors.donations}
            onRetry={() => {
              if (errors.userData) fetchUserData();
              if (errors.donations) fetchDonations();
            }}
            isLoading={loading && !userData && !donations}
          />
          
          <OptimizedStatCard
            title="Blood Type"
            value={bloodType}
            color="text-red-600"
            error={errors.userData}
            onRetry={fetchUserData}
            isLoading={loading && !userData}
          />
        </section>
        
        {/* Content sections */}
        <main 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" 
          id={contentId}
          role="main"
        >
          <section role="region" aria-labelledby="donation-history-heading">
            <ScreenReaderOnly>
              <h2 id="donation-history-heading">Recent Donation History</h2>
            </ScreenReaderOnly>
            <DonationHistory
              donations={donations}
              loading={loading && !donations}
              error={errors.donations}
              onRetry={fetchDonations}
              showStats={false}
              maxRecords={5}
            />
          </section>
          
          <section role="region" aria-labelledby="quick-actions-heading">
            <ScreenReaderOnly>
              <h2 id="quick-actions-heading">Quick Actions</h2>
            </ScreenReaderOnly>
            <OptimizedQuickActions
              refreshing={refreshing}
              onScheduleDonation={() => {
                liveAnnouncer.announce('Schedule donation feature coming soon');
              }}
              onUpdateProfile={() => {
                liveAnnouncer.announce('Update profile feature coming soon');
              }}
            />
          </section>
        </main>

        {/* Blood Bank Statistics */}
        <section 
          className="mb-6" 
          role="region" 
          aria-labelledby="blood-bank-stats-heading"
        >
          <ScreenReaderOnly>
            <h2 id="blood-bank-stats-heading">Blood Bank Statistics and Community Impact</h2>
          </ScreenReaderOnly>
          <BloodBankStats
            bloodBankStats={bloodBankStats}
            loading={loading && !bloodBankStats}
            error={errors.bloodBankStats}
            onRetry={fetchBloodBankStats}
          />
        </section>
      </div>
    </div>
  );
}