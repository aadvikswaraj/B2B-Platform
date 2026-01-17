'use client';

import { useState } from 'react';
import { AiOutlineShop, AiOutlineEnvironment } from 'react-icons/ai';

const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'Limited Liability Partnership (LLP)',
  'Private Limited Company',
  'Public Limited Company',
  'One Person Company',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function BusinessDetailsForm({ data, updateData, onBack, onNext }) {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    // Validate company name
    if (!data.companyName?.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    // Validate business type
    if (!data.businessType) {
      newErrors.businessType = 'Business type is required';
    }

    // Validate address
    if (!data.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    // Validate city
    if (!data.city?.trim()) {
      newErrors.city = 'City is required';
    }

    // Validate state
    if (!data.state) {
      newErrors.state = 'State is required';
    }

    // Validate PIN code
    if (!data.pinCode?.trim()) {
      newErrors.pinCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(data.pinCode)) {
      newErrors.pinCode = 'Invalid PIN code';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <div className="mt-1 relative">
            <input
              id="companyName"
              name="companyName"
              type="text"
              value={data.companyName}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 pl-10 border ${
                errors.companyName ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            <AiOutlineShop className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {errors.companyName && (
            <p className="mt-2 text-sm text-red-600">{errors.companyName}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
            Business Type
          </label>
          <select
            id="businessType"
            name="businessType"
            value={data.businessType}
            onChange={handleChange}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
              errors.businessType ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select a business type</option>
            {BUSINESS_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.businessType && (
            <p className="mt-2 text-sm text-red-600">{errors.businessType}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Registered Address
          </label>
          <div className="mt-1 relative">
            <textarea
              id="address"
              name="address"
              rows={3}
              value={data.address}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
          </div>
          {errors.address && (
            <p className="mt-2 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <div className="mt-1">
            <input
              id="city"
              name="city"
              type="text"
              value={data.city}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
          </div>
          {errors.city && (
            <p className="mt-2 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        <div>
          <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700">
            PIN Code
          </label>
          <div className="mt-1">
            <input
              id="pinCode"
              name="pinCode"
              type="text"
              value={data.pinCode}
              onChange={handleChange}
              maxLength={6}
              className={`appearance-none block w-full px-3 py-2 border ${
                errors.pinCode ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
          </div>
          {errors.pinCode && (
            <p className="mt-2 text-sm text-red-600">{errors.pinCode}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <select
            id="state"
            name="state"
            value={data.state}
            onChange={handleChange}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
              errors.state ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select a state</option>
            {INDIAN_STATES.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-2 text-sm text-red-600">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Next Step
        </button>
      </div>
    </form>
  );
}
