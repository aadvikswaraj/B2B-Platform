'use client';

import { useState } from 'react';
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

export default function AdminTopbar({ onMenuClick }) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200">
      <div className="flex items-center justify-end h-full px-4">
        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={onMenuClick}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
          >
            <BellIcon className="h-6 w-6" />
          </button>

          <div className="flex items-center">
            <img
              className="h-8 w-8 rounded-full"
              src="/product-image.jpg"
              alt="Admin profile"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
