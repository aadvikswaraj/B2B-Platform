'use client'

import { useState } from 'react'
import Messenger from '@/components/Messenger'
import CRMSidebar from '@/components/seller/CRMSidebar'

export default function MessagesPage() {
  const [showCRM, setShowCRM] = useState(false)

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg bg-white shadow">
      {/* Main chat area */}
      <div className="flex-1">
        <Messenger />
      </div>

      {/* Mobile CRM Toggle */}
      <button
        type="button"
        onClick={() => setShowCRM(!showCRM)}
        className="fixed bottom-4 right-4 rounded-full bg-indigo-600 p-4 text-white shadow-lg md:hidden"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      {/* CRM Sidebar - hidden on mobile unless toggled */}
      <div
        className={`${
          showCRM ? 'translate-x-0' : 'translate-x-full'
        } fixed right-0 top-0 bottom-0 w-80 transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0`}
      >
        <CRMSidebar />
      </div>
    </div>
  )
}
