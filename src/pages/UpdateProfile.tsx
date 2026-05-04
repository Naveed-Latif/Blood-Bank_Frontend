import { UpdateProfileForm } from '../components/Auth/UpdateProfileForm';
import { Card } from '../components/ui/Card';

export default function UpdateProfile() {
  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-200">Update Profile</h1>
          <p className="mt-2 text-gray-400">
            Update your profile information and donation history
          </p>
        </div>
        
        <Card className="p-6 md:p-8">
          <UpdateProfileForm />
        </Card>
      </div>
    </div>
  );
}


