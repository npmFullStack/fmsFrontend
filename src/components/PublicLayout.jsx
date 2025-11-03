// src/components/PublicLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import PublicNavBar from './PublicNavBar';
import { useAuth } from '../hooks/useAuth';

const PublicLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userQuery } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated() && userQuery.data) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, userQuery.data, navigate]);

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