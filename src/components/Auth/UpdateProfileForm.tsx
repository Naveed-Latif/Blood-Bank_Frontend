import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const UpdateProfileForm = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    phone_number: '',
    blood_group: '',
    city: '',
    last_donation_date: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        blood_group: user.blood_group || user.blood_type || '',
        city: user.city || '',
        last_donation_date: user.last_donation_date 
          ? new Date(user.last_donation_date).toISOString().split('T')[0]
          : '',
      });
    }
  }, [user]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    // Email is optional in your backend
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = 'Phone number should be 10-15 digits';
    }
    
    if (!formData.blood_group) {
      newErrors.blood_group = 'Blood group is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // Validate last donation date is not in the future
    if (formData.last_donation_date) {
      const donationDate = new Date(formData.last_donation_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      
      if (donationDate > today) {
        newErrors.last_donation_date = 'Last donation date cannot be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      // Prepare data for backend (matching your schema)
      const updateData = {
        name: formData.name,
        last_name: formData.last_name,
        email: formData.email || null, // Optional field
        phone_number: formData.phone_number.replace(/\D/g, ''), // Remove non-digits
        blood_group: formData.blood_group,
        city: formData.city,
        last_donation_date: formData.last_donation_date || null,
      };

      await updateUser(updateData);
      setSuccessMessage('Profile updated successfully!');
      
      // Optionally navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      // Handle validation errors from backend
      if (error.message.includes('already registered')) {
        if (error.message.includes('phone')) {
          setErrors({ phone_number: 'Phone number already registered' });
        } else if (error.message.includes('email')) {
          setErrors({ email: 'Email already registered' });
        }
      } else {
        setErrors({ general: error.message || 'Update failed' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading user data...</p>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {errors.general}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter your first name"
            required
          />
          
          <Input
            label="Last Name"
            name="last_name"
            type="text"
            value={formData.last_name}
            onChange={handleChange}
            error={errors.last_name}
            placeholder="Enter your last name"
            required
          />
        </div>
        
        <Input
          label="Email (Optional)"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter your email address"
        />
        
        <Input
          label="Phone Number"
          name="phone_number"
          type="tel"
          value={formData.phone_number}
          onChange={handleChange}
          error={errors.phone_number}
          placeholder="Enter your phone number"
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="City"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            placeholder="Enter your city"
            required
          />
          
          <Select
            label="Blood Group"
            name="blood_group"
            value={formData.blood_group}
            onChange={handleChange}
            error={errors.blood_group}
            options={bloodTypeOptions}
            placeholder="Select your blood group"
            required
          />
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
          <Input
            label="Last Donation Date"
            name="last_donation_date"
            type="date"
            value={formData.last_donation_date}
            onChange={handleChange}
            error={errors.last_donation_date}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
          />
          <p className="mt-2 text-xs text-gray-400">
            Updating your last donation date helps us track when you're eligible to donate again. 
            You can donate again 8 weeks (56 days) after your last donation.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/dashboard')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="ml-auto"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </form>
  );
};

