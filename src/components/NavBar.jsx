import React, { useEffect, useState } from 'react';
import { Menu, Bell, Sun, Moon } from 'lucide-react';

const NavBar = ({ onMenuClick }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeChange = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="navbar bg-base-200 shadow-sm">
      <div className="navbar-start">
        {/* Show only on mobile */}
        <button onClick={onMenuClick} className="btn btn-ghost btn-circle lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="navbar-center lg:navbar-start">
        {/* Full text on desktop, abbreviated on mobile */}
        <span className="text-sm font-semibold tracking-wide hidden lg:block">
          X-TRA MILE FREIGHT FORWARDING INC.
        </span>
        <span className="text-sm font-semibold tracking-wide lg:hidden">
          XMFFI
        </span>
      </div>

      <div className="navbar-end flex items-center gap-2 pr-2">
        {/* Theme toggle */}
        <label className="flex cursor-pointer items-center gap-2">
          <Sun className="w-5 h-5" />
          <input
            type="checkbox"
            onChange={handleThemeChange}
            className="toggle toggle-sm"
            checked={theme === 'dark'}
          />
          <Moon className="w-5 h-5" />
        </label>

        {/* Notification bell */}
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <Bell className="w-5 h-5" />
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default NavBar;