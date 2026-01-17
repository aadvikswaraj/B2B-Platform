'use client';

import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar({ 
  isOpen, 
  onClose, 
  title = "Dashboard", 
  navigation = [], 
  brandColor = "blue",
  logo = null 
}) {
  const pathname = usePathname();

  const colorClasses = {
    blue: {
      active: 'bg-blue-50 text-blue-600 border-blue-200',
      hover: 'hover:bg-blue-50 hover:text-blue-600'
    },
    indigo: {
      active: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      hover: 'hover:bg-indigo-50 hover:text-indigo-600'
    },
    emerald: {
      active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      hover: 'hover:bg-emerald-50 hover:text-emerald-600'
    },
    rose: {
      active: 'bg-rose-50 text-rose-600 border-rose-200',
      hover: 'hover:bg-rose-50 hover:text-rose-600'
    }
  };

  const colors = colorClasses[brandColor] || colorClasses.blue;

  // Precompute single active base (deepest match) so parent + child are not both active
  navigation = navigation.map(item => {
    let href = item.href.replace(/\/$/, '');
    return { ...item, href, active: (pathname === href) ? true : false };
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:top-16 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full lg:h-[calc(100vh-4rem)]">
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 lg:pt-6">
            <ul className="space-y-1">
              {navigation.map((item) => {

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={clsx('flex', 'items-center', 'px-4', 'py-2.5', 'rounded-lg', 'text-sm', 'font-medium', 'transition-colors',
                        item.active ? `${colors.active} border` // Active state styling
                        : `text-gray-600 ${colors.hover}` // Default state styling
                      )}
                      onClick={() => onClose && onClose()}
                    >
                      <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
