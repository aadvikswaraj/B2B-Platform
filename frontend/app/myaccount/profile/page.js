'use client';
import { useState } from 'react';
import PersonalDetails from '@/components/buyer/profile/PersonalDetails';
import BusinessDetails from '@/components/buyer/profile/BusinessDetails';
import AdditionalDetails from '@/components/buyer/profile/AdditionalDetails';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="bg-white rounded-lg shadow w-full">
      <h1 className="text-xl sm:text-2xl font-semibold p-4 sm:p-6 border-b">My Profile</h1>
      
      {/* Tab Navigation */}
      <div className="relative border-b">
        <div className="overflow-x-auto scrollbar-none -mx-4 sm:-mx-6">
          <nav className="flex min-w-max px-4 sm:px-6">
            <button
              className={`py-3 sm:py-4 px-3 sm:px-6 font-medium text-sm sm:text-base transition-colors border-b-2
                ${activeTab === 'personal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('personal')}
            >
              Personal Details
            </button>
            <button
              className={`py-3 sm:py-4 px-3 sm:px-6 font-medium text-sm sm:text-base transition-colors border-b-2
                ${activeTab === 'business'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('business')}
            >
              Business Details
            </button>
            <button
              className={`py-3 sm:py-4 px-3 sm:px-6 font-medium text-sm sm:text-base transition-colors border-b-2
                ${activeTab === 'additional'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('additional')}
            >
              Additional Details
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          {activeTab === 'personal' && <PersonalDetails />}
          {activeTab === 'business' && <BusinessDetails />}
          {activeTab === 'additional' && <AdditionalDetails />}
        </div>
      </div>
    </div>
  );
}
