'use client';

import { useState } from 'react';
import ManagementPanel from '@/components/common/ManagementPanel';
import { OrdersAPI } from '@/utils/api/admin/orders';
import { useListQuery } from '@/utils/listQueryManager';
import Button from '@/components/ui/Button';

// Mock options (matching existing file)
const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const paymentStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Order Details - {order._id}
                </h3>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Buyer Information</h4>
                    <p className="text-sm text-gray-900 dark:text-white">{order.buyer.name}</p>
                    <p className="text-sm text-gray-900 dark:text-white">{order.buyer.company}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Items</h4>
                    <div className="mt-2 space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-900 dark:text-white">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-gray-900 dark:text-white">Total</span>
                          <span className="text-gray-900 dark:text-white">${order.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Status</h4>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                        value={order.status}
                        onChange={(e) => {/* Update order status */}}
                        disabled
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</h4>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                        value={order.paymentStatus}
                        onChange={(e) => {/* Update payment status */}}
                        disabled
                      >
                        {paymentStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { items: orders, totalCount, loading, handlers } = useListQuery({
    apiFn: OrdersAPI.list,
  });

  const columns = [
    {
      key: "id",
      header: "Order ID",
      sortable: true,
      render: (order) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {order._id}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: "buyer",
      header: "Buyer",
      render: (order) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">
            {order.buyer.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {order.buyer.company}
          </div>
        </div>
      ),
    },
    {
      key: "seller",
      header: "Seller",
      render: (order) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {order.seller.name}
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      render: (order) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          ${order.total}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (order) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          order.status === 'delivered'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : order.status === 'cancelled'
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}>
          {order.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (order) => (
        <Button size="sm" onClick={() => setSelectedOrder(order)}>
          View Details
        </Button>
      ),
    }
  ];

  const filters = [
    {
      key: 'status',
      label: 'Order Status',
      options: statusOptions,
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      options: paymentStatusOptions,
    },
  ];

  return (
    <div className="mt-5">
      <ManagementPanel
        title="Order Management"
        items={orders}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        getRowId={(r) => r._id}
        {...handlers}
        searchPlaceholder="Search orders..."
        filters={filters}
      />

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
