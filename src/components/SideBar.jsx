import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, ChevronLeft, ChevronRight, X } from 'lucide-react';

const SideBar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const linkClass = (path) =>
    `flex items-center gap-3 py-2 rounded-md transition-all duration-300 ${
      location.pathname === path
        ? 'bg-sky-400 text-white font-semibold shadow-sm'
        : 'hover:bg-blue-100 text-gray-700'
    } ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'}`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-blue-200 h-screen transition-all duration-300 shadow-sm overflow-hidden ${
          isCollapsed ? 'w-20 px-2' : 'w-64 px-4'
        } py-3`}
      >
        {/* Header with Collapse Button */}
        <div className="flex items-center justify-between mb-6">
          <div
            className={`transition-all duration-300 ${
              isCollapsed
                ? 'opacity-0 translate-x-4 w-0 overflow-hidden'
                : 'opacity-100 translate-x-0'
            }`}
          >
            <h2 className="text-sm text-sky-600 font-bold whitespace-nowrap">Menu</h2>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-blue-100 text-gray-700"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 space-y-1">
          <Link to="/" className={linkClass('/')}>
            <Home className="w-5 h-5 flex-shrink-0" />
            <span
              className={`transition-all duration-300 ${
                isCollapsed
                  ? 'opacity-0 translate-x-3 max-w-0 overflow-hidden'
                  : 'opacity-100 translate-x-0 max-w-xs'
              }`}
            >
              Home
            </span>
          </Link>

          <Link to="/category" className={linkClass('/category')}>
            <List className="w-5 h-5 flex-shrink-0" />
            <span
              className={`transition-all duration-300 ${
                isCollapsed
                  ? 'opacity-0 translate-x-3 max-w-0 overflow-hidden'
                  : 'opacity-100 translate-x-0 max-w-xs'
              }`}
            >
              Category
            </span>
          </Link>
        </nav>

        {/* Footer */}
        <div
          className={`mt-auto text-xs text-gray-500 text-center transition-all duration-300 ${
            isCollapsed ? 'opacity-0 translate-x-3 w-0' : 'opacity-100 translate-x-0'
          }`}
        >
          <p>© 2025 XMFFI</p>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 bg-white border-r border-blue-200 px-4 py-3 shadow-lg animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-sky-600">Menu</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-md hover:bg-blue-100 text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 py-2 px-4 rounded-md transition-colors duration-200 ${
                  location.pathname === '/'
                    ? 'bg-sky-400 text-white font-semibold shadow-sm'
                    : 'hover:bg-blue-100 text-gray-700'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>

              <Link
                to="/category"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 py-2 px-4 rounded-md transition-colors duration-200 ${
                  location.pathname === '/category'
                    ? 'bg-sky-400 text-white font-semibold shadow-sm'
                    : 'hover:bg-blue-100 text-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
                <span>Category</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
