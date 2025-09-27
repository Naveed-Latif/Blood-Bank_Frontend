/**
 * Structured error logging system
 * Provides categorized logging with development vs production modes
 */

import { categorizeError, ERROR_TYPES, ERROR_SEVERITY } from './errorHandling.js';

// Log levels
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug'
};

// Log categories
export const LOG_CATEGORIES = {
  API: 'api',
  NAVIGATION: 'navigation',
  COMPONENT: 'component',
  NETWORK: 'network',
  AUTH: 'auth',
  PERFORMANCE: 'performance'
};

class StructuredLogger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development';
    this.isProduction = import.meta.env.MODE === 'production';
    this.logHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Create a structured log entry
   */
  createLogEntry(level, category, message, context = {}, error = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      category,
      message,
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: localStorage.getItem('userId') || 'anonymous'
      }
    };

    // Add error details if provided
    if (error) {
      const categorizedError = categorizeError(error);
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        type: categorizedError.type,
        severity: categorizedError.severity,
        retryable: categorizedError.retryable
      };
    }

    return logEntry;
  }

  /**
   * Add log entry to history (for debugging)
   */
  addToHistory(logEntry) {
    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Determine if log should be output to console
   */
  shouldLog(level, category, error = null) {
    // In production, be more selective about what we log
    if (this.isProduction) {
      // Always log errors and warnings
      if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN) {
        return true;
      }
      
      // Don't log info/debug in production
      if (level === LOG_LEVELS.INFO || level === LOG_LEVELS.DEBUG) {
        return false;
      }
    }

    // In development, log everything except for expected errors
    if (this.isDevelopment) {
      // Reduce noise from expected auth errors during token refresh
      if (category === LOG_CATEGORIES.AUTH && error) {
        const categorized = categorizeError(error);
        if (categorized.type === ERROR_TYPES.AUTH && level === LOG_LEVELS.ERROR) {
          // Only log auth errors as warnings in development to reduce noise
          return level === LOG_LEVELS.WARN;
        }
      }
      
      // Reduce noise from network errors that are being retried
      if (category === LOG_CATEGORIES.NETWORK && level === LOG_LEVELS.ERROR) {
        const categorized = categorizeError(error);
        if (categorized.retryable) {
          // Log retryable network errors as warnings instead of errors
          return level === LOG_LEVELS.WARN;
        }
      }
      
      return true;
    }

    return true;
  }

  /**
   * Output log to console with appropriate formatting
   */
  outputToConsole(logEntry) {
    const { level, category, message, context, error } = logEntry;
    
    // Create a formatted message
    const categoryPrefix = `[${category.toUpperCase()}]`;
    const formattedMessage = `${categoryPrefix} ${message}`;
    
    // Choose console method based on level
    const consoleMethod = level === LOG_LEVELS.ERROR ? 'error' :
                         level === LOG_LEVELS.WARN ? 'warn' :
                         level === LOG_LEVELS.INFO ? 'info' : 'log';

    if (this.isDevelopment) {
      // In development, provide rich logging with context
      console.group(formattedMessage);
      
      if (error) {
        console[consoleMethod]('Error:', error);
        if (error.stack) {
          console.log('Stack:', error.stack);
        }
      }
      
      if (Object.keys(context).length > 0) {
        console.log('Context:', context);
      }
      
      console.log('Timestamp:', logEntry.timestamp);
      console.groupEnd();
    } else {
      // In production, only log errors and warnings
      if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN) {
        if (error) {
          console[consoleMethod](formattedMessage, error.message);
        } else {
          console[consoleMethod](formattedMessage);
        }
      }
    }
  }

  /**
   * Main logging method
   */
  log(level, category, message, context = {}, error = null) {
    const logEntry = this.createLogEntry(level, category, message, context, error);
    
    // Always add to history for debugging
    this.addToHistory(logEntry);
    
    // Only output to console if appropriate
    if (this.shouldLog(level, category, error)) {
      this.outputToConsole(logEntry);
    }

    // In production, you might want to send critical errors to a logging service
    if (this.isProduction && level === LOG_LEVELS.ERROR) {
      this.sendToLoggingService(logEntry);
    }
  }

  /**
   * Convenience methods for different log levels
   */
  error(category, message, context = {}, error = null) {
    this.log(LOG_LEVELS.ERROR, category, message, context, error);
  }

  warn(category, message, context = {}, error = null) {
    this.log(LOG_LEVELS.WARN, category, message, context, error);
  }

  info(category, message, context = {}) {
    this.log(LOG_LEVELS.INFO, category, message, context);
  }

  debug(category, message, context = {}) {
    this.log(LOG_LEVELS.DEBUG, category, message, context);
  }

  /**
   * API-specific logging methods
   */
  apiRequest(endpoint, method = 'GET', context = {}) {
    this.debug(LOG_CATEGORIES.API, `API Request: ${method} ${endpoint}`, context);
  }

  apiResponse(endpoint, method = 'GET', status, context = {}) {
    const message = `API Response: ${method} ${endpoint} - ${status}`;
    if (status >= 400) {
      this.warn(LOG_CATEGORIES.API, message, context);
    } else {
      this.debug(LOG_CATEGORIES.API, message, context);
    }
  }

  apiError(endpoint, method = 'GET', error, context = {}) {
    const categorized = categorizeError(error);
    const message = `API Error: ${method} ${endpoint}`;
    
    // Check if this is an expected error based on context
    const isExpected = context.expected === true;
    
    // Use appropriate log level based on error type and expectation
    if (isExpected || (categorized.type === ERROR_TYPES.AUTH && categorized.severity !== ERROR_SEVERITY.CRITICAL)) {
      // Expected errors or non-critical auth errors are logged as warnings
      this.warn(LOG_CATEGORIES.API, message, { ...context, endpoint, method }, error);
    } else if (categorized.retryable) {
      // Retryable errors are less critical
      this.warn(LOG_CATEGORIES.API, message, { ...context, endpoint, method }, error);
    } else {
      // Non-retryable errors are more serious
      this.error(LOG_CATEGORIES.API, message, { ...context, endpoint, method }, error);
    }
  }

  /**
   * Navigation-specific logging
   */
  navigationEvent(type, path, context = {}) {
    this.debug(LOG_CATEGORIES.NAVIGATION, `Navigation: ${type} to ${path}`, context);
  }

  navigationError(error, context = {}) {
    this.error(LOG_CATEGORIES.NAVIGATION, 'Navigation failed', context, error);
  }

  /**
   * Component-specific logging
   */
  componentError(componentName, error, context = {}) {
    this.error(LOG_CATEGORIES.COMPONENT, `Component error in ${componentName}`, context, error);
  }

  componentWarning(componentName, message, context = {}) {
    this.warn(LOG_CATEGORIES.COMPONENT, `${componentName}: ${message}`, context);
  }

  /**
   * Get recent log history for debugging
   */
  getLogHistory(category = null, level = null) {
    let filtered = this.logHistory;
    
    if (category) {
      filtered = filtered.filter(entry => entry.category === category);
    }
    
    if (level) {
      filtered = filtered.filter(entry => entry.level === level);
    }
    
    return filtered;
  }

  /**
   * Clear log history
   */
  clearHistory() {
    this.logHistory = [];
  }

  /**
   * Send critical errors to logging service (placeholder)
   */
  sendToLoggingService(logEntry) {
    // In a real application, you would send this to a service like Sentry, LogRocket, etc.
    // For production, implement actual logging service integration
    if (this.isDevelopment) {
      console.log('Would send to logging service:', logEntry);
    }
    // Production: Send to actual logging service
    // Example: Sentry.captureException(logEntry.error);
  }
}

// Create singleton instance
export const logger = new StructuredLogger();

// Export convenience functions
export const logApiRequest = (endpoint, method, context) => 
  logger.apiRequest(endpoint, method, context);

export const logApiResponse = (endpoint, method, status, context) => 
  logger.apiResponse(endpoint, method, status, context);

export const logApiError = (endpoint, method, error, context) => 
  logger.apiError(endpoint, method, error, context);

export const logNavigationEvent = (type, path, context) => 
  logger.navigationEvent(type, path, context);

export const logNavigationError = (error, context) => 
  logger.navigationError(error, context);

export const logComponentError = (componentName, error, context) => 
  logger.componentError(componentName, error, context);

export const logComponentWarning = (componentName, message, context) => 
  logger.componentWarning(componentName, message, context);