import React from 'react';
import { Navbar, Dropdown } from 'flowbite-react';
import { Menu, Bell } from 'lucide-react';

const NavBar = ({ onMenuClick }) => {
  return (
    <Navbar
      fluid
      rounded
      className="bg-white border-b border-blue-200 shadow-sm px-4 py-2 sticky top-0 z-40"
    >
      {/* Left: Mobile Menu Button + Logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-blue-100 text-gray-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-sky-400"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-lg font-semibold text-sky-600 hidden lg:block">
          X-TRA MILE FREIGHT FORWARDING INC.
        </span>
        <span className="text-lg font-semibold text-sky-600 lg:hidden">
          XMFFI
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Dropdown
          label={
            <div className="relative cursor-pointer">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-sky-400 rounded-full"></span>
            </div>
          }
          inline
          arrowIcon={false}
        >
          <Dropdown.Header>
            <span className="font-semibold text-gray-700">Notifications</span>
          </Dropdown.Header>
          <Dropdown.Item>No new notifications</Dropdown.Item>
        </Dropdown>

        {/* Profile */}
        <Dropdown
          inline
          label={
            <div className="w-8 h-8 bg-sky-400 text-white rounded-full flex items-center justify-center font-semibold cursor-pointer">
              U
            </div>
          }
        >
          <Dropdown.Header>
            <span className="block text-sm font-semibold">User Name</span>
            <span className="block truncate text-sm text-gray-500">
              user@email.com
            </span>
          </Dropdown.Header>
          <Dropdown.Item>Profile</Dropdown.Item>
          <Dropdown.Item>Settings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>Logout</Dropdown.Item>
        </Dropdown>
      </div>
    </Navbar>
  );
};

export default NavBar;
