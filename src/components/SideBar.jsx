import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import logo from '../assets/images/logo.png';

const SideBar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: List, label: 'Categories', path: '/categories' },
  ];

  const linkClass = (path) =>
    `flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
      location.pathname === path
        ? 'bg-slate-700 text-white'
        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${
          isCollapsed ? 'w-20' : 'w-64'
        } flex-col border-r border-slate-700 transition-all duration-300 relative bg-slate-800`}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-800/90 to-indigo-900/30 pointer-events-none"></div>

        {/* Logo + Collapse */}
        <div className="p-4 flex items-center justify-between border-b border-slate-700 relative z-10">
          <div className="flex items-center gap-2">
            <img src={logo} alt="XMFFI Logo" className="w-8 h-8 rounded-lg object-contain" />
            {!isCollapsed && (
              <span className="text-xl font-bold text-white whitespace-nowrap">XMFFI</span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition"
          >
            {isCollapsed ? (
              <ChevronsRight className="w-5 h-5" />
            ) : (
              <ChevronsLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 relative z-10">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link to={item.path} className={linkClass(item.path)}>
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </div>
                  {item.badge && !isCollapsed && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div
          className={`p-4 border-t border-slate-700 text-center text-gray-400 text-sm relative z-10 transition-all duration-300 ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          XMFFI | 2025©
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 shadow-lg flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-800/90 to-indigo-900/30 pointer-events-none"></div>

            {/* Logo */}
            <div className="p-4 flex items-center justify-between border-b border-slate-700 relative z-10">
              <div className="flex items-center gap-3">
                <img src={logo} alt="XMFFI Logo" className="w-8 h-8 rounded-lg object-contain" />
                <span className="text-xl font-semibold text-white">XMFFI</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-700 text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto relative z-10">
              <ul className="space-y-1">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={linkClass(item.path)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 text-center text-gray-400 text-sm relative z-10">
              FMS
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
