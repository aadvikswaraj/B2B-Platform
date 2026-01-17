'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EllipsisHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function BottomNav({ items = [], moreItems = [] }) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // If no items, don't render
  if (!items.length) return null;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden pb-safe">
        <div className="flex justify-around items-center h-16">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* More Button */}
          {moreItems.length > 0 && (
            <button
              onClick={() => setIsMoreOpen(true)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isMoreOpen ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <EllipsisHorizontalIcon className="h-6 w-6" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          )}
        </div>
      </div>

      {/* More Drawer */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMoreOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl max-h-[80vh] overflow-y-auto pb-safe">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">More Actions</h3>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 p-4">
              {moreItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className="flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="p-3 bg-gray-100 rounded-full text-gray-600">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-center text-gray-700 font-medium line-clamp-2">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
