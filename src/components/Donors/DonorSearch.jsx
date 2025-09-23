import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

export const DonorSearch = ({ onSearch }) => {
  const [searchFilters, setSearchFilters] = useState({
    bloodType: '',
    location: '',
    radius: '',
  });
  const [isSearching, setIsSearching] = useState(false);

  const bloodTypeOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  const radiusOptions = [
    { value: '5', label: '5 km' },
    { value: '10', label: '10 km' },
    { value: '25', label: '25 km' },
    { value: '50', label: '50 km' },
    { value: '100', label: '100 km' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSearch) return;

    setIsSearching(true);
    try {
      // If blood type is selected, use the backend search
      if (searchFilters.bloodType) {
        const results = await api.getDonorsByBloodGroup(searchFilters.bloodType);
        onSearch({ results, filters: searchFilters });
      } else {
        // For other filters, pass them to parent component
        onSearch({ filters: searchFilters });
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to client-side filtering
      onSearch({ filters: searchFilters });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchFilters({
      bloodType: '',
      location: '',
      radius: '',
    });
    if (onSearch) {
      onSearch({ filters: {} });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Search Filters</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Blood Group"
            name="bloodType"
            value={searchFilters.bloodType}
            onChange={handleChange}
            options={bloodTypeOptions}
            placeholder="Any blood group"
          />

          <Input
            label="City"
            name="location"
            type="text"
            value={searchFilters.location}
            onChange={handleChange}
            placeholder="Enter city name"
          />

          <Select
            label="Search Radius"
            name="radius"
            value={searchFilters.radius}
            onChange={handleChange}
            options={radiusOptions}
            placeholder="Any distance"
            disabled // Not implemented in backend yet
          />

          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search Donors'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};