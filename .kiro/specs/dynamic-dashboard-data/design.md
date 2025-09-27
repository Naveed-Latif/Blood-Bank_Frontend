# Design Document

## Overview

The dashboard currently displays hardcoded values for user information and statistics. This design transforms the dashboard into a dynamic, data-driven interface that fetches and displays real user data from the backend API. The solution involves creating new API endpoints, implementing data fetching hooks, adding loading states, error handling, and automatic data refresh mechanisms.

## Architecture

The solution involves several key components working together:

1. **Enhanced API Client**: New endpoints for fetching dashboard-specific data
2. **Dashboard Data Hook**: Custom React hook for managing dashboard data state
3. **Dashboard Components**: Updated UI components with loading states and error handling
4. **Data Refresh System**: Automatic data refresh and cache management
5. **Error Boundary**: Graceful error handling for data fetching failures

## Components and Interfaces

### Enhanced API Client

The existing `ApiClient` class needs new methods for dashboard data:

```javascript
// User dashboard data
async getUserDashboardData() {
  return this.request('/users/me/dashboard');
}

// Donation history and statistics
async getUserDonations() {
  return this.request('/users/me/donations');
}

// Blood bank statistics
async getBloodBankStats() {
  return this.request('/stats/blood-bank');
}

// Upcoming blood drives
async getUpcomingDrives() {
  return this.request('/blood-drives/upcoming');
}
```

### Dashboard Data Hook

A custom hook to manage all dashboard data fetching and state:

```javascript
const useDashboardData = () => {
  const [data, setData] = useState({
    user: null,
    donations: null,
    bloodBankStats: null,
    upcomingDrives: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async (isRefresh = false) => { ... };
  
  // Refresh specific data sections
  const refreshUserData = async () => { ... };
  const refreshDonationData = async () => { ... };
  
  return {
    data,
    loading,
    error,
    refreshing,
    refreshData: fetchDashboardData,
    refreshUserData,
    refreshDonationData
  };
};
```

### Dashboard Component Structure

The dashboard will be restructured into smaller, focused components:

```javascript
// Main Dashboard component
const Dashboard = () => {
  const { data, loading, error, refreshData } = useDashboardData();
  
  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError onRetry={refreshData} />;
  
  return (
    <div>
      <DashboardHeader user={data.user} />
      <DashboardStats 
        donations={data.donations} 
        user={data.user} 
      />
      <DashboardContent 
        donations={data.donations}
        bloodBankStats={data.bloodBankStats}
        upcomingDrives={data.upcomingDrives}
      />
    </div>
  );
};

// Individual components
const DashboardStats = ({ donations, user }) => { ... };
const DashboardContent = ({ donations, bloodBankStats, upcomingDrives }) => { ... };
const DashboardSkeleton = () => { ... };
const DashboardError = ({ onRetry }) => { ... };
```

### Loading States and Skeletons

Implement skeleton loading states for each dashboard section:

```javascript
const DashboardSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-200 h-48 rounded-lg"></div>
      <div className="bg-gray-200 h-48 rounded-lg"></div>
    </div>
  </div>
);
```

## Data Models

### User Dashboard Data

```javascript
{
  id: number,
  name: string,
  email: string,
  phone_number: string,
  blood_group: string,
  address: string,
  city: string,
  state: string,
  pincode: string,
  last_donation_date: string | null,
  total_donations: number,
  next_eligible_date: string | null,
  profile_complete: boolean
}
```

### Donation History

```javascript
{
  donations: [
    {
      id: number,
      date: string,
      location: string,
      blood_type: string,
      volume_ml: number,
      status: 'completed' | 'pending' | 'cancelled'
    }
  ],
  total_donations: number,
  total_volume_ml: number,
  last_donation_date: string | null,
  next_eligible_date: string | null
}
```

### Blood Bank Statistics

```javascript
{
  current_inventory: {
    'A+': number,
    'A-': number,
    'B+': number,
    'B-': number,
    'AB+': number,
    'AB-': number,
    'O+': number,
    'O-': number
  },
  urgent_needs: string[], // Array of blood types in urgent need
  total_community_donations: number,
  donations_this_month: number
}
```

### Upcoming Blood Drives

```javascript
{
  drives: [
    {
      id: number,
      title: string,
      date: string,
      location: string,
      organizer: string,
      contact_info: string,
      slots_available: number
    }
  ]
}
```

