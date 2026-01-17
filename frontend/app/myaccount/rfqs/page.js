'use client';

import { useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { BsDownload, BsFillCaretDownFill } from 'react-icons/bs';
import Image from 'next/image';

const TABS = [
  { id: 'all', label: 'All RFQs' },
  { id: 'pending', label: 'Pending Response' },
  { id: 'quoting', label: 'Quoting' },
  { id: 'quoted', label: 'Quoted' },
  { id: 'expired', label: 'Expired' },
];

// Sample RFQ data
const MOCK_RFQS = [
  {
    id: 'RFQ-2025-001',
    date: '2025-08-07',
    status: 'pending',
    product: {
      name: 'Industrial Electric Motor',
      specifications: 'Power: 2000W, RPM: 1750, Voltage: 220V',
      quantity: 100,
      unit: 'Pieces',
      image: '/product-image.jpg'
    },
    receivedQuotes: 5,
    expiryDate: '2025-08-14',
    shippingMethod: 'Sea Freight',
    destination: 'United States',
    additionalRequirements: 'ISO Certified suppliers only'
  },
  {
    id: 'RFQ-2025-002',
    date: '2025-08-06',
    status: 'quoting',
    product: {
      name: 'Solar Panel Inverters',
      specifications: 'Output: 5000W, Efficiency: 97%, Grid-Tied',
      quantity: 50,
      unit: 'Sets',
      image: '/product-image.jpg'
    },
    receivedQuotes: 8,
    expiryDate: '2025-08-13',
    shippingMethod: 'Air Freight',
    destination: 'Canada',
    additionalRequirements: 'CE Certification required'
  }
];

function RFQCard({ rfq }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    quoting: 'bg-blue-100 text-blue-800',
    quoted: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    pending: 'Pending Response',
    quoting: 'Quoting',
    quoted: 'Quoted',
    expired: 'Expired'
  };

  return (
    <div className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">RFQ ID: {rfq.id}</span>
          <span className="text-sm text-gray-500">Posted: {new Date(rfq.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[rfq.status]}`}>
            {statusLabels[rfq.status]}
          </span>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Details
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image */}
          <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg relative flex-shrink-0">
            {rfq.product.image && (
              <Image
                src={rfq.product.image}
                alt={rfq.product.name}
                fill
                className="object-cover rounded-lg"
              />
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{rfq.product.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Quantity: {rfq.product.quantity} {rfq.product.unit}</p>
                <p className="text-gray-600">Shipping: {rfq.shippingMethod}</p>
                <p className="text-gray-600">Destination: {rfq.destination}</p>
              </div>
              <div>
                <p className="text-gray-600">Received Quotes: {rfq.receivedQuotes}</p>
                <p className="text-gray-600">Expiry Date: {new Date(rfq.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Specifications:</span> {rfq.product.specifications}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Additional Requirements:</span> {rfq.additionalRequirements}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t p-4 flex flex-wrap gap-3 justify-end">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">
          Download Details
          <BsDownload className="inline-block ml-2 w-4 h-4" />
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Compare Quotes
        </button>
      </div>
    </div>
  );
}

export default function RFQsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredRFQs = MOCK_RFQS.filter(rfq => {
    const matchesTab = activeTab === 'all' || rfq.status === activeTab;
    const matchesSearch = rfq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow min-h-screen w-full">
      <div className="p-4 sm:p-6 border-b">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">My RFQs</h1>
        
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative min-w-0">
            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by RFQ ID or product name"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
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
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Post New RFQ
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="relative -mx-4 sm:-mx-6 border-b">
          <div className="overflow-x-auto scrollbar-none">
            <nav className="flex min-w-max px-4 sm:px-6">
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

      {/* RFQs List */}
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {filteredRFQs.length > 0 ? (
            filteredRFQs.map((rfq) => (
              <RFQCard key={rfq.id} rfq={rfq} />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              No RFQs found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
