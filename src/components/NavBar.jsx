import React, { useEffect, useState } from 'react';
import { Bell, User, Menu, Sun, Moon } from 'lucide-react';

const NavBar = ({ onMenuClick }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Apply dark/light mode to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      {/* Left: Mobile Menu Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-slate-700 text-gray-300 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-3">
        {/* Light/Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-300"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        {/* User Icon */}
        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <User className="w-5 h-5 text-gray-300" />
        </button>
      </div>
    </header>
  );
};

export default NavBar;
