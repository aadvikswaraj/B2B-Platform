'use client';

import { useState } from 'react';
import Navbar from '@/components/buyer/Navbar';
import DashboardSidebar from '@/components/common/DashboardSidebar';
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function MyAccountLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Profile', href: '/myaccount/profile', icon: UserIcon },
    { name: 'Orders', href: '/myaccount/orders', icon: ClipboardDocumentListIcon },
    { name: 'Messages', href: '/myaccount/message-center', icon: ChatBubbleLeftRightIcon },
    { name: 'Addresses', href: '/myaccount/addresses', icon: HomeIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main top bar */}
      <Navbar />

      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title="My Account"
        navigation={navigation}
        brandColor="emerald"
      />

      {/* Content area with left padding on large screens */}
      <div className="lg:pl-64">
        {/* Mobile sidebar trigger */}
        <div className="px-2.5 pt-2 pb-0 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
          >
            Open Menu
          </button>
        </div>

        <main className="p-2.5 pt-2">
          {children}
        </main>
      </div>
    </div>
  );
}