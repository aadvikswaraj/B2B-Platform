import OrderTable from '@/components/seller/OrderTable'

// Sample orders data
const orders = [
  {
    id: '#ORD-2023-001',
    product: 'Industrial Water Pump',
    buyer: 'Acme Manufacturing',
    amount: '1,299.99',
    status: 'Processing',
  },
  {
    id: '#ORD-2023-002',
    product: 'Steel Pipes (2-inch)',
    buyer: 'BuildRight Construction',
    amount: '15,998.00',
    status: 'Shipped',
  },
  {
    id: '#ORD-2023-003',
    product: 'Electric Motor 5HP',
    buyer: 'Tech Industries',
    amount: '13,749.75',
    status: 'Delivered',
  },
  {
    id: '#ORD-2023-004',
    product: 'Industrial Water Pump',
    buyer: 'Global Manufacturing Co',
    amount: '2,599.98',
    status: 'Cancelled',
  },
]

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track your orders
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-1 items-center space-x-4">
          <div className="min-w-0 flex-1">
            <input
              type="search"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search orders..."
            />
          </div>
          <div className="w-32">
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Total Orders', stat: '156' },
          { name: 'Processing', stat: '12' },
          { name: 'Shipped', stat: '48' },
          { name: 'Revenue', stat: '$45,233' },
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

      {/* Orders Table */}
      <OrderTable orders={orders} />

      {/* Pagination */}
      <nav
        className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{' '}
            <span className="font-medium">4</span> of{' '}
            <span className="font-medium">156</span> results
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
