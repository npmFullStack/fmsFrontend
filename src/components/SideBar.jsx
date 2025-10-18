import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, ChevronLeft, ChevronRight, X } from 'lucide-react';

const SideBar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const linkClass = (path) =>
    `flex items-center gap-3 py-2 rounded-md hover:bg-base-300 transition-colors duration-200 ${
      location.pathname === path ? 'bg-base-300 font-semibold' : ''
    } ${isCollapsed ? 'justify-center px-1' : 'justify-start px-3'}`;

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col bg-base-100 h-screen transition-all duration-300 shadow-xl shadow-base-400 overflow-hidden 
        ${isCollapsed ? 'w-20 px-2' : 'w-64 px-4'} py-3`}
      >
        <div className="flex items-center justify-between mb-6">
          <div
            className={`transition-all duration-300 ${
              isCollapsed
                ? 'opacity-0 translate-x-4 w-0 overflow-hidden'
                : 'opacity-100 translate-x-0'
            }`}
          >
            <h2 className="text-sm font-bold whitespace-nowrap">Menu</h2>
          </div>
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
              <Home className="w-5 h-5 flex-shrink-0" />
              <span
                className={`transition-all duration-300 inline-block whitespace-nowrap ${
                  isCollapsed
                    ? 'opacity-0 translate-x-3 max-w-0 overflow-hidden'
                    : 'opacity-100 translate-x-0 max-w-xs'
                }`}
              >
                Home
              </span>
            </Link>
          </li>

          <li>
            <Link to="/Category" className={linkClass('/Category')}>
              <List className="w-5 h-5 flex-shrink-0" />
              <span
                className={`transition-all duration-300 inline-block whitespace-nowrap ${
                  isCollapsed
                    ? 'opacity-0 translate-x-3 max-w-0 overflow-hidden'
                    : 'opacity-100 translate-x-0 max-w-xs'
                }`}
              >
                Category
              </span>
            </Link>
          </li>
        </ul>

        <div
          className={`mt-auto text-xs opacity-70 text-center whitespace-nowrap transition-all duration-300 ${
            isCollapsed
              ? 'opacity-0 translate-x-3 w-0 overflow-hidden'
              : 'opacity-100 translate-x-0'
          }`}
        >
          <p>© 2025 XMFFI</p>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 bg-base-200 px-4 py-3 shadow-lg animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold">Menu</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ul className="menu space-y-1 animate-slideIn">
              <li>
                <Link
                  to="/"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 py-2 px-4 rounded-md hover:bg-base-300 transition-all duration-300"
                >
                  <Home className="w-5 h-5" />
                  <span className="whitespace-nowrap">Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/Category"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 py-2 px-4 rounded-md hover:bg-base-300 transition-all duration-300"
                >
                  <List className="w-5 h-5" />
                  <span className="whitespace-nowrap">Category</span>
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
