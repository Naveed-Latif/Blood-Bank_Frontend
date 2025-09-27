import React from 'react';
import { Navbar } from './Navbar';

// Layout component - removed memo to ensure re-renders on route changes
export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};