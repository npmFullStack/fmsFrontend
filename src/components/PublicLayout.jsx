// src/components/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavBar from './PublicNavBar';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-main text-content">
      {/* Public Navbar */}
      <PublicNavBar />
      
      {/* Main Content Area */}
      <main className="flex-1 bg-main">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;