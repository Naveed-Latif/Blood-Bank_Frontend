import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import DonationHistorySkeleton, { DonationRecordSkeleton, EmptyDonationHistorySkeleton } from './ui/DonationHistorySkeleton';
import { InlineError } from './ui/ErrorComponents';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to format time
const formatTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'successful':
      return 'bg-green-100 text-green-800';
    case 'pending':
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'deferred':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

// Helper function to get relative time
const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
};

// Individual donation record component
const DonationRecord = ({ donation }) => {
  const date = new Date(donation.date);
  const dayOfMonth = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  
  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
      {/* Date circle */}
      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex flex-col items-center justify-center">
        <span className="text-xs font-semibold text-red-600">{month}</span>
        <span className="text-sm font-bold text-red-800">{dayOfMonth}</span>
      </div>
      
      {/* Donation details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {donation.type || 'Whole Blood Donation'}
          </h4>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
            {donation.status || 'Completed'}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-1">
          {donation.location || 'Blood Bank Center'}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatTime(donation.date)}</span>
          <span>{getRelativeTime(donation.date)}</span>
        </div>
        
        {donation.volume && (
          <p className="text-xs text-gray-500 mt-1">
            Volume: {donation.volume}ml
          </p>
        )}
      </div>
    </div>
  );
};

// Donation stats summary component
const DonationStats = ({ donations }) => {
  if (!donations || donations.length === 0) return null;
  
  const totalDonations = donations.length;
  const totalVolume = donations.reduce((sum, donation) => {
    return sum + (donation.volume || 450); // Default 450ml per donation
  }, 0);
  
  const lastDonation = donations[0]; // Assuming sorted by date desc
  const daysSinceLastDonation = lastDonation ? 
    Math.ceil((new Date() - new Date(lastDonation.date)) / (1000 * 60 * 60 * 24)) : 0;
  
  return (
    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{totalDonations}</div>
        <div className="text-sm text-gray-600">Total Donations</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{(totalVolume / 1000).toFixed(1)}L</div>
        <div className="text-sm text-gray-600">Total Volume</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{daysSinceLastDonation}</div>
        <div className="text-sm text-gray-600">Days Since Last</div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyDonationHistory = () => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🩸</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No donation history yet
      </h3>
      <p className="text-gray-600 mb-6">
        Your donation records will appear here once you make your first donation.
      </p>
      <Button className="bg-red-600 hover:bg-red-700 text-white">
        Schedule Your First Donation
      </Button>
    </div>
  );
};

// Main DonationHistory component
const DonationHistory = ({ 
  donations, 
  loading, 
  error, 
  onRetry,
  showStats = true,
  maxRecords = 10,
  className = ''
}) => {
  const [showAll, setShowAll] = useState(false);
  
  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <DonationHistorySkeleton 
          showStats={showStats}
          recordCount={maxRecords}
        />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation History</h3>
        <InlineError 
          error={error}
          onRetry={onRetry}
          message="Failed to load donation history"
        />
      </Card>
    );
  }
  
  // Empty state
  if (!donations || donations.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation History</h3>
        <EmptyDonationHistory />
      </Card>
    );
  }
  
  // Sort donations by date (most recent first)
  const sortedDonations = [...donations].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  const displayedDonations = showAll ? sortedDonations : sortedDonations.slice(0, maxRecords);
  const hasMore = sortedDonations.length > maxRecords;
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="text-gray-600"
          >
            🔄 Refresh
          </Button>
        )}
      </div>
      
      {/* Stats summary */}
      {showStats && <DonationStats donations={sortedDonations} />}
      
      {/* Donation records */}
      <div className="space-y-0">
        {displayedDonations.map((donation, index) => (
          <DonationRecord 
            key={donation.id || `${donation.date}-${index}`} 
            donation={donation} 
          />
        ))}
      </div>
      
      {/* Load more button */}
      {hasMore && (
        <div className="pt-4 text-center">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            className="text-gray-600"
          >
            {showAll ? 'Show Less' : `Show All ${sortedDonations.length} Donations`}
          </Button>
        </div>
      )}
      
      {/* Show total count */}
      {sortedDonations.length > 0 && (
        <div className="pt-4 text-center text-sm text-gray-500">
          {showAll ? 'Showing all' : `Showing ${displayedDonations.length} of`} {sortedDonations.length} donation{sortedDonations.length !== 1 ? 's' : ''}
        </div>
      )}
    </Card>
  );
};

export default DonationHistory;