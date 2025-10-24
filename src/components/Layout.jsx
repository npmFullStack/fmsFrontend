// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';

const Layout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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