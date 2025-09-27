# Implementation Plan

- [x] 1. Remove direct window.location redirects from API Client





  - Replace window.location.href usage in handleRefreshFailure() method with callback mechanism
  - Add navigation callback property to ApiClient class for coordinated routing
  - Update handleRefreshFailure() to use callback instead of direct redirect
  - _Requirements: 4.1, 4.2_

- [x] 2. Fix base path URL construction in API Client








  - Update base path URL construction to use proper path joining
  - Remove hardcoded base path references and use environment configuration consistently
  - Fix the redirect URL construction to properly handle the VITE_BASE_PATH
  - _Requirements: 2.2, 3.1, 3.2_

- [x] 3. Add navigation integration to AuthContext





  - Import and use React Router's useNavigate hook in AuthContext
  - Create handleAuthFailure() method to manage authentication failure navigation
  - Add navigation state tracking to prevent multiple simultaneous redirects
  - _Requirements: 4.1, 4.3, 4.4_

- [x] 4. Implement API Client and AuthContext coordination





  - Add setNavigationCallback() method to ApiClient for AuthContext integration
  - Update AuthContext to register its navigation handler with ApiClient
  - Ensure proper cleanup of authentication state before navigation occurs
  - _Requirements: 4.2, 4.3, 2.3_

- [x] 5. Enhance error handling for server routing errors





  - Add proper parsing of server error messages in API Client request() method
  - Implement user-friendly error message translation for routing errors
  - Add graceful fallback handling when server suggests redirects
  - _Requirements: 2.4, 3.3_

- [x] 6. Add route protection improvements





  - Update ProtectedRoute component to work properly with base path configuration
  - Add proper handling of authentication state during route transitions
  - Implement prevention of redirect loops in route protection logic
  - _Requirements: 3.2, 3.4, 4.4_

- [x] 7. Test and validate the routing fix






  - Test dashboard usage for extended periods without unexpected redirects
  - Test browser refresh on protected routes maintains authentication
  - Test authentication failure redirects use correct base path URLs
  - Validate that no raw server error messages are shown to users
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 3.3_

- [x] 8. Add diagnostic logging and debugging tools



  - Add enhanced logging to track session expiration timing
  - Create debugging utility to monitor token refresh cycles
  - Add network request monitoring for authentication endpoints
  - Implement session state tracking to identify when/why sessions expire
  - _Requirements: 1.1, 2.1, 4.1_

- [x] 9. Fix page visibility and focus-related session issues




  - Add proper handling of token refresh during page visibility changes
  - Implement session validation when page regains focus
  - Add protection against session timeouts during background execution
  - Ensure token refresh works properly when tab is hidden or blurred
  - _Requirements: 1.1, 1.4, 4.1_

- [x] 10. Fix server-side refresh token expiration timing
  - Adjust proactive refresh timing to account for server-side refresh token expiration
  - Increase periodic validation frequency to catch expiration earlier
  - Add specific handling for refresh token expiration (401 on /refresh endpoint)
  - Provide user-friendly error messages for session expiration scenarios
  - _Requirements: 1.1, 2.1, 2.4, 4.1_

- [x] 11. Improve refresh coordination and prevent multiple simultaneous attempts
  - Add coordination between AuthContext and API client refresh states
  - Implement rate limiting for validation requests to prevent spam
  - Add deference logic when API client is already handling refresh
  - Prevent multiple simultaneous refresh attempts from different sources
  - _Requirements: 4.1, 4.2, 4.3_