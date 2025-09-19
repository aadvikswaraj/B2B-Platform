'use client';

import { useState } from 'react';
import { AiOutlineSafetyCertificate, AiOutlineFileText } from 'react-icons/ai';

export default function GSTVerificationForm({ data, updateData, onBack, onNext }) {
  const [errors, setErrors] = useState({});
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, verifying, success, failed

  const extractPANFromGSTIN = (gstin) => {
    if (!gstin || gstin.length !== 15) return '';
    return gstin.substring(2, 12).toUpperCase();
  };

  const validateGSTIN = (gstin) => {
    // Basic GSTIN format validation
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const handleGSTVerification = async () => {
    setVerificationStatus('verifying');
    
    // Basic validation first
    if (!validateGSTIN(data.gstin)) {
      setErrors({
        gstin: 'Invalid GSTIN format'
      });
      setVerificationStatus('failed');
      return;
    }

    try {
      // TODO: Implement actual GST verification API call here
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo, assume verification is successful
      setVerificationStatus('success');
      setErrors({});
      // Store verification timestamp
      updateData({ 
        gstVerified: true,
        gstVerificationDate: new Date().toISOString()
      });
    } catch (error) {
      setVerificationStatus('failed');
      setErrors({
        gstin: 'GST verification failed. Please check the number and try again.'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    // Check if GSTIN is verified
    if (!data.gstVerified) {
      newErrors.gstin = 'Please verify your GSTIN before proceeding';
    }

    // Validate business PAN
    if (!data.businessPan?.trim()) {
      newErrors.businessPan = 'Business PAN is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.businessPan)) {
      newErrors.businessPan = 'Invalid PAN format';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert to uppercase for GSTIN and PAN
    const updatedValue = ['gstin', 'businessPan'].includes(name) ? value.toUpperCase() : value;
    updateData({ [name]: updatedValue });
    
    // Reset verification status when GSTIN changes
    if (name === 'gstin') {
      setVerificationStatus('pending');
      updateData({ gstVerified: false });

      // Autofill PAN from GSTIN when complete and valid
      if (updatedValue.length === 15) {
        const candidatePAN = extractPANFromGSTIN(updatedValue);
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (panRegex.test(candidatePAN)) {
          updateData({ businessPan: candidatePAN });
          if (errors.businessPan) {
            setErrors(prev => ({ ...prev, businessPan: undefined }));
          }
        }
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div>
          <label htmlFor="gstin" className="block text-sm font-medium text-gray-700">
            GSTIN Number
          </label>
          <div className="mt-1 relative flex">
            <div className="relative flex-grow">
              <input
                id="gstin"
                name="gstin"
                type="text"
                value={data.gstin || ''}
                onChange={handleChange}
                maxLength={15}
                disabled={verificationStatus === 'verifying'}
                className={`appearance-none block w-full px-3 py-2 pl-10 border ${
                  errors.gstin ? 'border-red-300' : 
                  verificationStatus === 'success' ? 'border-green-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="15-digit GSTIN"
              />
              <AiOutlineSafetyCertificate className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={handleGSTVerification}
              disabled={verificationStatus === 'verifying' || !data.gstin || data.gstin.length !== 15}
              className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                verificationStatus === 'verifying' 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : verificationStatus === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {verificationStatus === 'verifying' ? 'Verifying...' :
               verificationStatus === 'success' ? 'Verified' : 'Verify GSTIN'}
            </button>
          </div>
          {errors.gstin && (
            <p className="mt-2 text-sm text-red-600">{errors.gstin}</p>
          )}
          {verificationStatus === 'success' && (
            <p className="mt-2 text-sm text-green-600">GSTIN verified successfully</p>
          )}
        </div>

        <div>
          <label htmlFor="businessPan" className="block text-sm font-medium text-gray-700">
            Business PAN
          </label>
          <div className="mt-1 relative">
            <input
              id="businessPan"
              name="businessPan"
              type="text"
              value={data.businessPan || ''}
              onChange={handleChange}
              maxLength={10}
              className={`appearance-none block w-full px-3 py-2 pl-10 border ${
                errors.businessPan ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="10-digit PAN"
            />
            <AiOutlineFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {errors.businessPan && (
            <p className="mt-2 text-sm text-red-600">{errors.businessPan}</p>
          )}
          {!errors.businessPan && data.gstin?.length === 15 && data.businessPan && data.businessPan.toUpperCase() === extractPANFromGSTIN(data.gstin) && (
            <p className="mt-2 text-xs text-green-700">Auto-filled from GSTIN</p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900">Important Notes:</h4>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Please ensure your GSTIN is active and valid</li>
            <li>Verification may take a few moments to complete</li>
            <li>Business PAN should match with the PAN in your GSTIN</li>
          </ul>
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
