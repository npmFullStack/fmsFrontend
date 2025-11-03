// src/components/SideBar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  List, 
  Container, 
  MapPin,  
  Ship, 
  ClipboardCheck, 
  X, 
  ChevronsLeft, 
  ChevronsRight,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import logo from '../assets/images/logo.png';
import { useAuth } from '../hooks/useAuth';

const SideBar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { userQuery, logoutMutation } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: List, label: 'Category Management', path: '/categories' },
    { icon: Container, label: 'Container Management', path: '/container-types' },
    { icon: MapPin, label: 'Port Management', path: '/ports' },
    { icon: Ship, label: 'Shipping Lines Management', path: '/shipping-line' },
    { icon: ClipboardCheck, label: 'Booking Management', path: '/booking-request' },
  ];

  const linkClass = (path) =>
    `flex items-center px-3 py-2 rounded-lg transition-colors ${
      location.pathname === path
        ? 'bg-blue-600 text-white'
        : 'text-content hover:bg-blue-800 hover:text-white'
    }`;

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsUserMenuOpen(false);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const user = userQuery.data?.user;

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
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-xs font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        {user && !isCollapsed && (
          <div className="border-t border-main p-4 relative z-10">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-surface transition-colors group text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-heading truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <ChevronDown className={`w-3 h-3 text-muted transition-transform flex-shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-main rounded-lg shadow-lg z-20">
                  <div className="p-1">
                    <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-surface transition-colors text-content text-xs">
                      <User className="w-3 h-3" />
                      <span>Profile</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-content text-xs"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapsed User Section */}
        {user && isCollapsed && (
          <div className="border-t border-main p-3 relative z-10">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full p-2 rounded-lg hover:bg-surface transition-colors flex justify-center"
              >
                <User className="w-4 h-4 text-content" />
              </button>

              {/* Collapsed User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute bottom-full left-2 right-2 mb-2 bg-surface border border-main rounded-lg shadow-lg z-20 p-1">
                  <div className="p-2 mb-2 border-b border-main">
                    <p className="text-xs font-medium text-heading truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                  <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-surface transition-colors text-content text-xs mb-1">
                    <User className="w-3 h-3" />
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-content text-xs"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className={`p-4 border-t border-main text-center text-muted text-sm relative z-10 transition-all duration-300 ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <span className="text-xs">XMFFI | 2025©</span>
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
                      <div className="flex items-center gap-3 min-w-0">
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile User Section */}
            {user && (
              <div className="border-t border-main p-4 relative z-10">
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-surface transition-colors"
                  >
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-xs font-medium text-heading truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                    <ChevronDown className={`w-3 h-3 text-muted transition-transform flex-shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Mobile User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-main rounded-lg shadow-lg z-20">
                      <div className="p-1">
                        <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-surface transition-colors text-content text-xs">
                          <User className="w-3 h-3" />
                          <span>Profile</span>
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-content text-xs"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-main text-center text-muted text-sm relative z-10">
              <span className="text-xs">XMFFI | 2025©</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;