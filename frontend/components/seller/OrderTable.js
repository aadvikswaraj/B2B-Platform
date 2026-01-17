'use client'

const statusColors = {
  Processing: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Shipped: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Delivered: { bg: 'bg-green-100', text: 'text-green-800' },
  Cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
}

export default function OrderTable({ orders }) {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      {/* Desktop view */}
      <div className="hidden min-w-full divide-y divide-gray-300 md:block">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Order ID
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Buyer
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Status
              </th>
              <th
                scope="col"
                className="relative py-3.5 pl-3 pr-4 sm:pr-6"
              >
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {order.id}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {order.product}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {order.buyer}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  ${order.amount}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      statusColors[order.status].bg
                    } ${statusColors[order.status].text}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  {order.status === 'Processing' && (
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Mark as Shipped
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="divide-y divide-gray-200 md:hidden">
        {orders.map((order) => (
          <div key={order.id} className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">{order.id}</p>
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  statusColors[order.status].bg
                } ${statusColors[order.status].text}`}
              >
                {order.status}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Product:</span> {order.product}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Buyer:</span> {order.buyer}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Amount:</span> ${order.amount}
              </p>
            </div>
            {order.status === 'Processing' && (
              <button
                type="button"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
              >
                Mark as Shipped
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
