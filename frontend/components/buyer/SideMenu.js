'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
    name: 'My Profile',
    icon: <FaRegUser className="w-5 h-5" />,
    href: '/myaccount/profile',
    showInSidebar: true
  },
  { 
    name: 'Orders',
    icon: <BsClipboardCheck className="w-5 h-5" />,
    href: '/myaccount/orders',
    showInSidebar: true
  },
  { 
    name: 'Messages',
    icon: <AiOutlineMessage className="w-5 h-5" />,
    href: '/myaccount/message-center',
    showInSidebar: true
  },
  { 
    name: 'RFQs',
    icon: <CiViewList className="w-5 h-5" />,
    href: '/myaccount/rfqs',
    showInSidebar: true
  }
];

export default function SideMenu() {
  const pathname = usePathname();
  const sidebarItems = menuItems.filter(item => item.showInSidebar);

  return (
    <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-80px)] bg-white border-r shadow-sm">
      <div className="flex flex-col h-full">
        <div className="overflow-y-auto flex-1 py-4">
          <ul className="space-y-1">
            {sidebarItems.map((item, idx) => (
              <li key={idx}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 space-x-3 transition-colors
                    ${pathname === item.href ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
