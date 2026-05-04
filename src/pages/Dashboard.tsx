import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const diffDays = Math.ceil((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return `${Math.ceil(diffDays / 30)} months ago`;
};

const calculateNextEligible = (lastDonationDate: string | null) => {
  if (!lastDonationDate) return "Eligible now";
  const nextEligible = new Date(lastDonationDate);
  nextEligible.setDate(nextEligible.getDate() + 56);
  if (Date.now() >= nextEligible.getTime()) return "Eligible now";
  const diffDays = Math.ceil((nextEligible.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diffDays < 7 ? `${diffDays} days` : `${Math.ceil(diffDays / 7)} weeks`;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-gray-400">
            Welcome back, <span className="text-red-500 font-semibold">{user?.name}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-sm font-medium text-gray-400">Blood Group</h3>
            <p className="text-4xl font-bold text-red-500 mt-2">{user?.blood_group || "—"}</p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-sm font-medium text-gray-400">Last Donation</h3>
            <p className="text-2xl font-bold text-blue-400 mt-2">
              {formatDate(user?.last_donation_date || null)}
            </p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-sm font-medium text-gray-400">Next Eligible</h3>
            <p className="text-2xl font-bold text-green-400 mt-2">
              {calculateNextEligible(user?.last_donation_date || null)}
            </p>
          </Card>
        </div>

        {/* Profile + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Your Profile</h2>
            <div className="space-y-3">
              {[
                { label: "Name", value: `${user?.name} ${user?.last_name}` },
                { label: "Phone", value: user?.phone_number },
                { label: "Email", value: user?.email || "—" },
                { label: "City", value: user?.city },
                { label: "Country", value: user?.country },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400 text-sm">{label}</span>
                  <span className="text-white text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/find-donors")}>
                Find Donors
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/update-profile")}>
                Update Profile
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}