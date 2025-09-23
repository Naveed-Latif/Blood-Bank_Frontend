import { useState, useEffect } from 'react';
import { DonorCard } from './DonorCard';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

export const DonorList = ({ searchFilters = {} }) => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    filterDonors();
  }, [searchFilters, donors]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const data = await api.getDonors();
      setDonors(data);
      setFilteredDonors(data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch donors:', error);
      setError('Failed to load donors');
      // Fallback to mock data for development
      setDonors([]);
      setFilteredDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDonors = () => {
    let filtered = [...donors];

    if (searchFilters.bloodType) {
      filtered = filtered.filter(donor => donor.blood_group === searchFilters.bloodType);
    }

    if (searchFilters.location) {
      filtered = filtered.filter(donor => 
        donor.city.toLowerCase().includes(searchFilters.location.toLowerCase())
      );
    }

    // Filter by availability (last donation more than 56 days ago or never donated)
    filtered = filtered.filter(donor => {
      if (!donor.last_donation_date) return true;
      const daysSince = Math.floor((new Date() - new Date(donor.last_donation_date)) / (1000 * 60 * 60 * 24));
      return daysSince >= 56;
    });

    setFilteredDonors(filtered);
  };

  const handleSearchByBloodGroup = async (bloodGroup) => {
    try {
      setLoading(true);
      const data = await api.getDonorsByBloodGroup(bloodGroup);
      setFilteredDonors(data);
      setError(null);
    } catch (error) {
      console.error('Failed to search donors:', error);
      setError('Failed to search donors');
    } finally {
      setLoading(false);
    }
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donors</h2>
          <p className="text-gray-600">
            {filteredDonors.length} donor{filteredDonors.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={fetchDonors}>
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
            Try adjusting your search filters to find more donors.
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