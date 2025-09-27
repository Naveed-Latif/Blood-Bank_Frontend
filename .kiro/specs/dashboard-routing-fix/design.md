# Design Document

## Overview

The dashboard routing issue occurs due to a combination of factors:

1. **Improper redirect handling**: The API client uses `window.location.href` for redirects instead of React Router navigation
2. **Base path inconsistency**: The redirect URL construction doesn't properly handle the base path configuration
3. **Authentication timing**: The 1-minute timeout suggests the access token expires and the refresh mechanism triggers an improper redirect
4. **Server error handling**: The error message indicates the server is rejecting requests and suggesting a redirect, but the client isn't handling this gracefully

## Architecture

The solution involves coordinating three main components:

1. **Enhanced API Client**: Improve redirect handling to work with React Router and base path configuration
2. **AuthContext Integration**: Better coordination between authentication state and routing
3. **Router Configuration**: Ensure consistent base path handling across the application

## Components and Interfaces

### API Client Routing Improvements

The `ApiClient` class needs modifications to:

- **Use React Router Navigation**: Replace `window.location.href` redirects with React Router navigation
- **Proper Base Path Handling**: Construct redirect URLs correctly using the configured base path
- **Coordinate with AuthContext**: Let AuthContext handle routing decisions instead of direct redirects
- **Graceful Error Handling**: Handle server routing errors without exposing raw error messages

Key changes needed:
- Remove direct `window.location.href` usage in `handleRefreshFailure()`
- Add navigation callback mechanism to coordinate with React Router
- Improve base path URL construction
- Add proper error message handling for routing errors

### AuthContext Routing Integration

The `AuthContext` needs enhancements to:

- **Handle Navigation**: Take responsibility for authentication-related navigation
- **Coordinate with API Client**: Receive notifications from API client about auth failures
- **Manage Routing State**: Track current route and handle redirects appropriately
- **Prevent Redirect Loops**: Ensure authentication redirects don't cause infinite loops

New functionality:
- `handleAuthFailure()` method to manage authentication failure navigation
- Integration with React Router's `useNavigate` hook
- Proper cleanup of authentication state before navigation
- Route protection logic that works with the base path

### Router Configuration Consistency

Ensure consistent base path handling:

- **Environment Configuration**: Use the same base path across all components
- **Route Definitions**: Ensure all routes work correctly with the base path
- **Navigation Methods**: Use React Router navigation consistently
- **Error Boundaries**: Handle routing errors gracefully

## Data Models

### Navigation Context

```javascript
{
  navigate: Function,        // React Router navigate function
  currentPath: string,       // Current route path
  basePath: string,         // Configured base path
  isNavigating: boolean     // Navigation in progress flag
}
```

### Enhanced Auth State

```javascript
{
  user: User | null,
  loading: boolean,
  refreshing: boolean,
  error: string | null,
  lastRoute: string,        // Track last valid route
  redirectPending: boolean  // Prevent multiple redirects
}
```

## Error Handling

### Authentication Failure Flow

1. **Token Expires**: API request receives 401 response
2. **Refresh Attempt**: API client attempts token refresh
3. **Refresh Fails**: Refresh token is invalid/expired
4. **Notify AuthContext**: API client notifies AuthContext of failure
5. **Clean State**: AuthContext clears authentication state
6. **Navigate to Login**: AuthContext uses React Router to navigate to login
7. **Show Message**: Display appropriate session expiration message

### Base Path URL Construction

```javascript
// Correct base path handling
const basePath = import.meta.env.VITE_BASE_PATH || '/Blood-Bank_Frontend';
const loginUrl = `${basePath}/login`;

// Use React Router navigation instead of window.location
navigate('/login', { replace: true });
```

### Server Error Handling

When the server returns routing-related errors:

1. **Parse Error Message**: Extract useful information from server errors
2. **Translate to User-Friendly**: Convert technical errors to user-friendly messages
3. **Handle Gracefully**: Don't expose raw server error messages to users
4. **Provide Fallback**: Always provide a way for users to recover

## Testing Strategy

### Unit Tests

1. **API Client Navigation Tests**:
   - Test that authentication failures trigger proper callbacks instead of direct redirects
   - Test base path URL construction
   - Test coordination with AuthContext for navigation

2. **AuthContext Navigation Tests**:
   - Test authentication failure handling with navigation
   - Test route protection with base path
   - Test prevention of redirect loops

### Integration Tests

1. **Authentication Flow Tests**:
   - Test complete flow from dashboard -> token expiry -> login redirect
   - Test browser refresh on protected routes
   - Test navigation after successful authentication

2. **Base Path Tests**:
   - Test all routes work correctly with configured base path
   - Test navigation between routes maintains base path
   - Test authentication redirects use correct base path

### Error Scenario Tests

1. **Server Error Tests**:
   - Test handling of server routing error messages
   - Test graceful fallback when server suggests redirects
   - Test user experience during server errors

2. **Navigation Error Tests**:
   - Test prevention of multiple simultaneous redirects
   - Test handling of invalid routes
   - Test recovery from navigation errors

## Implementation Approach

### Phase 1: Fix API Client Redirect Handling
- Remove direct `window.location.href` usage from API client
- Add callback mechanism for authentication failures
- Improve base path URL construction
- Add proper error message handling

### Phase 2: Enhance AuthContext Navigation
- Add React Router navigation integration to AuthContext
- Implement `handleAuthFailure()` method for coordinated navigation
- Add route tracking and redirect prevention logic
- Integrate with API client callback mechanism

### Phase 3: Improve Router Configuration
- Ensure consistent base path usage across components
- Add error boundaries for routing errors
- Implement proper route protection logic
- Add user-friendly error messages for routing issues

### Phase 4: Testing and Validation
- Test authentication flow with proper navigation
- Validate base path handling across all routes
- Test error scenarios and recovery mechanisms
- Ensure no more raw server error messages are shown to users