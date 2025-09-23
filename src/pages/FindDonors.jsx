import { DonorSearch } from '@/components/Donors/DonorSearch';
import { DonorList } from '@/components/Donors/DonorList';

export default function FindDonors() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Donors</h1>
          <p className="mt-2 text-gray-600">Search for blood donors in your area</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <DonorSearch />
          </div>
          <div className="lg:col-span-3">
            <DonorList />
          </div>
        </div>
      </div>
    </div>
  );
}