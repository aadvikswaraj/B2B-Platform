'use client';

import SideMenu from '@/components/buyer/SideMenu';
import BottomNav from '@/components/buyer/BottomNav';
import Navbar from '@/components/buyer/Navbar';

export default function MyAccountLayout({ children }) {
  return (
    <>
      <Navbar/>
      <div className="flex min-h-screen bg-gray-50">
        {/* Side Menu - Hidden on Mobile */}
        <div className="hidden md:block">
          <SideMenu />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-6 md:w-[calc(100vw-16rem)]">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Bottom Navigation - Visible only on Mobile */}
        <BottomNav />
      </div>
    </>
  );
}