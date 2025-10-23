// src/components/SideBar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, Container, MapPin, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import logo from '../assets/images/logo.png';

const SideBar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: List, label: 'Categories', path: '/categories' },
    { icon: Container, label: 'Container Types', path: '/container-types' },
    { icon: MapPin, label: 'Ports', path: '/ports' },
  ];

  const linkClass = (path) =>
    `flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
      location.pathname === path
        ? 'bg-blue-600 text-white'
        : 'text-content hover:bg-blue-800 hover:text-white'
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${
          isCollapsed ? 'w-20' : 'w-64'
        } flex-col border-r border-main transition-all duration-300 relative bg-surface`}
      >
        {/* Logo + Collapse */}
        <div className="p-4 flex items-center justify-between border-b border-main relative z-10">
          <div className="flex items-center gap-2">
            <img src={logo} alt="XMFFI Logo" className="w-8 h-8 rounded-lg object-contain" />
            {!isCollapsed && (
              <span className="text-xl font-bold text-heading whitespace-nowrap">XMFFI</span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted hover:text-content transition-colors p-1 rounded hover-surface"
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
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
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
          className={`p-4 border-t border-main text-center text-muted text-sm relative z-10 transition-all duration-300 ${
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
            className="absolute left-0 top-0 h-full w-64 bg-surface border-r border-main shadow-lg flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo */}
            <div className="p-4 flex items-center justify-between border-b border-main relative z-10">
              <div className="flex items-center gap-3">
                <img src={logo} alt="XMFFI Logo" className="w-8 h-8 rounded-lg object-contain" />
                <span className="text-xl font-semibold text-heading">XMFFI</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg hover-surface text-content transition-colors"
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
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-main text-center text-muted text-sm relative z-10">
              XMFFI | 2025©
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;