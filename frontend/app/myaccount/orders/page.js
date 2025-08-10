'use client';

import { useState } from 'react';
import OrderCard from '@/components/buyer/orders/OrderCard';
import { AiOutlineSearch, AiOutlineCalendar, AiOutlineFilter } from 'react-icons/ai';
import { BiSort } from 'react-icons/bi';

const TABS = [
  { id: 'all', label: 'All Orders', count: 0 },
  { id: 'confirming', label: 'To Be Confirmed', count: 0 },
  { id: 'unpaid', label: 'Unpaid', count: 0 },
  { id: 'preparing', label: 'Processing', count: 0 },
  { id: 'delivering', label: 'Shipped', count: 0 },
  { id: 'refunds', label: 'Refunds/Returns', count: 0 },
  { id: 'completed', label: 'Completed', count: 0 },
  { id: 'closed', label: 'Closed', count: 0 },
];

// Sample data
const MOCK_ORDERS = [
  {
    id: 'ORD-2025-001',
    date: '2025-08-07',
    status: 'confirming',
    total: 1250.00,
    products: [
      {
        id: 1,
        name: 'Industrial Electric Motor XJ-200',
        quantity: 2,
        price: 625.00,
        image: '/product-image.jpg',
        specifications: 'Power: 2000W, RPM: 1750, Voltage: 220V'
      },
      {
        id: 2,
        name: 'Control Panel CP-100',
        quantity: 1,
        price: 450.00,
        image: '/product-image.jpg',
        specifications: 'Type: Digital, Display: LCD, Input: 24V'
      }
    ],
    supplier: {
      name: 'ElectroTech Industries',
      location: 'Shanghai, China',
      id: 'SUP001'
    }
  },
  {
    id: 'ORD-2025-002',
    date: '2025-08-05',
    status: 'delivering',
    total: 3600.00,
    products: [
      {
        id: 3,
        name: 'Solar Panel Array SP-500',
        quantity: 4,
        price: 900.00,
        image: '/product-image.jpg',
        specifications: 'Capacity: 500W, Type: Monocrystalline, Efficiency: 21%'
      }
    ],
    supplier: {
      name: 'Green Energy Solutions',
      location: 'Guangzhou, China',
      id: 'SUP002'
    }
  },
  {
    id: 'ORD-2025-003',
    date: '2025-08-01',
    status: 'completed',
    total: 850.00,
    products: [
      {
        id: 4,
        name: 'Industrial Safety Equipment Set',
        quantity: 5,
        price: 170.00,
        image: '/product-image.jpg',
        specifications: 'Type: Full Set, Standards: ISO Certified, Size: Universal'
      }
    ],
    supplier: {
      name: 'SafetyFirst Co.',
      location: 'Shenzhen, China',
      id: 'SUP003'
    }
  }
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredOrders = MOCK_ORDERS.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesTab || !matchesSearch) return false;

    if (dateFilter === 'all') return true;
    
    const orderDate = new Date(order.date);
    const now = new Date();
    const diffTime = Math.abs(now - orderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (dateFilter) {
      case 'week': return diffDays <= 7;
      case 'month': return diffDays <= 30;
      case 'year': return diffDays <= 365;
      default: return true;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow min-h-screen w-[100vw] md:w-full">
      <div className="p-4 sm:p-6 border-b">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">My Orders</h1>
        
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative min-w-0">
            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number or supplier"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

{/* Tabs Navigation */}
        <div className="border-b">
          <div className="overflow-x-auto">
            <nav className="flex px-4 sm:px-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex-shrink-0 py-3 px-3 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              No orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}