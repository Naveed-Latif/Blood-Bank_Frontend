import React from 'react';

/**
 * Accessibility utilities and helpers
 */

/**
 * Generate unique IDs for accessibility
 */
let idCounter = 0;
export const generateId = (prefix = 'id') => {
  return `${prefix}-${++idCounter}`;
};

/**
 * ARIA live region announcer for screen readers
 */
class LiveRegionAnnouncer {
  constructor() {
    this.liveRegion = null;
    this.init();
  }

  init() {
    // Create live region if it doesn't exist
    if (!document.getElementById('live-region')) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.id = 'live-region';
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.style.position = 'absolute';
      this.liveRegion.style.left = '-10000px';
      this.liveRegion.style.width = '1px';
      this.liveRegion.style.height = '1px';
      this.liveRegion.style.overflow = 'hidden';
      document.body.appendChild(this.liveRegion);
    } else {
      this.liveRegion = document.getElementById('live-region');
    }
  }

  announce(message, priority = 'polite') {
    if (!this.liveRegion) this.init();
    
    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }

  announceError(message) {
    this.announce(`Error: ${message}`, 'assertive');
  }

  announceSuccess(message) {
    this.announce(`Success: ${message}`, 'polite');
  }

  announceLoading(message) {
    this.announce(`Loading: ${message}`, 'polite');
  }
}

export const liveAnnouncer = new LiveRegionAnnouncer();

/**
 * Skip link component for keyboard navigation
 */
export const SkipLink = ({ href, children, className = '' }) => {
  return (
    <a
      href={href}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50 ${className}`}
      onFocus={(e) => {
        liveAnnouncer.announce('Skip link focused');
      }}
    >
      {children}
    </a>
  );
};

/**
 * Screen reader only text component
 */
export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
};