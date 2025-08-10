'use client'

import { useState } from 'react'
import Image from 'next/image'

// Sample product data
const products = [
  {
    id: 1,
    name: 'Industrial Water Pump',
    image: '/product-image.jpg',
    views: 1245,
    clicks: 86,
    ctr: '6.9%',
    promoted: true,
    budget: 100,
    spent: 45,
  },
  {
    id: 2,
    name: 'Steel Pipes (2-inch)',
    image: '/product-image.jpg',
    views: 892,
    clicks: 54,
    ctr: '6.1%',
    promoted: false,
  },
  {
    id: 3,
    name: 'Electric Motor 5HP',
    image: '/product-image.jpg',
    views: 654,
    clicks: 42,
    ctr: '6.4%',
    promoted: true,
    budget: 75,
    spent: 32,
  },
]

export default function AdsPage() {
  const [selectedProduct, setSelectedProduct] = useState(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Promote Products</h1>
        <p className="mt-1 text-sm text-gray-500">
          Boost your product visibility and reach more buyers
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Total Ad Spend', value: '$177', change: '+12.3%' },
          { name: 'Impressions', value: '2.8K', change: '+8.1%' },
          { name: 'Clicks', value: '182', change: '+5.4%' },
          { name: 'Avg. CTR', value: '6.5%', change: '+2.1%' },
        ].map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {stat.value}
            </dd>
            <dd className="mt-2 flex items-baseline">
              <span className="text-sm font-semibold text-green-600">{stat.change}</span>
            </dd>
          </div>
        ))}
      </div>

      {/* Product List */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Your Products</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select products to promote and track their performance
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-1 gap-4 p-4 hover:bg-gray-50 sm:grid-cols-2 md:grid-cols-4"
            >
              {/* Product Info */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.promoted ? 'Currently promoted' : 'Not promoted'}
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="flex flex-col justify-center sm:col-span-2">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Views</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {product.views.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Clicks</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {product.clicks.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CTR</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{product.ctr}</dd>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                {product.promoted ? (
                  <>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Budget: ${product.budget}
                      </p>
                      <p className="text-sm text-gray-500">
                        Spent: ${product.spent}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Edit Budget
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Promote
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotion Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setSelectedProduct(null)}
            />

            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Promote {selectedProduct.name}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Set your budget and duration for the promotion
                  </p>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="budget"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Daily Budget
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        name="budget"
                        id="budget"
                        className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Duration
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                  onClick={() => setSelectedProduct(null)}
                >
                  Start Promotion
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                  onClick={() => setSelectedProduct(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
