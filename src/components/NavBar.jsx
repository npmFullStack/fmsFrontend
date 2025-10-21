// src/components/NavBar.jsx
import React from 'react';
import { Bell, User, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const NavBar = ({ onMenuClick }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="bg-surface border-b border-main px-6 py-3 flex items-center justify-between">
      {/* Left: Mobile Menu Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover-surface text-content lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-800"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-3">
        {/* Light/Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 hover-surface rounded-lg transition-colors text-content"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="p-2 hover-surface rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-content" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        {/* User Icon */}
        <button className="p-2 hover-surface rounded-lg transition-colors">
          <User className="w-5 h-5 text-content" />
        </button>
      </div>
    </header>
  );
};

export default NavBar;