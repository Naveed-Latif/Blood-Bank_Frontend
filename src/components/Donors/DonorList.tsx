import { useState, useEffect, useMemo } from "react";
import { DonorCard } from "./DonorCard";
import { Button } from "../ui/Button";
import { getDonors } from "../../api/donor.api";
import { Donor } from "../../types";

const DEFAULT_SEARCH_FILTERS = { bloodType: "", location: "" };

export const DonorList = ({ searchFilters = DEFAULT_SEARCH_FILTERS }) => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stableSearchFilters = useMemo(
    () => ({
      bloodType: searchFilters.bloodType || "",
      location: searchFilters.location || "",
    }),
    [searchFilters.bloodType, searchFilters.location],
  );

  // Fetch on mount
  useEffect(() => {
    fetchDonors();
  }, []);

  // Filter whenever donors or filters change
  useEffect(() => {
    let filtered = [...donors];

    if (stableSearchFilters.bloodType) {
      filtered = filtered.filter(
        (donor) => donor.blood_group === stableSearchFilters.bloodType,
      );
    }

    if (stableSearchFilters.location) {
      filtered = filtered.filter((donor) =>
        donor.city.toLowerCase().includes(stableSearchFilters.location.toLowerCase()),
      );
    }

    filtered = filtered.filter((donor) => {
      if (!donor.last_donation_date) return true;
      const daysSince = Math.floor(
        (Date.now() - new Date(donor.last_donation_date).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return daysSince >= 56;
    });

    setFilteredDonors(filtered);
  }, [donors, stableSearchFilters]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const data = await getDonors();
      setDonors(data);
      setFilteredDonors(data);
      setError(null);
    } catch (e) {
      setError("Failed to load donors");
      setDonors([]);
      setFilteredDonors([]);
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
            {filteredDonors.length} donor{filteredDonors.length !== 1 ? "s" : ""} found
            {stableSearchFilters.bloodType && (
              <span className="ml-2 text-sm text-blue-600">
                • Blood Group: {stableSearchFilters.bloodType}
              </span>
            )}
            {stableSearchFilters.location && (
              <span className="ml-2 text-sm text-blue-600">
                • Location: {stableSearchFilters.location}
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDonors}>
          Refresh
        </Button>
      </div>

      {filteredDonors.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900">No donors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor) => (
            <DonorCard key={donor.id} donor={donor} />
          ))}
        </div>
      )}
    </div>
  );
};