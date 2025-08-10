import KPIStatCard from '@/components/seller/KPIStatCard'

// Sample data
const stats = [
  { title: 'Total Orders', value: '156', change: '12%', isPositive: true },
  { title: 'RFQs', value: '23', change: '5%', isPositive: true },
  { title: 'Revenue', value: '$12,545', change: '8%', isPositive: true },
]

const latestRFQs = [
  { id: 1, product: 'Industrial Pump', buyer: 'Acme Corp', quantity: '50', status: 'Pending' },
  { id: 2, product: 'Steel Pipes', buyer: 'BuildRight Inc', quantity: '200', status: 'Pending' },
  { id: 3, product: 'Electric Motors', buyer: 'Tech Manufacturing', quantity: '25', status: 'Declined' },
]

const latestOrders = [
  { id: '#ORD-2023-001', product: 'Industrial Pump', buyer: 'Acme Corp', status: 'Processing' },
  { id: '#ORD-2023-002', product: 'Steel Pipes', buyer: 'BuildRight Inc', status: 'Shipped' },
  { id: '#ORD-2023-003', product: 'Electric Motors', buyer: 'Tech Manufacturing', status: 'Delivered' },
]

export default function SellerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <KPIStatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Graph placeholder */}
      <div className="h-64 rounded-lg bg-white p-4 shadow">
        <div className="h-full rounded bg-gray-100"></div>
      </div>

      {/* Latest RFQs and Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Latest RFQs */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Latest RFQs</h3>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {latestRFQs.map((rfq) => (
              <li key={rfq.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{rfq.product}</p>
                    <p className="text-sm text-gray-500">{rfq.buyer}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                      {rfq.status}
                    </span>
                    <p className="mt-1 text-sm text-gray-500">Qty: {rfq.quantity}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Latest Orders */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Latest Orders</h3>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {latestOrders.map((order) => (
              <li key={order.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{order.product}</p>
                    <p className="text-sm text-gray-500">{order.buyer}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                      {order.status}
                    </span>
                    <p className="mt-1 text-sm text-gray-500">{order.id}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
