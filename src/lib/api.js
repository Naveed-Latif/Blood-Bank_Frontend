const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('accessToken');

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include', // Important for cookies (refresh token)
      ...options,
    };

    try {
      console.log('Making request to:', url);
      const response = await fetch(url, config);
      
      // Handle 401 errors by attempting token refresh
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          const newToken = localStorage.getItem('accessToken');
          config.headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, config);
          
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          
          const contentType = retryResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await retryResponse.json();
          }
          return await retryResponse.text();
        } else {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return;
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('API request failed:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please make sure your FastAPI backend is running on http://localhost:8000');
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(username, password) {
    // FastAPI OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include', // Include cookies for refresh token
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    
    // Store access token
    localStorage.setItem('accessToken', data.access_token);
    
    return data;
  }

  async signup(userData) {
    // Add confirm_password field for backend validation
    const signupData = {
      ...userData,
      confirm_password: userData.password // Assuming password confirmation
    };

    return this.request('/signup/', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  }

  async refreshToken() {
    try {
      const response = await fetch(`${this.baseURL}/refresh`, {
        method: 'POST',
        credentials: 'include', // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
    }
  }

  async getCurrentUser() {
    return this.request('/users/me/profile');
  }

  async updateUser(userData) {
    return this.request('/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }


  // Donor endpoints
  async getDonors(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/users?${queryParams}` : '/users';
    return this.request(endpoint);
  }

  async getDonorsByBloodGroup(bloodGroup) {
    return this.request(`/users/blood-group/${bloodGroup}`);
  }

  async getDonorById(id) {
    return this.request(`/users/${id}`);
  }

  async searchDonors(searchParams) {
    // For now, we'll use the blood group filter since that's what the backend supports
    if (searchParams.bloodType) {
      return this.getDonorsByBloodGroup(searchParams.bloodType);
    }
    return this.getDonors();
  }

  // Donation endpoints (placeholder - not implemented in your backend yet)
  async getDonations() {
    // This would need to be implemented in your backend
    throw new Error('Donations endpoint not yet implemented in backend');
  }

  async createDonation(donationData) {
    // This would need to be implemented in your backend
    throw new Error('Create donation endpoint not yet implemented in backend');
  }

  // Request endpoints (placeholder - not implemented in your backend yet)
  async getRequests() {
    // This would need to be implemented in your backend
    throw new Error('Requests endpoint not yet implemented in backend');
  }

  async createRequest(requestData) {
    // This would need to be implemented in your backend
    throw new Error('Create request endpoint not yet implemented in backend');
  }

  // Contact endpoints (placeholder - not implemented in your backend yet)
  async sendMessage(messageData) {
    // This would need to be implemented in your backend
    throw new Error('Contact endpoint not yet implemented in backend');
  }
}

export const api = new ApiClient();