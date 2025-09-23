import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    phone_number: '',
    blood_group: '',
    city: '',
    country: 'Pakistan', // Default as per your backend validation
    password: '',
    confirmPassword: '',
    last_donation_date: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

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
  };

  const validateForm = () => {
    const newErrors = {};
    
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
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8 || formData.password.length > 20) {
      newErrors.password = 'Password must be 8-20 characters long';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Prepare data for backend (matching your schema)
      const signupData = {
        name: formData.name,
        last_name: formData.last_name,
        email: formData.email || null, // Optional field
        phone_number: formData.phone_number.replace(/\D/g, ''), // Remove non-digits
        blood_group: formData.blood_group,
        city: formData.city,
        country: formData.country,
        password: formData.password,
        last_donation_date: formData.last_donation_date || null,
      };

      const response = await signup(signupData);
      navigate('/dashboard');
    } catch (error) {
      // Handle validation errors from backend
      if (error.message.includes('already registered')) {
        if (error.message.includes('phone')) {
          setErrors({ phone_number: 'Phone number already registered' });
        } else if (error.message.includes('email')) {
          setErrors({ email: 'Email already registered' });
        }
      } else {
        setErrors({ general: error.message || 'Signup failed' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {errors.general}
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
        
        <Input
          label="Last Donation Date (Optional)"
          name="last_donation_date"
          type="date"
          value={formData.last_donation_date}
          onChange={handleChange}
          error={errors.last_donation_date}
          max={new Date().toISOString().split('T')[0]} // Prevent future dates
        />
        
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
          required
        />
        
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          required
        />
      </div>

      <div className="text-xs text-gray-600">
        <p>Password requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>8-20 characters long</li>
          <li>At least one uppercase letter</li>
          <li>At least one special character</li>
        </ul>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </div>

      <div className="text-center">
        <span className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
            Sign in
          </Link>
        </span>
      </div>
    </form>
  );
};