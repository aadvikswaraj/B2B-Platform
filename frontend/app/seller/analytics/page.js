'use client'

export default function AnalyticsPage() {
  // Sample data for statistics and charts
  const stats = [
    { name: 'Total Sales', stat: '$48,574', change: '12%', changeType: 'increase' },
    { name: 'Avg. Order Value', stat: '$584', change: '2.1%', changeType: 'decrease' },
    { name: 'Conversion Rate', stat: '3.2%', change: '4.3%', changeType: 'increase' },
    { name: 'Total Products', stat: '45', change: '8', changeType: 'increase' },
  ]

  const topProducts = [
    {
      id: 1,
      name: 'Industrial Water Pump',
      sales: 24,
      revenue: '$31,128',
      growth: '+12%',
    },
    {
      id: 2,
      name: 'Steel Pipes (2-inch)',
      sales: 18,
      revenue: '$15,282',
      growth: '+8%',
    },
    {
      id: 3,
      name: 'Electric Motor 5HP',
      sales: 15,
      revenue: '$8,925',
      growth: '-3%',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your store performance and insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {item.stat}
            </dd>
            <dd
              className={`mt-2 flex items-baseline text-sm font-semibold ${
                item.changeType === 'increase'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {item.changeType === 'increase' ? (
                <svg
                  className="h-5 w-5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="ml-2">{item.change}</span>
            </dd>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Trend */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Sales Trend</h3>
          <div className="mt-2">
            <div className="h-72 rounded bg-gray-100">
              {/* Chart placeholder */}
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-500">Sales chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Traffic Sources</h3>
          <div className="mt-2">
            <div className="h-72 rounded bg-gray-100">
              {/* Chart placeholder */}
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-500">Traffic sources chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Top Products</h3>
          <p className="mt-1 text-sm text-gray-500">Your best performing products this month</p>
        </div>
        <div className="overflow-hidden">
          {/* Desktop view */}
          <div className="hidden min-w-full md:block">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                  >
                    Sales
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                  >
                    Revenue
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                  >
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {topProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">
                      {product.sales}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">
                      {product.revenue}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm">
                      <span
                        className={`inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium ${
                          product.growth.startsWith('+')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="divide-y divide-gray-200 md:hidden">
            {topProducts.map((product) => (
              <div key={product.id} className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <span
                    className={`inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium ${
                      product.growth.startsWith('+')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.growth}
                  </span>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Sales</p>
                  <p className="text-sm font-medium text-gray-900">{product.sales}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-sm font-medium text-gray-900">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
