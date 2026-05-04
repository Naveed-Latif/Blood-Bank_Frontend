import { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";

export const DonorSearch = ({ onSearch, onFilterChange }) => {
  const [searchFilters, setSearchFilters] = useState({
    bloodType: "",
    location: "",
  });
  const [isSearching, setIsSearching] = useState(false);

  const bloodTypeOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...searchFilters, [name]: value };
    setSearchFilters(newFilters);
    if (onFilterChange) onFilterChange({ [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSearch) return;
    setIsSearching(true);
    try {
      onSearch({ filters: searchFilters });
    } catch (error) {
      console.error("Search failed:", error);
      onSearch({ filters: searchFilters });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    const clearedFilters = { bloodType: "", location: "" };
    setSearchFilters(clearedFilters);
    if (onFilterChange) onFilterChange(clearedFilters);
    if (onSearch) onSearch({ filters: clearedFilters });
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Search Filters</h3>
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
            error={undefined}
          />
          <Input
            label="City"
            name="location"
            type="text"
            value={searchFilters.location}
            onChange={handleChange}
            placeholder="Enter city name"
            error={undefined}
          />
          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search Donors"}
            </Button>
            <Button type="button" variant="outline" onClick={handleClear} className="w-full">
              Clear Filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};