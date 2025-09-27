import { apiCache } from '../utils/cache';
import { transformUserData } from '../utils/dataTransform';
import { logApiRequest, logApiResponse, logApiError } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
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
      // Log API request using structured logging
      logApiRequest(endpoint, config.method, { url, headers: config.headers });
      const response = await fetch(url, config);
      
      // Handle 401 errors by attempting token refresh
      if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/refresh')) {
        if (this.isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
            // Retry with new token
            const newToken = localStorage.getItem('accessToken');
            config.headers.Authorization = `Bearer ${newToken}`;
            return fetch(url, config).then(async (retryResponse) => {
              if (!retryResponse.ok) {
                throw new Error(`HTTP error! status: ${retryResponse.status}`);
              }
              const contentType = retryResponse.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                return await retryResponse.json();
              }
              return await retryResponse.text();
            });
          });
        }

        this.isRefreshing = true;

        try {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            this.processQueue(null, refreshed);
            
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
            // Refresh failed, logout user
            this.processQueue(new Error('Token refresh failed'), null);
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return;
          }
        } catch (refreshError) {
          this.processQueue(refreshError, null);
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return;
        } finally {
          this.isRefreshing = false;
        }
      }
      
      // Log API response
      logApiResponse(endpoint, config.method, response.status, { url });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        error.status = response.status;
        logApiError(endpoint, config.method, error, { url, responseText: errorText });
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        return await response.text();
      }
    } catch (error) {
      // Only log if not already logged (to avoid duplicate logging)
      if (!error.status) {
        logApiError(endpoint, config.method, error, { url });
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Cannot connect to server. Please make sure your FastAPI backend is running on http://localhost:8000');
        networkError.originalError = error;
        throw networkError;
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
      logApiRequest('/refresh', 'POST', { purpose: 'token_refresh' });
      const response = await fetch(`${this.baseURL}/refresh`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      logApiResponse('/refresh', 'POST', response.status, { purpose: 'token_refresh' });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        return data.access_token;
      } else {
        const error = new Error(`Token refresh failed: ${response.status}`);
        error.status = response.status;
        // Log as warning since token refresh failures are somewhat expected
        logApiError('/refresh', 'POST', error, { purpose: 'token_refresh', expected: true });
        return false;
      }
    } catch (error) {
      // Log token refresh errors as warnings since they're expected during normal operation
      logApiError('/refresh', 'POST', error, { purpose: 'token_refresh', expected: true });
      return false;
    }
  }

  async logout() {
    try {
      logApiRequest('/logout', 'POST', { purpose: 'logout' });
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      logApiResponse('/logout', 'POST', response.status, { purpose: 'logout' });
    } catch (error) {
      // Logout errors are not critical - log as warning
      logApiError('/logout', 'POST', error, { purpose: 'logout', critical: false });
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

  // Dashboard data endpoints
  async getUserDashboardData() {
    const cacheKey = 'user-dashboard-data';
    
    // Try cache first
    const cached = apiCache.get(cacheKey);
    if (cached) {
      // Only log cache hits in development mode to reduce noise
      if (import.meta.env.MODE === 'development') {
        logApiResponse('/users/me/profile', 'GET', 200, { source: 'cache', cacheKey });
      }
      return cached;
    }
    
    try {
      const data = await this.request('/users/me/profile');
      
      // Transform backend data to frontend format
      const transformedData = transformUserData(data);
      
      // Cache for 2 minutes (user data changes less frequently)
      apiCache.set(cacheKey, transformedData, 2 * 60 * 1000);
      
      return transformedData;
    } catch (error) {
      logApiError('/users/me/profile', 'GET', error, { purpose: 'dashboard_data' });
      throw new Error(`Failed to load dashboard data: ${error.message}`);
    }
  }

  async getUserDonations() {
    const cacheKey = 'user-donations';
    
    // Try cache first
    const cached = apiCache.get(cacheKey);
    if (cached) {
      // Only log cache hits in development mode to reduce noise
      if (import.meta.env.MODE === 'development') {
        logApiResponse('/users/me/profile', 'GET', 200, { source: 'cache', cacheKey, purpose: 'donations' });
      }
      return cached;
    }
    
    try {
      // Since there's no specific donations endpoint, we'll use the profile data
      // which should contain donation history
      const profile = await this.request('/users/me/profile');
      const donations = profile.donations || [];
      
      // Cache for 5 minutes
      apiCache.set(cacheKey, donations, 5 * 60 * 1000);
      
      return donations;
    } catch (error) {
      logApiError('/users/me/profile', 'GET', error, { purpose: 'user_donations' });
      throw new Error(`Failed to load donation history: ${error.message}`);
    }
  }

  async getBloodBankStats() {
    const cacheKey = 'blood-bank-stats';
    
    // Try cache first
    const cached = apiCache.get(cacheKey);
    if (cached) {
      // Only log cache hits in development mode to reduce noise
      if (import.meta.env.MODE === 'development') {
        logApiResponse('/users/', 'GET', 200, { source: 'cache', cacheKey, purpose: 'blood_bank_stats' });
      }
      return cached;
    }
    
    try {
      // Get all users to calculate blood bank statistics
      const users = await this.request('/users/');
      
      // Calculate blood type distribution
      const bloodTypeCount = {};
      const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
      
      // Initialize counts
      bloodTypes.forEach(type => {
        bloodTypeCount[type] = 0;
      });
      
      // Count users by blood type
      users.forEach(user => {
        if (user.blood_type && Object.prototype.hasOwnProperty.call(bloodTypeCount, user.blood_type)) {
          bloodTypeCount[user.blood_type]++;
        }
      });
      
      // Calculate total donations from all users
      let totalDonations = 0;
      let donationsThisMonth = 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      users.forEach(user => {
        if (user.donations && Array.isArray(user.donations)) {
          totalDonations += user.donations.length;
          
          // Count donations this month
          user.donations.forEach(donation => {
            const donationDate = new Date(donation.date);
            if (donationDate.getMonth() === currentMonth && 
                donationDate.getFullYear() === currentYear) {
              donationsThisMonth++;
            }
          });
        }
      });
      
      // Determine urgent needs (blood types with low counts)
      const urgentNeeds = bloodTypes.filter(type => bloodTypeCount[type] < 5);
      
      const stats = {
        current_inventory: bloodTypeCount,
        urgent_needs: urgentNeeds,
        total_community_donations: totalDonations,
        donations_this_month: donationsThisMonth,
        total_registered_donors: users.length
      };
      
      // Cache for 3 minutes (blood bank stats change moderately)
      apiCache.set(cacheKey, stats, 3 * 60 * 1000);
      
      return stats;
    } catch (error) {
      logApiError('/users/', 'GET', error, { purpose: 'blood_bank_stats' });
      throw new Error(`Failed to load blood bank statistics: ${error.message}`);
    }
  }

  async getUpcomingDrives() {
    try {
      // Since there's no blood drives endpoint, return empty array for now
      // This can be updated when the backend endpoint is available
      return [];
    } catch (error) {
      logApiError('/blood-drives', 'GET', error, { purpose: 'upcoming_drives', implemented: false });
      throw new Error(`Failed to load upcoming blood drives: ${error.message}`);
    }
  }
}

export const api = new ApiClient();