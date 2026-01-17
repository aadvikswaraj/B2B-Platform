'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AiOutlineMessage, AiOutlineClockCircle, AiOutlineShop, AiOutlineDollar, AiOutlineShoppingCart, AiOutlineInfoCircle } from 'react-icons/ai';
import { IoLocationOutline } from 'react-icons/io5';
import { BsTruck } from 'react-icons/bs';

const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'confirming':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'unpaid':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'delivering':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'confirming':
        return 'Confirming';
      case 'unpaid':
        return 'Unpaid';
      case 'preparing':
        return 'Preparing to Ship';
      case 'delivering':
        return 'Delivering';
      case 'completed':
        return 'Completed';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle()}`}>
      {getStatusLabel()}
    </span>
  );
};

export default function OrderCard({ order }) {
  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Order Header */}
      <div className="border-b p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center sm:justify-between bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="font-medium text-sm sm:text-base">Order: {order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <span className="text-xs sm:text-sm text-gray-500">
            Placed on: {new Date(order.date).toDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs sm:text-sm font-medium truncate flex-1 sm:flex-none">
            Supplier: {order.supplier.name}
          </span>
          <button
            className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md whitespace-nowrap"
          >
            <AiOutlineMessage className="w-4 h-4 mr-1" />
            Chat Now
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="p-3 sm:p-4">
        <div className="space-y-4">
          {order.products.map((product) => (
            <div key={product.id} className="flex gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded relative flex-shrink-0">
                {product.image && (
                  <Image
                    unoptimized
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm sm:text-base truncate">{product.name}</h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.specifications}
                </p>
                <div className="mt-2 text-xs sm:text-sm">
                  <span className="text-gray-500">Qty: {product.quantity}</span>
                  <span className="mx-2">·</span>
                  <span className="text-gray-900">${product.price.toFixed(2)}/unit</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Footer */}
      <div className="border-t p-4 flex flex-wrap gap-4 items-center justify-between bg-gray-50">
        <div className="font-medium">
          Total Amount: ${order.total.toFixed(2)}
        </div>
        <div className="flex gap-3">
          <Link
            href={`/myaccount/orders/${order.id}`}
            className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Details
          </Link>
          {order.status === 'delivering' && (
            <button
              className="inline-flex items-center justify-center rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              <BsTruck className="mr-2" />
              Track Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
