'use client';

import { useState } from 'react';
import { AdminCard } from '@/components/admin/AdminComponents';
import { LineChart, BarChart, DoughnutChart } from '@/components/admin/Charts';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

// Mock data - replace with actual API data
const mockData = {
  revenue: {
    total: 128500,
    change: 12.5,
    data: [12000, 15000, 10000, 22000, 18000, 25000, 26500],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  orders: {
    total: 856,
    change: -2.3,
    data: [120, 150, 100, 220, 180, 50, 36],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  users: {
    total: 2458,
    change: 8.1,
    distribution: {
      data: [1500, 700, 258],
      labels: ['Buyers', 'Sellers', 'Admin'],
      colors: ['#3b82f6', '#10b981', '#6366f1'],
    },
  },
  products: {
    total: 12458,
    change: 5.4,
    categories: {
      data: [450, 300, 250, 200, 180],
      labels: ['Electronics', 'Fashion', 'Home', 'Sports', 'Others'],
    },
  },
};

function StatCard({ title, value, change, icon: Icon }) {
  const isPositive = change >= 0;
  
  return (
    <AdminCard className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">
          {typeof value === 'number' 
            ? value.toLocaleString('en-US', { 
                style: title.toLowerCase().includes('revenue') ? 'currency' : 'decimal',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            : value}
        </p>
        <p className={`mt-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <span className="inline-flex items-center">
            {isPositive ? (
              <ArrowUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 mr-1" />
            )}
            {Math.abs(change)}%
          </span>
          <span className="text-gray-500 ml-1">vs last week</span>
        </p>
      </div>
      <div className="p-3 bg-blue-50 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
    </AdminCard>
  );
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('week');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={mockData.revenue.total}
          change={mockData.revenue.change}
          icon={CurrencyDollarIcon}
        />
        <StatCard
          title="Total Orders"
          value={mockData.orders.total}
          change={mockData.orders.change}
          icon={ShoppingBagIcon}
        />
        <StatCard
          title="Total Users"
          value={mockData.users.total}
          change={mockData.users.change}
          icon={UserGroupIcon}
        />
        <StatCard
          title="Total Products"
          value={mockData.products.total}
          change={mockData.products.change}
          icon={DocumentTextIcon}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Revenue Overview">
          <div className="h-[300px]">
            <LineChart
              data={mockData.revenue.data}
              labels={mockData.revenue.labels}
              label="Revenue"
            />
          </div>
        </AdminCard>

        <AdminCard title="Orders Overview">
          <div className="h-[300px]">
            <LineChart
              data={mockData.orders.data}
              labels={mockData.orders.labels}
              label="Orders"
              borderColor="#10b981"
            />
          </div>
        </AdminCard>

        <AdminCard title="User Distribution">
          <div className="h-[300px]">
            <DoughnutChart
              data={mockData.users.distribution.data}
              labels={mockData.users.distribution.labels}
              colors={mockData.users.distribution.colors}
            />
          </div>
        </AdminCard>

        <AdminCard title="Products by Category">
          <div className="h-[300px]">
            <BarChart
              data={mockData.products.categories.data}
              labels={mockData.products.categories.labels}
              label="Products"
            />
          </div>
        </AdminCard>
      </div>

      {/* Recent Activity */}
      <AdminCard title="Recent Activity">
        <div className="space-y-4">
          {/* Add recent activity items here */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  New Seller Registration
                </p>
                <p className="text-sm text-gray-500">
                  ABC Company joined as a seller
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">2 minutes ago</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingBagIcon className="w-6 h-6 text-green-60" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  New Order Placed
                </p>
                <p className="text-sm text-gray-500">
                  Order #12345 - $1,250
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">5 minutes ago</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  New RFQ Submitted
                </p>
                <p className="text-sm text-gray-500">
                  RFQ #789 for Electronics Category
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">10 minutes ago</span>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
