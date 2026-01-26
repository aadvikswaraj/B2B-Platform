'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function DashboardTopbar({ 
  title = "Dashboard",
  panelTitle = "Dashboard",
  user = null,
  brandColor = "blue",
  logo = null,
  notifications = 0,
  showBack = false,
  backUrl = "#"
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
          {/* Back Button - Only show on mobile/tablet (lg:hidden) */}
          {showBack && (
             <Link href={backUrl} className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden">
                <ArrowLeftIcon className="h-6 w-6" />
             </Link>
          )}

          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            {/* Logo - Always show on md+ */}
            {logo && (
              <Image
                src={logo}
                alt="Logo"
                width={128}
                height={96}
                className="h-8 w-32 object-contain hidden md:block"
              />
            )}
            {/* Separator - Always show on md+ */}
            {logo && <span className="text-gray-400 text-lg font-light hidden md:block">|</span>}
            
            <h1 className="text-lg font-semibold text-gray-900">
              {/* Desktop (lg+) always shows panelTitle */}
              <span className="hidden lg:inline">{panelTitle}</span>
              {/* Mobile/Tablet (< lg) always shows the page title */}
              <span className="lg:hidden">{title}</span>
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-1">
          {/* Message/Notification Icon */}
          <button className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 relative focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
            {notifications > 0 && (
              <span className="absolute top-3 right-3 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <ChevronDownIcon className="h-4 w-4 text-gray-400 hidden md:block" />
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
