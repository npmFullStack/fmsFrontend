import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, ChevronLeft, ChevronRight, X } from 'lucide-react';

const SideBar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const linkClass = (path) =>
    `flex items-center gap-3 py-2 px-4 rounded-md hover:bg-base-300 transition ${
      location.pathname === path ? 'bg-base-300 font-semibold' : ''
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col bg-base-200 h-screen p-4 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && <h2 className="text-lg font-bold">Menu</h2>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="btn btn-ghost btn-sm"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        <ul className="menu flex-1 space-y-1">
          <li>
            <Link to="/" className={linkClass('/')}>
              <Home className="w-5 h-5" />
              {!isCollapsed && <span>Home</span>}
            </Link>
          </li>
          <li>
            <Link to="/CategoryList" className={linkClass('/CategoryList')}>
              <List className="w-5 h-5" />
              {!isCollapsed && <span>Category List</span>}
            </Link>
          </li>
        </ul>

        <div className="mt-auto text-sm opacity-70 text-center">
          {!isCollapsed && <p>© 2025 XMFFI</p>}
        </div>
      </div>

      {/* Mobile Overlay Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setIsMobileOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-64 bg-base-200 p-4 shadow-lg animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Menu</h2>
              <button onClick={() => setIsMobileOpen(false)} className="btn btn-ghost btn-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ul className="menu space-y-1">
              <li>
                <Link to="/" onClick={() => setIsMobileOpen(false)} className={linkClass('/')}>
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/CategoryList" onClick={() => setIsMobileOpen(false)} className={linkClass('/CategoryList')}>
                  <List className="w-5 h-5" />
                  <span>Category List</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
