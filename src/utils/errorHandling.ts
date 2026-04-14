/**
 * Comprehensive error handling utilities for dashboard data
 */

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTH: 'auth',
  SERVER: 'server',
  CLIENT: 'client',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Categorize error based on error message and status
 */
export const categorizeError = (error) => {
  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.response?.status;

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connect')) {
    return {
      type: ERROR_TYPES.NETWORK,
      severity: ERROR_SEVERITY.HIGH,
      retryable: true,
      userMessage: 'Connection problem. Please check your internet connection.'
    };
  }

  // Authentication errors
  if (status === 401 || status === 403 || message.includes('unauthorized') || message.includes('forbidden')) {
    return {
      type: ERROR_TYPES.AUTH,
      severity: ERROR_SEVERITY.CRITICAL,
      retryable: false,
      userMessage: 'Authentication required. Please log in again.'
    };
  }

  // Server errors
  if (status >= 500 || message.includes('server') || message.includes('internal')) {
    return {
      type: ERROR_TYPES.SERVER,
      severity: ERROR_SEVERITY.HIGH,
      retryable: true,
      userMessage: 'Server temporarily unavailable. We\'ll keep trying.'
    };
  }

  // Client errors
  if (status >= 400 && status < 500) {
    return {
      type: ERROR_TYPES.CLIENT,
      severity: ERROR_SEVERITY.MEDIUM,
      retryable: false,
      userMessage: 'Request failed. Please try again or contact support.'
    };
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('aborted')) {
    return {
      type: ERROR_TYPES.TIMEOUT,
      severity: ERROR_SEVERITY.MEDIUM,
      retryable: true,
      userMessage: 'Request timed out. Please try again.'
    };
  }

  // Unknown errors
  return {
    type: ERROR_TYPES.UNKNOWN,
    severity: ERROR_SEVERITY.MEDIUM,
    retryable: true,
    userMessage: 'Something went wrong. Please try again.'
  };
};

/**
 * Determine if error should be retried based on type and attempt count
 */
export const shouldRetry = (error, attempt, maxRetries) => {
  const categorized = categorizeError(error);
  
  if (!categorized.retryable) {
    return false;
  }
  
  if (attempt >= maxRetries) {
    return false;
  }
  
  // Don't retry auth errors
  if (categorized.type === ERROR_TYPES.AUTH) {
    return false;
  }
  
  return true;
};

/**
 * Calculate retry delay with jitter to prevent thundering herd
 */
export const calculateRetryDelay = (attempt, baseDelay = 1000, maxDelay = 30000) => {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
};

/**
 * Format error message for user display
 */
export const formatErrorMessage = (error, context = '') => {
  const categorized = categorizeError(error);
  const contextPrefix = context ? `${context}: ` : '';
  return `${contextPrefix}${categorized.userMessage}`;
};

/**
 * Check if error is recoverable
 */
export const isRecoverableError = (error) => {
  const categorized = categorizeError(error);
  return categorized.retryable && categorized.severity !== ERROR_SEVERITY.CRITICAL;
};

/**
 * Get error recovery suggestions
 */
export const getRecoverySuggestions = (error) => {
  const categorized = categorizeError(error);
  
  switch (categorized.type) {
    case ERROR_TYPES.NETWORK:
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again'
      ];
    
    case ERROR_TYPES.AUTH:
      return [
        'Log out and log back in',
        'Clear your browser cache',
        'Contact support if the problem persists'
      ];
    
    case ERROR_TYPES.SERVER:
      return [
        'Wait a few minutes and try again',
        'The issue is on our end and we\'re working to fix it',
        'Try refreshing the page'
      ];
    
    case ERROR_TYPES.TIMEOUT:
      return [
        'Check your internet connection speed',
        'Try again with a better connection',
        'Wait a moment before retrying'
      ];
    
    default:
      return [
        'Try refreshing the page',
        'Check your internet connection',
        'Contact support if the problem continues'
      ];
  }
};