## Error Handling

### Error Types and Handling

1. **Network Errors**: Connection failures, timeouts
   - Display retry button with exponential backoff
   - Show offline indicator if applicable
   - Cache last successful data for offline viewing

2. **Authentication Errors**: Token expiry, unauthorized access
   - Automatically attempt token refresh
   - Redirect to login if refresh fails
   - Preserve user's place in dashboard after re-authentication

3. **Data Errors**: Invalid or missing data from API
   - Show partial data with error indicators for failed sections
   - Provide fallback content for missing data
   - Log errors for debugging while showing user-friendly messages

4. **Partial Load Errors**: Some data loads successfully, others fail
   - Display successful data immediately
   - Show loading/error states for failed sections
   - Allow individual section retry

### Error Recovery Strategies

```javascript
const ErrorBoundary = ({ children, fallback, onRetry }) => {
  // Catch and handle component errors
  // Provide retry mechanisms
  // Log errors for monitoring
};

const DashboardError = ({ error, onRetry }) => {
  const getErrorMessage = (error) => {
    if (error.message.includes('network')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (error.message.includes('401')) {
      return 'Your session has expired. Please log in again.';
    }
    return 'Something went wrong loading your dashboard. Please try again.';
  };

  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">{getErrorMessage(error)}</p>
      <button onClick={onRetry} className="bg-red-600 text-white px-4 py-2 rounded">
        Try Again
      </button>
    </div>
  );
};
```

## Data Refresh Strategy

### Automatic Refresh Mechanisms

1. **Initial Load**: Fetch all data when dashboard mounts
2. **Periodic Refresh**: Refresh data every 5 minutes while user is active
3. **Focus Refresh**: Refresh when user returns to tab/window
4. **Action-Based Refresh**: Refresh after user actions that affect data
5. **Manual Refresh**: Allow user to manually refresh data

### Implementation

```javascript
const useDashboardData = () => {
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const refreshIntervalRef = useRef();

  // Set up periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData(true);
      }
    }, 5 * 60 * 1000); // 5 minutes

    refreshIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, []);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      const timeSinceLastRefresh = Date.now() - lastRefresh;
      if (timeSinceLastRefresh > 2 * 60 * 1000) { // 2 minutes
        fetchDashboardData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [lastRefresh]);
};
```

## Testing Strategy

### Unit Tests

1. **Dashboard Data Hook Tests**:
   - Test data fetching and state management
   - Test error handling and retry logic
   - Test refresh mechanisms and timing
   - Mock API responses for different scenarios

2. **Component Tests**:
   - Test rendering with different data states (loading, error, success)
   - Test user interactions (retry buttons, refresh actions)
   - Test skeleton loading states
   - Test error boundary functionality

### Integration Tests

1. **API Integration Tests**:
   - Test dashboard data endpoints with real API
   - Test authentication integration with dashboard data
   - Test error scenarios (network failures, invalid responses)
   - Test data refresh flows

2. **User Flow Tests**:
   - Test complete dashboard loading experience
   - Test error recovery flows
   - Test data refresh after user actions
   - Test offline/online transitions

### Performance Tests

1. **Loading Performance**:
   - Measure initial dashboard load time
   - Test with large datasets (many donations, etc.)
   - Test concurrent API requests
   - Measure memory usage during data refresh

2. **User Experience Tests**:
   - Test perceived performance with skeleton states
   - Test smooth transitions between loading states
   - Test responsiveness during data refresh
   - Test error state accessibility

## Implementation Approach

### Phase 1: API Endpoints and Data Models
- Define backend API endpoints for dashboard data
- Implement data models and validation
- Test API endpoints with sample data
- Document API response formats

### Phase 2: Dashboard Data Hook
- Create `useDashboardData` custom hook
- Implement data fetching and state management
- Add error handling and retry logic
- Test hook with mock data

### Phase 3: UI Components and Loading States
- Create skeleton loading components
- Update dashboard components to use dynamic data
- Implement error boundaries and error states
- Add loading indicators and transitions

### Phase 4: Data Refresh and Optimization
- Implement automatic refresh mechanisms
- Add manual refresh capabilities
- Optimize API calls and caching
- Test refresh scenarios and edge cases

### Phase 5: Error Handling and Polish
- Implement comprehensive error handling
- Add user-friendly error messages
- Test error recovery flows
- Add accessibility improvements and final polish