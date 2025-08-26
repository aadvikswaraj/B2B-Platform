'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full width topbar */}
      <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content with left margin for desktop sidebar */}
      <div className="lg:pl-64">
        <main className="p-2.5 pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
