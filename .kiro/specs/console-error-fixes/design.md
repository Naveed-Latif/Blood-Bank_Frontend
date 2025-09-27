# Design Document

## Overview

This design addresses console errors and navigation issues in the blood donation application. The solution focuses on three main areas: fixing blood type display issues, resolving page navigation problems, and cleaning up console errors through proper error handling and React best practices.

## Architecture

### Error Classification System
- **Critical Errors**: Application-breaking issues that prevent functionality
- **Warning Errors**: Non-breaking issues that should be addressed for code quality
- **Development Errors**: Issues that only appear in development mode
- **Network Errors**: API-related errors that need graceful handling

### Component Error Boundaries
- Maintain existing error boundary structure
- Enhance error reporting for development vs production
- Add specific error boundaries for navigation components

## Components and Interfaces

### 1. Blood Type Data Mapping

**Problem**: Backend returns `blood_type` but frontend expects `bloodType`

**Solution**: 
- Update API client to map `blood_type` to `bloodType` in user data transformation
- Add fallback handling for missing blood type data
- Update display logic to show "Not specified" instead of "Unknown"

```javascript
// API transformation layer
const transformUserData = (backendData) => ({
  ...backendData,
  bloodType: backendData.blood_type || backendData.bloodType,
  // Remove the original field to avoid confusion
  blood_type: undefined
});
```

### 2. Navigation System Fixes

**Problem**: URL changes but page content doesn't update

**Solution**:
- Verify React Router configuration
- Check for component re-rendering issues
- Ensure proper key props for route components
- Add navigation debugging in development mode

**Root Cause Analysis**:
- Potential issue with BrowserRouter basename configuration
- Component memoization preventing re-renders
- Authentication context interfering with routing

### 3. Console Error Cleanup

**Error Categories to Address**:

1. **React Hook Warnings**
   - Missing dependencies in useEffect
   - Conditional hook calls
   - Stale closure issues

2. **Key Prop Warnings**
   - Missing keys in list rendering
   - Non-unique keys in dynamic content

3. **API Error Logging**
   - Reduce verbose error logging in production
   - Add structured error reporting
   - Implement error categorization

## Data Models

### Enhanced User Data Model
```javascript
{
  id: number,
  name: string,
  username: string,
  email: string,
  phone: string,
  bloodType: string, // Mapped from blood_type
  address: string,
  totalDonations: number,
  lastDonation: {
    date: string,
    location: string
  },
  donations: Array<Donation>
}
```

### Error Reporting Model
```javascript
{
  level: 'error' | 'warn' | 'info',
  category: 'api' | 'navigation' | 'component' | 'network',
  message: string,
  context: object,
  timestamp: number,
  userId?: string,
  route?: string
}
```

## Error Handling

### 1. API Error Handling Enhancement
- Implement error categorization (network, auth, validation, server)
- Add retry logic with exponential backoff
- Reduce console noise for expected errors (like 401 during token refresh)
- Add structured logging for debugging

### 2. Navigation Error Handling
- Add route change listeners for debugging
- Implement navigation guards for protected routes
- Add fallback routes for unmatched paths
- Monitor route rendering performance

### 3. Component Error Handling
- Enhance existing error boundaries with better error reporting
- Add component-specific error recovery
- Implement graceful degradation for failed components
- Add development-only error overlays

## Testing Strategy

### 1. Console Error Detection
- Automated tests to capture console errors during test runs
- Integration tests for navigation flows
- API error simulation tests
- Performance tests for route changes

### 2. Blood Type Display Testing
- Unit tests for data transformation functions
- Integration tests for user data display
- Mock API responses with various blood type formats
- Edge case testing for missing data

### 3. Navigation Testing
- Route rendering tests
- Authentication flow tests
- Browser history navigation tests
- Deep linking tests

## Implementation Approach

### Phase 1: Data Mapping Fixes
1. Update API client to transform blood_type to bloodType
2. Update display components to handle missing blood type gracefully
3. Add data validation and transformation utilities

### Phase 2: Navigation System Fixes
1. Debug and fix routing configuration
2. Add navigation monitoring and logging
3. Implement route change debugging tools
4. Fix component re-rendering issues

### Phase 3: Console Error Cleanup
1. Audit and fix React hook dependencies
2. Add proper key props to list components
3. Implement structured error logging
4. Reduce verbose API error logging

### Phase 4: Testing and Validation
1. Add automated console error detection
2. Implement comprehensive navigation tests
3. Add error boundary testing
4. Performance monitoring for route changes

## Development vs Production Behavior

### Development Mode
- Detailed error logging with stack traces
- Navigation debugging information
- Component render tracking
- API request/response logging

### Production Mode
- Minimal error logging
- User-friendly error messages
- Performance-optimized error handling
- Structured error reporting for monitoring