import { useState } from 'react';
import { DonorList } from '@/components/Donors/DonorList';

// Default search filters - must match what DonorList expects
const DEFAULT_SEARCH_FILTERS = { 
  bloodType: '', 
  location: '', 
  radius: '', 
  availableOnly: false 
};

export default function AllDonors() {
  const [searchFilters, setSearchFilters] = useState(DEFAULT_SEARCH_FILTERS);

  const handleFilterChange = (newFilters) => {
    console.log('AllDonors: Filter change received:', newFilters); // Debug log
    setSearchFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Donors</h1>
          <p className="mt-2 text-gray-600">Browse all registered blood donors</p>
        </div>
        
        <DonorList 
          searchFilters={searchFilters}
          onFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
}