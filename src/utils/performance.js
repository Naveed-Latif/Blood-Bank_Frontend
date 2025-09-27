/**
 * Performance monitoring and optimization utilities
 */

/**
 * Performance metrics collector
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.init();
  }

  init() {
    // Initialize performance observers if supported
    if ('PerformanceObserver' in window) {
      this.initPerformanceObservers();
    }
  }

  initPerformanceObservers() {
    // Observe navigation timing
    try {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            this.recordMetric('navigation', {
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              loadComplete: entry.loadEventEnd - entry.loadEventStart,
              firstPaint: entry.responseEnd - entry.requestStart,
              domInteractive: entry.domInteractive - entry.navigationStart
            });
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    } catch (e) {
      console.warn('Navigation timing observer not supported');
    }

    // Observe paint timing
    try {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordMetric('paint', {
            [entry.name]: entry.startTime
          });
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (e) {
      console.warn('Paint timing observer not supported');
    }

    // Observe largest contentful paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', {
          value: lastEntry.startTime,
          element: lastEntry.element?.tagName || 'unknown'
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }
  }

  recordMetric(name, value) {
    const timestamp = Date.now();
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push({ value, timestamp });
  }

  getMetrics() {
    const result = {};
    this.metrics.forEach((values, name) => {
      result[name] = values;
    });
    return result;
  }

  getLatestMetric(name) {
    const values = this.metrics.get(name);
    return values ? values[values.length - 1] : null;
  }

  clearMetrics() {
    this.metrics.clear();
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.clearMetrics();
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure function execution time
 */
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      performanceMonitor.recordMetric(`function:${name}`, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      performanceMonitor.recordMetric(`function:${name}:error`, end - start);
      throw error;
    }
  };
};

import React, { useEffect, useRef } from 'react';

/**
 * React component performance wrapper
 */
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return React.forwardRef((props, ref) => {
    const renderStart = useRef();
    const mountTime = useRef();

    useEffect(() => {
      mountTime.current = performance.now();
      return () => {
        if (mountTime.current) {
          const unmountTime = performance.now();
          performanceMonitor.recordMetric(`component:${componentName}:lifetime`, 
            unmountTime - mountTime.current);
        }
      };
    }, []);

    useEffect(() => {
      if (renderStart.current) {
        const renderEnd = performance.now();
        performanceMonitor.recordMetric(`component:${componentName}:render`, 
          renderEnd - renderStart.current);
      }
    });

    renderStart.current = performance.now();

    return <WrappedComponent {...props} ref={ref} />;
  });
};

/**
 * Bundle size analyzer
 */
export const analyzeBundleSize = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') && !resource.name.includes('node_modules')
    );
    
    const totalSize = jsResources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);

    return {
      totalJSSize: totalSize,
      resources: jsResources.map(resource => ({
        name: resource.name,
        size: resource.transferSize,
        loadTime: resource.responseEnd - resource.requestStart
      }))
    };
  }
  return null;
};

/**
 * Memory usage monitoring
 */
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    };
  }
  return null;
};

/**
 * FPS monitoring
 */
export class FPSMonitor {
  constructor() {
    this.fps = 0;
    this.frames = 0;
    this.lastTime = performance.now();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  stop() {
    this.isRunning = false;
  }

  tick() {
    if (!this.isRunning) return;

    const now = performance.now();
    this.frames++;

    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
      this.frames = 0;
      this.lastTime = now;
      performanceMonitor.recordMetric('fps', this.fps);
    }

    requestAnimationFrame(() => this.tick());
  }

  getFPS() {
    return this.fps;
  }
}

/**
 * Performance budget checker
 */
export const checkPerformanceBudget = () => {
  const budgets = {
    lcp: 2500, // 2.5 seconds
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    ttfb: 600, // 600ms
    fcp: 1800  // 1.8 seconds
  };

  const results = {};
  const metrics = performanceMonitor.getMetrics();

  // Check LCP
  const lcp = performanceMonitor.getLatestMetric('lcp');
  if (lcp) {
    results.lcp = {
      value: lcp.value,
      budget: budgets.lcp,
      passed: lcp.value <= budgets.lcp
    };
  }

  // Check paint metrics
  const paint = performanceMonitor.getLatestMetric('paint');
  if (paint && paint.value['first-contentful-paint']) {
    results.fcp = {
      value: paint.value['first-contentful-paint'],
      budget: budgets.fcp,
      passed: paint.value['first-contentful-paint'] <= budgets.fcp
    };
  }

  return results;
};

/**
 * Performance report generator
 */
export const generatePerformanceReport = () => {
  const metrics = performanceMonitor.getMetrics();
  const memoryUsage = getMemoryUsage();
  const bundleSize = analyzeBundleSize();
  const budgetCheck = checkPerformanceBudget();

  return {
    timestamp: Date.now(),
    metrics,
    memoryUsage,
    bundleSize,
    budgetCheck,
    userAgent: navigator.userAgent,
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : null
  };
};