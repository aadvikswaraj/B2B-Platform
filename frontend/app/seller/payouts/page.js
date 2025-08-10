'use client'

import { useState } from 'react'

const transactions = [
  {
    id: 'TRX-2023-001',
    amount: 1299.99,
    status: 'Completed',
    type: 'Order Payment',
    order: '#ORD-2023-001',
    date: '2025-08-01',
  },
  {
    id: 'TRX-2023-002',
    amount: 15998.00,
    status: 'Pending',
    type: 'Order Payment',
    order: '#ORD-2023-002',
    date: '2025-08-05',
  },
  {
    id: 'TRX-2023-003',
    amount: -75.00,
    status: 'Completed',
    type: 'Platform Fee',
    order: null,
    date: '2025-08-05',
  },
  {
    id: 'TRX-2023-004',
    amount: 13749.75,
    status: 'Processing',
    type: 'Order Payment',
    order: '#ORD-2023-003',
    date: '2025-08-07',
  },
]

const statusColors = {
  Completed: { bg: 'bg-green-100', text: 'text-green-800' },
  Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Processing: { bg: 'bg-blue-100', text: 'text-blue-800' },
}

export default function PayoutsPage() {
  const [selectedMonth, setSelectedMonth] = useState('August 2025')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Payouts & Transactions</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your earnings, payouts and transaction history
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Available Balance', value: '$14,532.74' },
          { name: 'Pending Balance', value: '$15,998.00' },
          { name: 'Total Earnings', value: '$48,574.00' },
          { name: 'Platform Fees', value: '$2,428.70' },
        ].map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </div>

      {/* Bank Account Info */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Payout Account
          </h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Bank of America - ****4589
                </p>
                <p className="text-sm text-gray-500">Connected on July 15, 2025</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Update Account
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-base font-semibold leading-6 text-gray-900">
              Transaction History
            </h2>
            <div className="flex items-center space-x-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option>August 2025</option>
                <option>July 2025</option>
                <option>June 2025</option>
              </select>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Download Statement
              </button>
            </div>
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden min-w-full md:block">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Transaction ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-gray-900">{transaction.id}</div>
                    {transaction.order && (
                      <div className="text-gray-500">Order: {transaction.order}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {transaction.type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-sm">
                    <span
                      className={
                        transaction.amount < 0 ? 'text-red-600' : 'text-gray-900'
                      }
                    >
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        statusColors[transaction.status].bg
                      } ${statusColors[transaction.status].text}`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="divide-y divide-gray-200 md:hidden">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.id}
                  </p>
                  {transaction.order && (
                    <p className="text-sm text-gray-500">Order: {transaction.order}</p>
                  )}
                </div>
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    statusColors[transaction.status].bg
                  } ${statusColors[transaction.status].text}`}
                >
                  {transaction.status}
                </span>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-500">{transaction.type}</div>
                <div
                  className={`text-sm font-medium ${
                    transaction.amount < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}
                >
                  ${Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
              <div className="text-sm text-gray-500">{transaction.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <nav
        className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{' '}
            <span className="font-medium">4</span> of{' '}
            <span className="font-medium">24</span> results
          </p>
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
          <button
            type="button"
            className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            type="button"
            className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </nav>
    </div>
  )
}
