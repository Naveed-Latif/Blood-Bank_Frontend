import React from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { BloodBankStatsError } from './ui/ErrorComponents';

// Helper function to determine inventory level status
const getInventoryStatus = (count) => {
  if (count < 10) return { level: 'low', color: 'text-red-600', bgColor: 'bg-red-100', icon: '🔴' };
  if (count < 25) return { level: 'normal', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '🟡' };
  return { level: 'high', color: 'text-green-600', bgColor: 'bg-green-100', icon: '🟢' };
};

// Helper function to format large numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Blood type donor count item component
const BloodTypeDonors = ({ bloodType, count }) => {
  const status = getInventoryStatus(count);
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full ${status.bgColor} flex items-center justify-center`}>
          <span className="text-sm font-bold text-gray-800">{bloodType}</span>
        </div>
        <div>
          <div className="font-semibold text-gray-900">{count} donors</div>
          <div className={`text-xs ${status.color} capitalize`}>
            {status.level} availability
          </div>
        </div>
      </div>
      <div className="text-lg">{status.icon}</div>
    </div>
  );
};

// Urgent needs component
const UrgentNeeds = ({ urgentNeeds = [] }) => {
  if (urgentNeeds.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <div className="text-2xl mb-2">✅</div>
        <p className="text-sm">No urgent blood needs at this time</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-red-600 text-lg">🚨</span>
        <span className="font-semibold text-red-800">Urgent Needs</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {urgentNeeds.map((bloodType) => (
          <span
            key={bloodType}
            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-200"
          >
            {bloodType}
          </span>
        ))}
      </div>
      <p className="text-xs text-red-600 mt-2">
        These blood types have very few registered donors and need more volunteers
      </p>
    </div>
  );
};

// Community stats component
const CommunityStats = ({ totalDonations, donationsThisMonth, totalDonors }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xl font-bold text-blue-600 mb-1">
          {formatNumber(totalDonations || 0)}
        </div>
        <div className="text-xs text-blue-800">Total Donations</div>
        <div className="text-xs text-blue-600 mt-1">All time</div>
      </div>
      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="text-xl font-bold text-green-600 mb-1">
          {formatNumber(donationsThisMonth || 0)}
        </div>
        <div className="text-xs text-green-800">This Month</div>
        <div className="text-xs text-green-600 mt-1">Recent impact</div>
      </div>
      <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
        <div className="text-xl font-bold text-purple-600 mb-1">
          {formatNumber(totalDonors || 0)}
        </div>
        <div className="text-xs text-purple-800">Registered</div>
        <div className="text-xs text-purple-600 mt-1">Active donors</div>
      </div>
    </div>
  );
};

// Main BloodBankStats component
const BloodBankStats = ({ 
  bloodBankStats, 
  loading = false, 
  error = null, 
  onRetry 
}) => {
  // Handle loading state
  if (loading) {
    return (
      <Card className="p-6">
        <CardHeader className="pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Blood Bank Statistics</h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {/* Inventory skeleton */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
            
            {/* Urgent needs skeleton */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 w-12 bg-gray-200 rounded-full"></div>
                ))}
              </div>
            </div>
            
            {/* Community stats skeleton */}
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="p-6">
        <CardHeader className="pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Blood Bank Statistics</h3>
        </CardHeader>
        <CardContent>
          <BloodBankStatsError error={error} onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  // Handle no data state
  if (!bloodBankStats) {
    return (
      <Card className="p-6">
        <CardHeader className="pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Blood Bank Statistics</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-3">📊</div>
            <p className="text-sm">Blood bank statistics not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { 
    current_inventory = {}, 
    urgent_needs = [], 
    total_community_donations = 0, 
    donations_this_month = 0,
    total_registered_donors = 0
  } = bloodBankStats;

  // Blood types in standard order
  const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Blood Bank Statistics</h3>
          <div className="text-sm text-gray-500">Live data</div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Donor Availability by Blood Type */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">🩸</span>
            Donor Availability by Blood Type
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {bloodTypes.map((bloodType) => (
              <BloodTypeDonors
                key={bloodType}
                bloodType={bloodType}
                count={current_inventory[bloodType] || 0}
              />
            ))}
          </div>
        </div>

        {/* Urgent Needs */}
        <div>
          <UrgentNeeds urgentNeeds={urgent_needs} />
        </div>

        {/* Community Statistics */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">🏘️</span>
            Community Impact
          </h4>
          <CommunityStats 
            totalDonations={total_community_donations}
            donationsThisMonth={donations_this_month}
            totalDonors={total_registered_donors}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BloodBankStats;