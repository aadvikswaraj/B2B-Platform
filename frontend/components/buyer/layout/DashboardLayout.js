'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaRegUser, 
  FaRegBuilding,
  FaRegListAlt,
  FaRegHeart 
} from 'react-icons/fa';
import { 
  AiOutlineMessage, 
  AiOutlineDashboard,
  AiOutlineShopping,
  AiOutlineSetting 
} from 'react-icons/ai';
import { BsClipboardCheck } from 'react-icons/bs';
import { CiViewList } from 'react-icons/ci';
import { IoStatsChartOutline } from 'react-icons/io5';

const menuItems = [
  {
    title: 'Main Menu',
    items: [
      { name: 'Dashboard', icon: <AiOutlineDashboard className="w-5 h-5" />, href: '/myaccount/dashboard' },
      { name: 'Profile', icon: <FaRegUser className="w-5 h-5" />, href: '/myaccount/profile' },
      { name: 'My Company', icon: <FaRegBuilding className="w-5 h-5" />, href: '/myaccount/company' },
    ]
  },
  {
    title: 'Business',
    items: [
      { name: 'Orders', icon: <BsClipboardCheck className="w-5 h-5" />, href: '/myaccount/orders' },
      { name: 'Products', icon: <AiOutlineShopping className="w-5 h-5" />, href: '/myaccount/products' },
      { name: 'RFQs', icon: <CiViewList className="w-5 h-5" />, href: '/myaccount/rfqs' },
      { name: 'Messages', icon: <AiOutlineMessage className="w-5 h-5" />, href: '/myaccount/message-center' },
      { name: 'Inquiries', icon: <FaRegListAlt className="w-5 h-5" />, href: '/myaccount/inquiries' },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { name: 'Statistics', icon: <IoStatsChartOutline className="w-5 h-5" />, href: '/myaccount/statistics' },
      { name: 'Favorites', icon: <FaRegHeart className="w-5 h-5" />, href: '/myaccount/favorites' },
    ]
  },
  {
    title: 'Settings',
    items: [
      { name: 'Settings', icon: <AiOutlineSetting className="w-5 h-5" />, href: '/myaccount/settings' },
    ]
  }
];

export default function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r transition-all duration-300 
        ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-4 border-b text-gray-500 hover:bg-gray-50"
          >
            {isCollapsed ? '→' : '←'}
          </button>

          <div className="overflow-y-auto flex-1 py-4">
            {menuItems.map((section, idx) => (
              <div key={idx} className="mb-6">
                {!isCollapsed && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase">
                    {section.title}
                  </h3>
                )}
                <ul>
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600
                          ${pathname === item.href ? 'bg-blue-50 text-blue-600' : ''}
                          ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                      >
                        {item.icon}
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'} pt-16`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
