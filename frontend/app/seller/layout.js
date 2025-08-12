'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import SellerSidebar from '@/components/seller/SellerSidebar'
import SellerTopbar from '@/components/seller/SellerTopbar'

const PUBLIC_PATHS = ['registration', 'login', 'forgot-password'];

export default function SellerLayout({ children }) {
  const segments = useSelectedLayoutSegments();
  const isPublicPath = segments.some(segment => PUBLIC_PATHS.includes(segment));

  // If it's a public path, return children without the seller layout
  if (isPublicPath) {
    return children;
  }

  // Otherwise, return the full seller layout
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <SellerSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <SellerTopbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
