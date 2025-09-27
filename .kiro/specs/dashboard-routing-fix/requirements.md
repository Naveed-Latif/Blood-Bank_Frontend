# Requirements Document

## Introduction

Users are experiencing a routing issue where after approximately 1 minute on the dashboard, they receive an error message: "The server is configured with a public base URL of /Blood-Bank_Frontend - did you mean to visit /Blood-Bank_Frontend/login instead?" This appears to be a combination of session timeout handling and base URL routing configuration that needs to be fixed to provide a seamless user experience.

## Requirements

### Requirement 1

**User Story:** As a user on the dashboard, I want to remain on the dashboard without unexpected redirects, so that I can continue using the application without interruption.

#### Acceptance Criteria

1. WHEN a user is on the dashboard for more than 1 minute THEN the system SHALL maintain the user's session without unexpected redirects
2. WHEN the access token expires THEN the system SHALL attempt to refresh the token silently in the background
3. WHEN token refresh is successful THEN the system SHALL keep the user on the current page without any redirect
4. WHEN the user manually refreshes the browser page THEN the system SHALL maintain their authenticated state and keep them on the dashboard

### Requirement 2

**User Story:** As a user, I want proper error handling when authentication fails, so that I'm redirected to the correct login page with the proper base URL.

#### Acceptance Criteria

1. WHEN token refresh fails due to expired refresh token THEN the system SHALL redirect to the correct login URL with base path
2. WHEN authentication fails THEN the system SHALL use the correct base URL format: `/Blood-Bank_Frontend/login`
3. WHEN redirecting to login THEN the system SHALL clear all authentication state properly
4. WHEN redirecting to login THEN the system SHALL display an appropriate message about session expiration

### Requirement 3

**User Story:** As a user, I want consistent URL handling across the application, so that all routes work correctly with the configured base path.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL use the correct base path from environment configuration
2. WHEN navigating between routes THEN the system SHALL maintain the correct base path in all URLs
3. WHEN the server returns routing errors THEN the system SHALL handle them gracefully without showing raw server messages
4. WHEN authentication redirects occur THEN the system SHALL use React Router navigation instead of window.location changes where possible

### Requirement 4

**User Story:** As a developer, I want proper coordination between the API client and React Router, so that routing and authentication work together seamlessly.

#### Acceptance Criteria

1. WHEN authentication failures occur THEN the system SHALL use React Router's navigation methods for redirects
2. WHEN the API client needs to redirect THEN the system SHALL coordinate with the AuthContext to handle routing properly
3. WHEN authentication state changes THEN the system SHALL update the routing state accordingly
4. WHEN handling authentication errors THEN the system SHALL prevent multiple simultaneous redirects