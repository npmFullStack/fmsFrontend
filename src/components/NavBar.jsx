import React from 'react';
import { Menu, Bell, Palette, Crown, Building2, Leaf, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const NavBar = ({ onMenuClick }) => {
  const { theme, isDarkMode, themeInfo, switchTheme, toggleDarkMode, isThemeActive } = useTheme();
  const [showThemeDropdown, setShowThemeDropdown] = React.useState(false);

  // Theme icons mapping
  const themeIcons = {
    'luxury-gold': <Crown className="w-4 h-4" />,
    'corporate-blue': <Building2 className="w-4 h-4" />,
    'emerald-luxury': <Leaf className="w-4 h-4" />,
  };

  const handleThemeClick = (themeBase) => {
    switchTheme(themeBase);
    setShowThemeDropdown(false);
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    toggleDarkMode();
  };

  return (
    <div className="navbar bg-base-100 shadow-lg border-b border-base-300 px-4">
      <div className="navbar-start">
        <button 
          onClick={onMenuClick} 
          className="btn btn-ghost btn-circle lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center ml-2">
          <span className="text-lg font-bold text-primary hidden lg:block">
            X-TRA MILE FREIGHT FORWARDING INC.
          </span>
          <span className="text-lg font-bold text-primary lg:hidden">
            XMFFI
          </span>
        </div>
      </div>

      <div className="navbar-end flex items-center gap-4">
        {/* Theme Selector Dropdown */}
        <div className="dropdown dropdown-end">
          <button 
            className="btn btn-ghost btn-circle"
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
          >
            <Palette className="w-5 h-5" />
          </button>
          {showThemeDropdown && (
            <ul className="dropdown-content menu p-2 shadow-2xl bg-base-100 rounded-box w-80 z-50 border border-base-300">
              <li className="menu-title py-1">
                <span className="text-sm font-bold">Color Themes</span>
              </li>
              
              {Object.entries(themeInfo).map(([themeBase, themeData]) => (
                <li key={themeBase} className="border-b border-base-300 last:border-b-0">
                  <button 
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors text-left ${
                      isThemeActive(themeBase) 
                        ? 'bg-primary/20 border border-primary/30' 
                        : 'hover:bg-base-200'
                    }`}
                    onClick={() => handleThemeClick(themeBase)}
                  >
                    {/* Left: Icon and Theme Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        isThemeActive(themeBase) 
                          ? 'bg-primary text-primary-content' 
                          : 'bg-base-300 text-base-content'
                      }`}>
                        {themeIcons[themeBase]}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{themeData.name}</div>
                        <div className="text-xs opacity-70 mt-0.5">{themeData.colors}</div>
                        
                        {/* Active Badge - Reduced padding makes this more visible */}
                        {isThemeActive(themeBase) && (
                          <div className="badge badge-primary badge-xs mt-0.5">
                            {isDarkMode ? 'Dark' : 'Light'} Mode
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Toggle Switch */}
                    <div 
                      className="flex items-center gap-2"
                      onClick={handleToggleClick}
                    >
                      <Sun className={`w-3 h-3 ${
                        !isDarkMode ? 'text-primary' : 'text-base-content/50'
                      }`} />
                      <input
                        type="checkbox"
                        className="toggle toggle-sm"
                        checked={isDarkMode}
                        onChange={handleToggleClick}
                        onClick={handleToggleClick}
                      />
                      <Moon className={`w-3 h-3 ${
                        isDarkMode ? 'text-primary' : 'text-base-content/50'
                      }`} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

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