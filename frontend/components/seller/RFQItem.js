'use client'

const statusColors = {
  Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Accepted: { bg: 'bg-green-100', text: 'text-green-800' },
  Declined: { bg: 'bg-red-100', text: 'text-red-800' },
  Expired: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

export default function RFQItem({ rfq }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {rfq.productName}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  From: {rfq.buyerCompany}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${
                  statusColors[rfq.status].bg
                } ${statusColors[rfq.status].text}`}
              >
                {rfq.status}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                <dd className="mt-1 text-sm text-gray-900">{rfq.quantity} units</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Target Price</dt>
                <dd className="mt-1 text-sm text-gray-900">${rfq.targetPrice}/unit</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Delivery By</dt>
                <dd className="mt-1 text-sm text-gray-900">{rfq.deliveryDate}</dd>
              </div>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Requirements</dt>
              <dd className="mt-1 text-sm text-gray-900">{rfq.requirements}</dd>
            </div>

            {rfq.status === 'Pending' && (
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Send Quote
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
