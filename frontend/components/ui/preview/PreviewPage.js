'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { EllipsisHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function PreviewPage({ children, actions = [], title = "Actions" }) {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Split actions for mobile: Primary (first 2) + More
  const primaryActions = actions.slice(0, 2);
  const moreActions = actions.slice(2);
  const hasMore = moreActions.length > 0;

  return (
    <div className="relative">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        
        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {children}
        </div>

        {/* Desktop Action Sidebar */}
        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">{title}</h3>
            <div className="flex flex-col space-y-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  as={action.href ? Link : 'button'}
                  variant={action.variant || 'outline'}
                  onClick={action.onClick}
                  href={action.href}
                  icon={action.icon}
                  disabled={action.disabled}
                  className="w-full justify-start"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="flex gap-3">
          {primaryActions.map((action, index) => (
            <div key={index} className="flex-1">
              <Button
                as={action.href ? Link : 'button'}
                variant={action.variant || (index === 0 ? 'primary' : 'outline')}
                onClick={action.onClick}
                href={action.href}
                icon={action.icon}
                disabled={action.disabled}
                className="w-full justify-center"
              >
                {action.label}
              </Button>
            </div>
          ))}
          
          {hasMore && (
            <button
              onClick={() => setShowMobileMenu(true)}
              className="flex items-center justify-center w-12 h-10 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <EllipsisHorizontalIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile More Actions Drawer */}
      {showMobileMenu && createPortal(
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">More Actions</h3>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {moreActions.map((action, index) => (
                <Button
                  key={index}
                  as={action.href ? Link : 'button'}
                  variant="outline"
                  onClick={() => {
                    action.onClick?.();
                    setShowMobileMenu(false);
                  }}
                  href={action.href}
                  icon={action.icon}
                  disabled={action.disabled}
                  className="w-full justify-start text-lg py-3"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
