// src/components/PublicLayout.jsx
import React from 'react';
import PublicNavBar from './PublicNavBar';

const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-main text-content">
      {/* Public Navbar */}
      <PublicNavBar />
      
      {/* Main Content Area */}
      <main className="flex-1 bg-main">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;