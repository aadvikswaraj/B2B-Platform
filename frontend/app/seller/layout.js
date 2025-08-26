'use client';

import { useState } from 'react';
import { useSelectedLayoutSegments } from 'next/navigation';
import SellerSidebar from '@/components/seller/SellerSidebar';
import SellerTopbar from '@/components/seller/SellerTopbar';

const PUBLIC_PATHS = ['registration', 'login', 'forgot-password'];

export default function SellerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const segments = useSelectedLayoutSegments();
  const isPublicPath = segments.some(segment => PUBLIC_PATHS.includes(segment));

  // If it's a public path, return children without the seller layout
  if (isPublicPath) {
    return children;
  }

  // Otherwise, return the full seller layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full width topbar */}
      <SellerTopbar onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Sidebar */}
      <SellerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content with left margin for desktop sidebar */}
      <div className="lg:pl-64">
        <main className="p-2.5 pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
