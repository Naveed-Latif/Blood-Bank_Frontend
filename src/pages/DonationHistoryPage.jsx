import React from 'react';
import { Button } from '../components/ui/Button';
import DonationHistory from '../components/DonationHistory';
import useDashboardData from '../hooks/useDashboardData';
import DashboardError from '../components/ui/DashboardError';

const DonationHistoryPage = () => {
  const {
    donations,
    loading,
    error,
    errors,
    fetchDonations,
    refreshDashboardData
  } = useDashboardData();

  // Handle critical errors
  if (error && !donations) {
    return (
      <DashboardError 
        error={error}
        onRetry={refreshDashboardData}
        onGoHome={() => window.location.href = '/dashboard'}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Donation History</h1>
            <p className="mt-2 text-gray-600">
              View your complete donation record and statistics
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
            className="flex items-center space-x-2"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Donation History Component */}
        <DonationHistory
          donations={donations}
          loading={loading}
          error={errors.donations}
          onRetry={fetchDonations}
          showStats={true}
          maxRecords={20}
          className="mb-8"
        />

        {/* Additional actions */}
        {donations && donations.length > 0 && (
          <div className="flex justify-center space-x-4">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Schedule Next Donation
            </Button>
            <Button variant="outline" className="text-gray-700">
              Download History
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationHistoryPage;