'use client';

import SideMenu from '@/components/buyer/SideMenu';
import BottomNav from '@/components/buyer/BottomNav';
import Navbar from '@/components/buyer/Navbar';

export default function MyAccountLayout({ children }) {
  return (
    <>
      <Navbar/>
      <div className="flex bg-gray-50 h-[calc(100vh-80px)]">
        {/* Side Menu - Hidden on Mobile */}
        <div className="hidden md:block">
          <SideMenu />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 md:ml-64 md:w-[calc(100vw-16rem)] h-full">
          <div className="p-2.5 md:p-2.5 max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>

        {/* Bottom Navigation - Visible only on Mobile */}
        <BottomNav />
      </div>
    </>
  );
}