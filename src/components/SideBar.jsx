// src/components/SideBar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  List, 
  Container, 
  MapPin,
  Truck,
  Ship, 
  ClipboardCheck,
  Clipboard,
  X, 
  ChevronsLeft, 
  ChevronsRight,
  User,
  LogOut,
  ChevronDown,
  Users,
  Monitor,
  BarChart3,
  FileText,
  Receipt,
  CreditCard
} from 'lucide-react';
import logo from '../assets/images/logo.png';
import { useAuth } from '../hooks/useAuth';

const SideBar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { userQuery, logoutMutation } = useAuth();

  const user = userQuery.data?.user;
  const userRole = user?.role;

  // Professional menu labels with icons
  const menuItems = {
    dashboard: { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    userManagement: { icon: Users, label: 'User Management', path: '/users' },
    category: { icon: List, label: 'Category Management', path: '/categories' },
    container: { icon: Container, label: 'Container Types', path: '/container-types' },
    ports: { icon: MapPin, label: 'Port Management', path: '/ports' },
    trucking: { icon: Truck, label: 'Trucking Partners', path: '/truck-comp' },
    shipping: { icon: Ship, label: 'Shipping Partners', path: '/shipping-line' },
    booking: { icon: FileText, label: 'Booking Management', path: '/booking' },
    quoteRequest: { icon: ClipboardCheck, label: 'Quote Requests', path: '/quote-request' },
    bookingRequest: { icon: ClipboardCheck, label: 'Booking Requests', path: '/booking-request' },
    cargoMonitoring: { icon: Monitor, label: 'Cargo Monitoring', path: '/cargo-monitoring' },
    profile: { icon: User, label: 'User Profile', path: '/profile' },
    accountsPayable: { icon: Receipt, label: 'Accounts Payable', path: '/accounts-payable' },
    payCharges: { icon: CreditCard, label: 'Pay Charges', path: '/pay-charges' },
    accountsReceivable: { icon: Receipt, label: 'Accounts Receivable', path: '/accounts-receivable' },
    customerBookings: { icon: Clipboard, label: 'Manage Bookings', path: '/customer-bookings' },
    paymentTransaction: { icon: CreditCard, label: 'Payment Transaction', path:
'/payment-transaction' },
    managePayments: { icon: Receipt, label: 'Manage Payments', path:
    '/manage-payments' },
  };

  // Role-based menu configuration
  const getMenuSections = () => {
    // Customer menu sections
    const customerSections = [
      {
        label: 'MAIN',
        items: [
          menuItems.dashboard,
          menuItems.customerBookings,
          menuItems.paymentTransaction,
        ]
      },
      {
        label: 'ACCOUNT',
        items: [
          menuItems.profile,
        ]
      }
    ];

    // General Manager sections
    const generalManagerSections = [
      {
        label: 'MAIN',
        items: [
          menuItems.dashboard,
          menuItems.quoteRequest,
          menuItems.bookingRequest,
          menuItems.userManagement,
          menuItems.payCharges,
          menuItems.managePayments,
        ]
      },
      {
        label: 'ACCOUNT',
        items: [
          menuItems.profile,
        ]
      }
    ];

    // Admin sections
    const adminSections = [
      {
        label: 'MAIN',
        items: [
          menuItems.dashboard,
        ]
      },
      {
        label: 'MANAGEMENT',
        items: [
          menuItems.category,
          menuItems.container,
          menuItems.ports,
          menuItems.trucking,
          menuItems.shipping,
          menuItems.booking,
          menuItems.cargoMonitoring,
          menuItems.accountsPayable,
          menuItems.accountsReceivable,
        ]
      },
      {
        label: 'ACCOUNT',
        items: [
          menuItems.profile,
        ]
      }
    ];

    // Return appropriate sections based on user role
    switch (userRole) {
      case 'customer': 
        return customerSections;
      case 'general_manager':
        return generalManagerSections;
      case 'admin':
        return adminSections;
      default:
        return customerSections; 
    }
  };

  const menuSections = getMenuSections();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-blue-600 text-white'
        : 'text-content hover:bg-blue-800 hover:text-white'
    }`;

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsUserMenuOpen(false);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${
          isCollapsed ? 'w-20' : 'w-64'
        } flex-col border-r border-main transition-all duration-300 relative bg-surface`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-main relative z-10">
          <div className="flex items-center gap-2">
            <img src={logo} alt="XMFFI Logo" className="w-8 h-8 rounded-lg object-contain" />
            {!isCollapsed && (
              <span className="text-xl font-bold text-heading whitespace-nowrap">XMFFI</span>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-muted hover:text-content transition-colors p-1 rounded hover-surface"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button */}
        {isCollapsed && (
          <div className="p-3 border-b border-main">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex justify-center text-muted hover:text-content transition-colors p-1 rounded hover-surface"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 relative z-10">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.label}
                  </span>
                </div>
              )}
              {isCollapsed && sectionIndex > 0 && (
                <div className="my-3 border-t border-main"></div>
              )}
              <ul className="space-y-1">
                {section.items.map((item, index) => (
                  <li key={index}>
                    <Link to={item.path} className={linkClass(item.path)}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm font-medium truncate" title={item.label}>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Section */}
        {user && !isCollapsed && (
          <div className="border-t border-main p-2 relative z-10">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 w-full p-2 rounded-lg
                bg-surface border border-main hover:border-primary
                transition-colors text-left"
              >
                <div className="w-9 h-9 bg-blue-600 flex items-center justify-center rounded-full text-white">
                  <User className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading truncate leading-4" title={`${user.first_name} ${user.last_name}`}>
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-muted truncate leading-4" title={user.email}>
                    {user.email}
                  </p>
                  <p className="text-xs text-muted capitalize">{user.role?.replace('_', ' ')}</p>
                </div>

                <ChevronDown className={`w-4 h-4 text-muted transition-transform flex-shrink-0 ml-2 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-main rounded-lg shadow-lg z-20">
                  <div className="p-1">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-content text-sm"
                    >
                      <LogOut className="w-4 h-4" />
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
                <User className="w-5 h-5 text-content" />
              </button>

              {/* Collapsed Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute bottom-full left-2 right-2 mb-2 bg-surface border border-main rounded-lg shadow-lg z-20 p-2 w-48">
                  <div className="mb-2 pb-2 border-b border-main">
                    <p className="text-sm font-semibold text-heading truncate" title={`${user.first_name} ${user.last_name}`}>
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-muted truncate mt-0.5" title={user.email}>
                      {user.email}
                    </p>
                    <p className="text-xs text-muted capitalize">{user.role?.replace('_', ' ')}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-content text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
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
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
                  <div className="px-3 mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.label}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {section.items.map((item, index) => (
                      <li key={index}>
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileOpen(false)}
                          className={linkClass(item.path)}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-medium truncate" title={item.label}>
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Mobile User Section */}
            {user && (
              <div className="border-t border-main p-3 relative z-10">
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-between w-full p-2.5
                    rounded-lg bg-surface border border-main
                    hover:border-primary transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-600 flex items-center justify-center rounded-full text-white">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-heading truncate" title={`${user.first_name} ${user.last_name}`}>
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-muted truncate mt-0.5" title={user.email}>
                          {user.email}
                        </p>
                        <p className="text-xs text-muted capitalize">{user.role?.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted transition-transform flex-shrink-0 ml-2 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Mobile User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-main rounded-lg shadow-lg z-20">
                      <div className="p-1">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-content text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;