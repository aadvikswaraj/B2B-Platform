import RFQItem from '@/components/seller/RFQItem'

// Sample RFQ data
const rfqs = [
  {
    id: 1,
    productName: 'Industrial Water Pump',
    buyerCompany: 'Acme Manufacturing',
    quantity: 50,
    targetPrice: '999.99',
    deliveryDate: '2025-09-30',
    requirements: 'ISO 9001 certified. Must include installation manual and warranty card.',
    status: 'Pending',
  },
  {
    id: 2,
    productName: 'Steel Pipes (2-inch)',
    buyerCompany: 'BuildRight Construction',
    quantity: 200,
    targetPrice: '79.99',
    deliveryDate: '2025-09-15',
    requirements: 'ASTM A53 Grade B certification required. Need test certificates.',
    status: 'Accepted',
  },
  {
    id: 3,
    productName: 'Electric Motor 5HP',
    buyerCompany: 'Tech Industries',
    quantity: 25,
    targetPrice: '549.99',
    deliveryDate: '2025-10-01',
    requirements: 'CE certified. 3-year warranty required.',
    status: 'Declined',
  },
]

export default function RFQsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">RFQ Inbox</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and respond to Request for Quotations from buyers
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-1 items-center space-x-4">
          <div className="min-w-0 flex-1">
            <input
              type="search"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search RFQs..."
            />
          </div>
          <div className="w-32">
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Total RFQs', stat: '35' },
          { name: 'Pending', stat: '12' },
          { name: 'Accepted', stat: '18' },
          { name: 'Conversion Rate', stat: '51%' },
        ].map((item) => (
          <div
            key={item.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {item.stat}
            </dd>
          </div>
        ))}
      </div>

      {/* RFQ List */}
      <div className="space-y-4">
        {rfqs.map((rfq) => (
          <RFQItem key={rfq.id} rfq={rfq} />
        ))}
      </div>

      {/* Pagination */}
      <nav
        className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{' '}
            <span className="font-medium">3</span> of{' '}
            <span className="font-medium">35</span> results
          </p>
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
          <button
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </nav>
    </div>
  )
}
