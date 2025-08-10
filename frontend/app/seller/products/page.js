import Link from 'next/link'
import ProductCard from '@/components/seller/ProductCard'

// Sample product data
const products = [
  {
    id: 1,
    name: 'Industrial Water Pump',
    description: 'High-capacity industrial water pump suitable for large-scale operations',
    price: '1,299.99',
    moq: 5,
    imageUrl: '/product-image.jpg',
  },
  {
    id: 2,
    name: 'Steel Pipes (2-inch)',
    description: 'Premium quality steel pipes, corrosion-resistant, 2-inch diameter',
    price: '89.99',
    moq: 20,
    imageUrl: '/product-image.jpg',
  },
  {
    id: 3,
    name: 'Electric Motor 5HP',
    description: '5 HP electric motor with high efficiency and low maintenance',
    price: '599.99',
    moq: 3,
    imageUrl: '/product-image.jpg',
  },
  // Add more sample products...
]

export default function ProductsList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-1 items-center space-x-4">
          <div className="min-w-0 flex-1">
            <input
              type="search"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search products..."
            />
          </div>
          <div className="w-32">
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option>All Categories</option>
              <option>Pumps</option>
              <option>Motors</option>
              <option>Pipes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
