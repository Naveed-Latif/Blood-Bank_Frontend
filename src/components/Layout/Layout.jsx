import React from 'react';
import { Navbar } from './Navbar';

// Memoize Layout to prevent unnecessary re-renders
export const Layout = React.memo(({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
});