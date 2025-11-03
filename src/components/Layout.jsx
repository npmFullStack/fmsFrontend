// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { useAuth } from '../hooks/useAuth';
import LoadingSkeleton from './ui/LoadingSkeleton';

const Layout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, userQuery } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Fetch user data if not already loaded
    if (!userQuery.data && !userQuery.isLoading) {
      userQuery.refetch();
    }
  }, [isAuthenticated, navigate, userQuery]);

  if (!isAuthenticated() || userQuery.isLoading) {
    return <LoadingSkeleton type="generic" />;
  }

  if (userQuery.isError) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-main text-content">
      {/* Sidebar */}
      <SideBar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavBar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-main p-6">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default Layout;