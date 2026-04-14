/**
 * Debounce function that delays execution until after wait milliseconds
 * have elapsed since the last time it was invoked
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  let result;

  const debounced = function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) result = func.apply(this, args);
    };

    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) result = func.apply(this, args);
    
    return result;
  };

  // Add cancel method
  debounced.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
  };

  // Add flush method
  debounced.flush = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      return func.apply(this, arguments);
    }
  };

  return debounced;
};

/**
 * Throttle function that limits execution to once per wait milliseconds
 * @param {Function} func - Function to throttle
 * @param {number} wait - Delay in milliseconds
 * @param {object} options - Options object
 * @returns {Function} Throttled function
 */
export const throttle = (func, wait, options = {}) => {
  let timeout;
  let previous = 0;
  const { leading = true, trailing = true } = options;

  const throttled = function executedFunction(...args) {
    const now = Date.now();
    
    if (!previous && !leading) previous = now;
    
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      return func.apply(this, args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = !leading ? 0 : Date.now();
        timeout = null;
        return func.apply(this, args);
      }, remaining);
    }
  };

  // Add cancel method
  throttled.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
    previous = 0;
  };

  return throttled;
};

/**
 * Create a debounced version of an async function
 * @param {Function} asyncFunc - Async function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced async function
 */
export const debounceAsync = (asyncFunc, wait) => {
  let timeout;
  let resolveList = [];
  let rejectList = [];

  return function debouncedAsyncFunction(...args) {
    return new Promise((resolve, reject) => {
      resolveList.push(resolve);
      rejectList.push(reject);

      clearTimeout(timeout);

      timeout = setTimeout(async () => {
        const currentResolveList = [...resolveList];
        const currentRejectList = [...rejectList];
        
        resolveList = [];
        rejectList = [];

        try {
          const result = await asyncFunc.apply(this, args);
          currentResolveList.forEach(resolve => resolve(result));
        } catch (error) {
          currentRejectList.forEach(reject => reject(error));
        }
      }, wait);
    });
  };
};

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for debounced values
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for debounced callbacks
 * @param {Function} callback - Callback to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array
 * @returns {Function} Debounced callback
 */
export const useDebouncedCallback = (callback, delay, deps = []) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create debounced function
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};