import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';

const Layout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar */}
      <SideBar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavBar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="p-4 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
