// src/components/PublicNavBar.jsx
import React, { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';

const PublicNavBar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Services', id: 'services' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav className="bg-main border-b border-main fixed top-0 left-0 right-0 z-50">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={logo} className="h-8 rounded-lg" alt="XMFFI Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-heading">
            XMFFI
          </span>
        </a>

        {/* Right side: Theme toggle and buttons */}
        <div className="flex items-center md:order-2 space-x-3 rtl:space-x-reverse">
          {/* Theme Toggle Switch */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Sun className="w-4 h-4 text-content" />
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-800 ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle theme"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <Moon className="w-4 h-4 text-content" />
          </div>

          {/* Get Started Button */}
          <button
            onClick={handleGetStarted}
            className="px-4 py-2 bg-primary hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Get started
          </button>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden hover-surface focus:outline-none focus:ring-2 focus:ring-blue-800 text-content"
            aria-controls="navbar-cta"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMobileMenuOpen ? 'block' : 'hidden'
          }`}
          id="navbar-cta"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border
          border-main rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row
          md:mt-0 md:border-0 bg-main md:bg-main">
            {navItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className="block py-2 px-3 md:p-0 rounded-sm transition-colors text-content hover:text-primary md:hover:bg-transparent w-full text-left md:w-auto"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavBar;