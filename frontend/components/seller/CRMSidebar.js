'use client'

import { useState } from 'react'

export default function CRMSidebar() {
  const [showNotes, setShowNotes] = useState(true)
  const [newNote, setNewNote] = useState('')

  return (
    <div className="flex h-full flex-col border-l border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Customer Info</h2>
          <button
            type="button"
            className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 md:hidden"
            onClick={() => {
              // Close CRM sidebar on mobile
              const event = new CustomEvent('toggleCRM', { detail: false })
              window.dispatchEvent(event)
            }}
          >
            <span className="sr-only">Close panel</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Company Info */}
        <div className="border-b border-gray-200 px-4 py-5">
          <h3 className="text-sm font-medium text-gray-500">Company Details</h3>
          <div className="mt-2 space-y-3">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Name:</span> ABC Trading Co.
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Industry:</span> Manufacturing
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Location:</span> New York, USA
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Customer Since:</span> Jan 2025
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-b border-gray-200 px-4 py-5">
          <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
          <div className="mt-2 space-y-3">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Name:</span> John Smith
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Position:</span> Procurement Manager
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Email:</span> john@abctrading.com
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Phone:</span> +1 234-567-8900
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="border-b border-gray-200 px-4 py-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Tags</h3>
            <button
              type="button"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Add Tag
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800">
              VIP Customer
            </span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
              Regular Buyer
            </span>
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-sm font-medium text-yellow-800">
              High Potential
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="px-4 py-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {showNotes ? 'Hide' : 'Show'}
            </button>
          </div>
          {showNotes && (
            <div className="mt-2 space-y-4">
              {/* Add Note Form */}
              <div>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add a note..."
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-900">
                    Interested in bulk order of industrial pumps. Follow up next week.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Added by Sarah - Aug 8, 2025</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-900">
                    Previous order completed successfully. Very satisfied with delivery time.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Added by Mike - Aug 1, 2025</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
