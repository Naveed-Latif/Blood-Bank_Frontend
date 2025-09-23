import { Card } from '@/components/ui/Card';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your blood donation dashboard</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Donations</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">12</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Last Donation</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">2 weeks ago</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Next Eligible</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">4 weeks</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Blood Type</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">O+</p>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Blood donation completed</span>
                <span className="text-sm text-gray-500">2 weeks ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Profile updated</span>
                <span className="text-sm text-gray-500">1 month ago</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
                Schedule Donation
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Update Profile
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}