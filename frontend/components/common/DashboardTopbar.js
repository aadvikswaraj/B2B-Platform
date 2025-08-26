'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function DashboardTopbar({ 
  onMenuClick, 
  title = "Dashboard",
  user = null,
  notifications = 0,
  brandColor = "blue",
  logo = null 
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    rose: 'bg-rose-600 hover:bg-rose-700'
  };

  const brandColorClass = colorClasses[brandColor] || colorClasses.blue;

  return (
    <div className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Logo and Title */}
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            {logo && (
              <Image
                src={logo}
                alt="Logo"
                width={128}
                height={96}
                className="h-8 w-32 object-contain"
              />
            )}
            <span className="text-gray-400 text-lg font-light">|</span>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <button
            type="button"
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <BellIcon className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white min-w-[18px] h-[18px]">
                {notifications > 99 ? '99+' : notifications}
              </span>
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="flex items-center space-x-2">
                {user?.avatar ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={user.avatar}
                    alt={user.name || 'User'}
                  />
                ) : (
                  <div className={`h-8 w-8 rounded-full ${brandColorClass} flex items-center justify-center`}>
                    <span className="text-xs font-medium text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role || 'Member'}
                  </p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            {/* User dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserIcon className="h-4 w-4 mr-3" />
                    Profile
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-3" />
                    Settings
                  </a>
                  <hr className="my-1" />
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    Sign out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
