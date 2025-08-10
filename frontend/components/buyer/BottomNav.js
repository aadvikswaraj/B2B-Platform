'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CiViewList,
  CiCircleMore
} from 'react-icons/ci';
import { 
  AiOutlineMessage,
  AiOutlineSetting,
} from 'react-icons/ai';
import { BsClipboardCheck } from 'react-icons/bs';
import { FaRegUser, FaRegHeart } from 'react-icons/fa';

export default function BottomNav() {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActivePath = (path) => pathname === path;

  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-[999] w-full">
        <nav className="flex justify-around items-center h-16 max-w-7xl mx-auto">
          <Link 
            href="/myaccount/orders" 
            className={`flex flex-col items-center justify-center flex-1 p-2 ${
              isActivePath('/myaccount/orders') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <BsClipboardCheck className="w-6 h-6" />
            <span className="text-xs mt-1">Orders</span>
          </Link>

          <Link 
            href="/myaccount/rfqs" 
            className={`flex flex-col items-center justify-center flex-1 p-2 ${
              isActivePath('/myaccount/rfqs') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <CiViewList className="w-6 h-6" />
            <span className="text-xs mt-1">RFQs</span>
          </Link>

          <Link 
            href="/myaccount/message-center" 
            className={`flex flex-col items-center justify-center flex-1 p-2 ${
              isActivePath('/myaccount/message-center') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <AiOutlineMessage className="w-6 h-6" />
            <span className="text-xs mt-1">Messages</span>
          </Link>

          <button 
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="flex flex-col items-center justify-center flex-1 p-2 text-gray-600"
          >
            <CiCircleMore className="w-6 h-6" />
            <span className="text-xs mt-1">More</span>
          </button>
        </nav>

        {/* More Menu Popup */}
        {isMoreMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMoreMenuOpen(false)}
            />
            
            {/* Menu */}
            <div className="fixed bottom-16 left-0 right-0 bg-white border-t p-4 z-50">
              <div className="grid grid-cols-4 gap-4">
                <Link 
                  href="/myaccount/profile" 
                  className="flex flex-col items-center p-2 text-gray-600"
                  onClick={() => setIsMoreMenuOpen(false)}
                >
                  <FaRegUser className="w-6 h-6" />
                  <span className="text-xs mt-1">Profile</span>
                </Link>
                
                <Link 
                  href="/myaccount/favorites" 
                  className="flex flex-col items-center p-2 text-gray-600"
                  onClick={() => setIsMoreMenuOpen(false)}
                >
                  <FaRegHeart className="w-6 h-6" />
                  <span className="text-xs mt-1">Favorites</span>
                </Link>

                <Link 
                  href="/myaccount/settings" 
                  className="flex flex-col items-center p-2 text-gray-600"
                  onClick={() => setIsMoreMenuOpen(false)}
                >
                  <AiOutlineSetting className="w-6 h-6" />
                  <span className="text-xs mt-1">Settings</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Spacer for bottom nav on mobile */}
      <div className="h-16 md:h-0" />
    </>
  );
}
