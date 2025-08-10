'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AiOutlineMessage, AiOutlineShop, AiOutlineDollar, AiOutlineClockCircle, AiOutlineEnvironment, AiOutlineSafety, AiOutlineTruck, AiOutlineFileText } from 'react-icons/ai';
import { IoLocationOutline } from 'react-icons/io5';
import { BsTruck } from 'react-icons/bs';

// This would normally come from your API
const getOrderDetails = (id) => {
  // Mock data for demonstration
  return {
    id: 'ORD-2025-001',
    date: '2025-08-07',
    status: 'delivering',
    total: 1250.00,
    shippingFee: 45.00,
    tax: 98.00,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    estimatedDelivery: '2025-08-15',
    trackingNumber: 'TRK123456789',
    shippingAddress: {
      name: 'John Smith',
      company: 'Tech Solutions Inc.',
      address: '123 Business Avenue',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    products: [
      {
        id: 1,
        name: 'Industrial Electric Motor XJ-200',
        quantity: 2,
        price: 625.00,
        unitPrice: 625.00,
        image: '/product-image.jpg',
        specifications: 'Power: 2000W, RPM: 1750, Voltage: 220V'
      },
      {
        id: 2,
        name: 'Control Panel CP-100',
        quantity: 1,
        price: 450.00,
        unitPrice: 450.00,
        image: '/product-image.jpg',
        specifications: 'Type: Digital, Display: LCD, Input: 24V'
      }
    ],
    supplier: {
      name: 'ElectroTech Industries',
      location: 'Shanghai, China',
      id: 'SUP001',
      rating: 4.8,
      responseTime: '≤12h'
    },
    timeline: [
      {
        date: '2025-08-07 14:30',
        status: 'Order Placed',
        description: 'Your order has been successfully placed'
      },
      {
        date: '2025-08-07 15:45',
        status: 'Payment Confirmed',
        description: 'Payment has been verified and confirmed'
      },
      {
        date: '2025-08-08 09:00',
        status: 'Processing',
        description: 'Supplier is preparing your order'
      },
      {
        date: '2025-08-09 10:15',
        status: 'Shipped',
        description: 'Order has been picked up by shipping carrier'
      }
    ]
  };
};

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

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function OrderDetailsPage({ params }) {
  const order = getOrderDetails(params.id);
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold mb-2">Order Details: {order.id}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <AiOutlineClockCircle />
                <span>Placed on {new Date(order.date).toLocaleDateString()}</span>
              </div>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/myaccount/message-center"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              <AiOutlineMessage className="mr-2" />
              Contact Supplier
            </Link>
          </div>
        </div>

        {/* Supplier Info */}
        <div className="flex flex-col md:flex-row items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <AiOutlineShop className="text-gray-400 text-xl mt-1" />
              <div>
                <Link href={`/supplier/${order.supplier.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                  {order.supplier.name}
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <IoLocationOutline />
                  <span>{order.supplier.location}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-500">Supplier Rating</span>
              <div className="font-medium">{order.supplier.rating}/5.0</div>
            </div>
            <div>
              <span className="text-gray-500">Response Time</span>
              <div className="font-medium">{order.supplier.responseTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.products.map((product) => (
                <div key={product.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${product.id}`} className="text-base font-medium text-gray-900 hover:text-blue-600">
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-gray-500">{product.specifications}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-gray-600">Qty: {product.quantity}</span>
                        <span className="text-gray-600">Unit Price: ${product.unitPrice.toFixed(2)}</span>
                        <span className="font-medium">Total: ${product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Order Timeline</h2>
            </div>
            <div className="p-4">
              <div className="relative">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      {index !== order.timeline.length - 1 && (
                        <div className="flex-1 w-0.5 bg-gray-200 my-2"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{event.status}</div>
                      <div className="text-sm text-gray-500">{event.date}</div>
                      <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Order Summary</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${(order.total - order.shippingFee - order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span>${order.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Shipping Information</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Delivery Address</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.company}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
                {order.trackingNumber && (
                  <div>
                    <h3 className="font-medium mb-2">Tracking Information</h3>
                    <div className="text-sm text-gray-600">
                      <p>Tracking Number: {order.trackingNumber}</p>
                      <p className="mt-1">Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                      <button className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800">
                        <BsTruck className="mr-1" />
                        Track Package
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Payment Information</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="text-green-600 font-medium">{order.paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
