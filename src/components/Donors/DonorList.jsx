import { useState, useEffect, useMemo, useRef } from 'react';
import { DonorCard } from './DonorCard';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

// Stable default object to prevent re-renders - Updated with availableOnly
const DEFAULT_SEARCH_FILTERS = { 
  bloodType: '', 
  location: '', 
  radius: '', 
  availableOnly: false 
};

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

export const DonorList = ({ searchFilters = DEFAULT_SEARCH_FILTERS, onFilterChange }) => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [internalFilters, setInternalFilters] = useState(DEFAULT_SEARCH_FILTERS);
  const isInitialized = useRef(false);

  // Merge external and internal filters, prioritizing external filters
  const stableSearchFilters = useMemo(() => ({
    bloodType: searchFilters.bloodType || internalFilters.bloodType || '',
    location: searchFilters.location || internalFilters.location || '',
    radius: searchFilters.radius || internalFilters.radius || '',
    availableOnly: searchFilters.availableOnly !== undefined ? searchFilters.availableOnly : internalFilters.availableOnly
  }), [searchFilters.bloodType, searchFilters.location, searchFilters.radius, searchFilters.availableOnly, internalFilters]);

  useEffect(() => {
    if (!isInitialized.current) {
      fetchDonors();
      isInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    // Only filter if we have donors and the component is initialized
    if (!isInitialized.current || donors.length === 0) return;

    let filtered = [...donors];

    if (stableSearchFilters.bloodType) {
      filtered = filtered.filter(donor => donor.blood_group === stableSearchFilters.bloodType);
    }

    if (stableSearchFilters.location) {
      filtered = filtered.filter(donor => 
        donor.city.toLowerCase().includes(stableSearchFilters.location.toLowerCase())
      );
    }

    // Filter by radius (mock implementation based on city matching)
    if (stableSearchFilters.radius && stableSearchFilters.location) {
      const radiusKm = parseInt(stableSearchFilters.radius);
      // For demo purposes, we'll simulate radius filtering
      // In a real app, you'd use actual coordinates and calculate distances
      filtered = filtered.filter(donor => {
        // Mock radius filtering - in reality you'd calculate actual distance
        // For now, we'll just ensure the city matches and add some randomness
        const cityMatch = donor.city.toLowerCase().includes(stableSearchFilters.location.toLowerCase());
        if (!cityMatch) return false;
        
        // Mock: randomly include/exclude based on radius (for demo)
        // In production, you'd use actual coordinates
        const mockDistance = Math.random() * 100; // Random distance 0-100km
        return mockDistance <= radiusKm;
      });
    }

    // Apply availability filter only if requested
    if (stableSearchFilters.availableOnly) {
      filtered = filtered.filter(donor => {
        if (!donor.last_donation_date) return true;
        const daysSince = Math.floor((new Date() - new Date(donor.last_donation_date)) / (1000 * 60 * 60 * 24));
        return daysSince >= 56;
      });
    }

    setFilteredDonors(filtered);
  }, [donors, stableSearchFilters]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const data = await api.getDonors();
      setDonors(data);
      setFilteredDonors(data);
      setError(null);
    } catch (_error) {
      // Failed to fetch donors - only log in development
      setError('Failed to load donors');
      // Fallback to mock data for development
      setDonors([]);
      setFilteredDonors([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle availability toggle
  const handleAvailabilityToggle = () => {
    const newAvailabilityState = !stableSearchFilters.availableOnly;
    
    // Update internal state
    setInternalFilters(prev => ({
      ...prev,
      availableOnly: newAvailabilityState
    }));
    
    // Also notify parent if callback exists
    if (onFilterChange) {
      onFilterChange({ availableOnly: newAvailabilityState });
    }
  };

  // Count available vs total donors for display
  const getAvailabilityStats = () => {
    const availableDonors = donors.filter(donor => {
      if (!donor.last_donation_date) return true;
      const daysSince = Math.floor((new Date() - new Date(donor.last_donation_date)) / (1000 * 60 * 60 * 24));
      return daysSince >= 56;
    });
    return {
      available: availableDonors.length,
      total: donors.length,
      unavailable: donors.length - availableDonors.length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchDonors} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const availabilityStats = getAvailabilityStats();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donors</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-gray-600">
              {filteredDonors.length} donor{filteredDonors.length !== 1 ? 's' : ''} found
              {stableSearchFilters.availableOnly && (
                <span className="ml-1 text-green-600 font-medium">
                  (available only)
                </span>
              )}
            </p>
            
            {/* Availability Statistics */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                {availabilityStats.available} available
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                {availabilityStats.unavailable} not available
              </span>
            </div>
          </div>
          
          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mt-2">
            {stableSearchFilters.bloodType && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Blood Type: {stableSearchFilters.bloodType}
              </span>
            )}
            {stableSearchFilters.location && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Location: {stableSearchFilters.location}
              </span>
            )}
            {stableSearchFilters.radius && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Radius: {stableSearchFilters.radius}km
              </span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Availability Toggle Button */}
          <button 
            onClick={() => {
              console.log('Button clicked!'); // Debug log
              console.log('Current availableOnly:', stableSearchFilters.availableOnly);
              
              const newAvailabilityState = !stableSearchFilters.availableOnly;
              console.log('New availableOnly:', newAvailabilityState);
              
              // Update internal state
              setInternalFilters(prev => {
                console.log('Updating internal filters:', { ...prev, availableOnly: newAvailabilityState });
                return { ...prev, availableOnly: newAvailabilityState };
              });
              
              // Also notify parent if callback exists
              if (onFilterChange) {
                console.log('Calling parent onFilterChange');
                onFilterChange({ availableOnly: newAvailabilityState });
              }
            }}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              stableSearchFilters.availableOnly 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {stableSearchFilters.availableOnly ? "Show All" : "Available Only"}
          </button>
          
          {/* Refresh Button */}
          <Button variant="outline" size="sm" onClick={fetchDonors}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {filteredDonors.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No donors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {stableSearchFilters.availableOnly 
              ? "No available donors match your search criteria. Try removing some filters or toggle 'Show All'." 
              : "Try adjusting your search filters to find more donors."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor) => (
            <DonorCard key={donor.id || `${donor.name}-${donor.phone_number}`} donor={donor} />
          ))}
        </div>
      )}
    </div>
  );
};