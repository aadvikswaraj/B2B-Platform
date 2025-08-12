'use client';

import { useState } from 'react';
import { AiOutlineUpload, AiOutlineDollar, AiOutlineGlobal, AiOutlineFileImage } from 'react-icons/ai';

const ANNUAL_TURNOVER_RANGES = [
  'Less than ₹10 Lakhs',
  '₹10 Lakhs - ₹50 Lakhs',
  '₹50 Lakhs - ₹2 Crores',
  '₹2 Crores - ₹5 Crores',
  '₹5 Crores - ₹10 Crores',
  'Above ₹10 Crores'
];

const BUSINESS_CATEGORIES = [
  'Manufacturer',
  'Wholesaler',
  'Distributor',
  'Retailer',
  'Service Provider',
  'Trader',
  'Importer/Exporter'
];

export default function AdditionalDetailsForm({ data, updateData, onBack, onSubmit }) {
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(data.companyLogo || '');

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          companyLogo: 'File size should be less than 5MB'
        }));
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          companyLogo: 'Only JPEG, PNG, and WebP images are allowed'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        updateData({ companyLogo: reader.result });
      };
      reader.readAsDataURL(file);
      
      // Clear error if exists
      if (errors.companyLogo) {
        setErrors(prev => ({ ...prev, companyLogo: undefined }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    // Validate annual turnover
    if (!data.annualTurnover) {
      newErrors.annualTurnover = 'Please select annual turnover range';
    }

    // Validate business category
    if (!data.businessCategory) {
      newErrors.businessCategory = 'Please select business category';
    }

    // Validate website (if provided)
    if (data.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(data.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    // Logo is optional, but validate if provided
    if (data.companyLogo && data.companyLogo.length > 2 * 1024 * 1024) { // 2MB in base64
      newErrors.companyLogo = 'Logo file size is too large';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
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
      <div className="space-y-6">
        <div>
          <label htmlFor="businessCategory" className="block text-sm font-medium text-gray-700">
            Business Category
          </label>
          <select
            id="businessCategory"
            name="businessCategory"
            value={data.businessCategory || ''}
            onChange={handleChange}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
              errors.businessCategory ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select your business category</option>
            {BUSINESS_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.businessCategory && (
            <p className="mt-2 text-sm text-red-600">{errors.businessCategory}</p>
          )}
        </div>

        <div>
          <label htmlFor="annualTurnover" className="block text-sm font-medium text-gray-700">
            Annual Turnover Range
          </label>
          <div className="mt-1 relative">
            <select
              id="annualTurnover"
              name="annualTurnover"
              value={data.annualTurnover || ''}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 pl-10 border ${
                errors.annualTurnover ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            >
              <option value="">Select turnover range</option>
              {ANNUAL_TURNOVER_RANGES.map(range => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            <AiOutlineDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {errors.annualTurnover && (
            <p className="mt-2 text-sm text-red-600">{errors.annualTurnover}</p>
          )}
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Company Website (Optional)
          </label>
          <div className="mt-1 relative">
            <input
              id="website"
              name="website"
              type="text"
              value={data.website || ''}
              onChange={handleChange}
              placeholder="https://www.example.com"
              className={`appearance-none block w-full px-3 py-2 pl-10 border ${
                errors.website ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            <AiOutlineGlobal className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {errors.website && (
            <p className="mt-2 text-sm text-red-600">{errors.website}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Logo (Optional)
          </label>
          <div className="mt-1 space-y-4">
            {logoPreview && (
              <div className="w-40 h-40 relative rounded-lg overflow-hidden border border-gray-300">
                <img
                  src={logoPreview}
                  alt="Company logo preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <AiOutlineFileImage className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="companyLogo" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      id="companyLogo"
                      name="companyLogo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            </div>
            {errors.companyLogo && (
              <p className="mt-2 text-sm text-red-600">{errors.companyLogo}</p>
            )}
          </div>
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
          Complete Registration
        </button>
      </div>
    </form>
  );
}
