'use client';

import { useState } from 'react';
import { LineChart, BarChart, DoughnutChart } from '@/components/admin/Charts';
import { AdminCard } from '@/components/admin/AdminComponents';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

// Mock data moved to a separate file
import mockData from '@/data/mockDashboardData';

// Extracted reusable components
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
        <p
          className={`mt-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
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

function RecentActivityItem({ icon: Icon, title, description, time, bgColor, iconColor }) {
  return (
    <div className="flex items-center justify-between py-3 border-b">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <span className="text-sm text-gray-500">{time}</span>
    </div>
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
          <RecentActivityItem
            icon={UserGroupIcon}
            title="New Seller Registration"
            description="ABC Company joined as a seller"
            time="2 minutes ago"
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <RecentActivityItem
            icon={ShoppingBagIcon}
            title="New Order Placed"
            description="Order #12345 - $1,250"
            time="5 minutes ago"
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <RecentActivityItem
            icon={DocumentTextIcon}
            title="New RFQ Submitted"
            description="RFQ #789 for Electronics Category"
            time="10 minutes ago"
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>
      </AdminCard>
    </div>
  );
}
