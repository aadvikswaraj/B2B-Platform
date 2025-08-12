'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BusinessDetailsForm from '@/components/seller/registration/BusinessDetailsForm';
import GSTVerificationForm from '@/components/seller/registration/GSTVerificationForm';
import AdditionalDetailsForm from '@/components/seller/registration/AdditionalDetailsForm';
import AccountSetupForm from '@/components/seller/registration/AccountSetupForm';

const steps = [
  { id: 'account', name: 'Account Setup', description: 'Create your login credentials' },
  { id: 'business', name: 'Business Details', description: 'Your company information' },
  { id: 'gst', name: 'GST Verification', description: 'Verify GST registration' },
  { id: 'additional', name: 'Additional Info', description: 'Complete your profile' }
];

export default function SellerRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState('account');
  const [formData, setFormData] = useState({
    // Account details
    email: '',
    password: '',
    confirmPassword: '',
    
    // Business details
    companyName: '',
    businessType: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    
    // GST details
    gstin: '',
    gstCertificate: null,
    
    // Additional details
    contactPerson: '',
    phoneNumber: '',
    businessCategory: '',
    productCategories: [],
    description: ''
  });

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = (step) => {
    setCurrentStep(step);
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const isStepComplete = (stepId) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = getCurrentStepIndex();
    return stepIndex < currentIndex;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'account':
        return (
          <AccountSetupForm
            data={formData}
            updateData={updateFormData}
            onNext={() => handleNext('business')}
          />
        );
      case 'business':
        return (
          <BusinessDetailsForm
            data={formData}
            updateData={updateFormData}
            onBack={() => handleNext('account')}
            onNext={() => handleNext('gst')}
          />
        );
      case 'gst':
        return (
          <GSTVerificationForm
            data={formData}
            updateData={updateFormData}
            onBack={() => handleNext('business')}
            onNext={() => handleNext('additional')}
          />
        );
      case 'additional':
        return (
          <AdditionalDetailsForm
            data={formData}
            updateData={updateFormData}
            onBack={() => handleNext('gst')}
            onSubmit={() => console.log('Submit:', formData)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/logo/logo-s-1.png"
            alt="Logo"
            width={60}
            height={60}
            className="mx-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Seller Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete the following steps to create your seller account
          </p>
        </div>

        {/* Progress Steps */}
        <nav aria-label="Progress" className="mb-8">
          <ol role="list" className="overflow-hidden">
            <div className="flex items-center justify-between md:hidden mb-4">
              <p className="text-sm font-medium text-gray-900">
                Step {getCurrentStepIndex() + 1} of {steps.length}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {steps[getCurrentStepIndex()].name}
              </p>
            </div>
            <div className="hidden md:flex md:space-x-8">
              {steps.map((step, index) => {
                const isCurrent = step.id === currentStep;
                const isComplete = isStepComplete(step.id);

                return (
                  <li key={step.id} className="relative md:flex-1">
                    <div className="group flex items-center">
                      <span className="flex items-center px-6 py-4 text-sm font-medium">
                        <span
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                            isComplete
                              ? 'bg-blue-600 group-hover:bg-blue-800'
                              : isCurrent
                              ? 'border-2 border-blue-600 bg-white'
                              : 'border-2 border-gray-300 bg-white'
                          }`}
                        >
                          <span
                            className={`${
                              isComplete ? 'text-white' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                            }`}
                          >
                            {index + 1}
                          </span>
                        </span>
                        <span
                          className={`ml-4 text-sm font-medium ${
                            isCurrent ? 'text-blue-600' : 'text-gray-900'
                          }`}
                        >
                          {step.name}
                        </span>
                      </span>
                    </div>

                    {index !== steps.length - 1 && (
                      <div
                        className={`absolute top-0 right-0 hidden h-full w-5 md:block ${
                          isComplete ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        aria-hidden="true"
                      >
                        <svg
                          className="h-full w-full text-gray-300"
                          viewBox="0 0 22 80"
                          fill="none"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 -2L20 40L0 82"
                            vectorEffect="non-scaling-stroke"
                            stroke="currentColor"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </li>
                );
              })}
            </div>
          </ol>
        </nav>

        {/* Form Content */}
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
