'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// Removed BusinessDetailsForm (business step eliminated)
import GSTVerificationForm from '@/components/seller/registration/GSTVerificationForm';
import AdditionalDetailsFormRHF from '@/components/seller/registration/forms/AdditionalDetailsFormRHF';
import AddressManager from '@/components/seller/registration/AddressManager';
import BankAccountsManager from '@/components/seller/registration/BankAccountsManager';

const steps = [
  { id: 'account', name: 'Account Created', description: 'Login credentials saved', locked: true, autoComplete: true },
  { id: 'gst', name: 'GST & Profile', description: 'Verify GST & view profile' },
  { id: 'addresses', name: 'Pickup Addresses', description: 'Manage pickup locations' },
  { id: 'banking', name: 'Bank Accounts', description: 'Add payout accounts' },
  { id: 'additional', name: 'Additional Info', description: 'Complete your profile' }
];

export default function SellerRegistration() {
  const router = useRouter();
  // Start from GST step (account creation assumed done)
  const [currentStep, setCurrentStep] = useState('gst');
  const [formData, setFormData] = useState({
    // Account details
    email: '',
    password: '',
    confirmPassword: '',
    
  // GST / business profile (fetched after GST verification)
  companyName: '',
  address: '',
  city: '',
  state: '',
  pinCode: '',
  gstProfileFetched: false,

  // GST details
    gstin: '',
    gstCertificate: null,
    
    // Additional details
    contactPerson: '',
    phoneNumber: '',
    businessCategory: '',
    productCategories: [],
  description: '',

  // Addresses & banking
  addresses: [],
  pickupAddressId: null,
  bankAccounts: [],
  primaryBankId: null
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
    const step = steps.find(s => s.id === stepId);
    if (!step) return false;
    if (step.autoComplete) return true;
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = getCurrentStepIndex();
    return stepIndex < currentIndex;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'account':
        return (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Account Created</h2>
            <p className="max-w-sm text-sm text-gray-600">Your login credentials are set. Continue with your business profile below.</p>
            <button
              type="button"
              onClick={() => setCurrentStep('business')}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Proceed to Business Details
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        );
      case 'gst':
        return (
          <GSTVerificationForm
            data={formData}
            updateData={updateFormData}
            onBack={() => setCurrentStep('account')}
            onNext={() => setCurrentStep('addresses')}
          />
        );
      case 'addresses':
        return (
          <AddressManager
            data={formData}
            updateData={updateFormData}
            onBack={() => setCurrentStep('gst')}
            onNext={() => setCurrentStep('banking')}
          />
        );
      case 'banking':
        return (
          <BankAccountsManager
            data={formData}
            updateData={updateFormData}
            onBack={() => setCurrentStep('addresses')}
            onNext={() => setCurrentStep('additional')}
          />
        );
      case 'additional':
        return (
          <AdditionalDetailsFormRHF
            defaultValues={formData}
            onBack={() => setCurrentStep('banking')}
            onSubmit={(values) => {
              updateFormData(values);
              console.log('Submit:', { ...formData, ...values });
            }}
          />
        );
      default:
        return null;
    }
  };

  const progressPercent = ((getCurrentStepIndex()) / (steps.length - 1)) * 100; // account auto-complete excluded

  const StepBadge = ({ index, step, last }) => {
    const isCurrent = step.id === currentStep;
    const isComplete = isStepComplete(step.id);
  const clickable = (isComplete || isCurrent) && !step.locked;
    return (
      <li className="relative pl-10">
        {/* Vertical line background */}
        {!last && (
          <span className="absolute left-4 top-8 block h-[calc(100%-0.5rem)] w-px bg-gray-200" aria-hidden="true" />
        )}
        {/* Vertical progress overlay */}
        {!last && (
          <span
            className={`absolute left-4 top-8 block w-px bg-blue-500 transition-all duration-500 ${
              isComplete ? 'h-[calc(100%-0.5rem)]' : isCurrent ? 'h-4' : 'h-0'
            }`}
            aria-hidden="true"
          />
        )}
        <button
          type="button"
          onClick={() => clickable && setCurrentStep(step.id)}
          className={`group flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition ${
            isCurrent
              ? 'bg-blue-50 ring-1 ring-inset ring-blue-600/20'
              : isComplete
              ? 'hover:bg-gray-50'
              : 'opacity-60 hover:opacity-100'
          }`}
          disabled={!clickable}
          aria-current={isCurrent ? 'step' : undefined}
        >
          <span
            className={`absolute left-0 top-2 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition ${
              isCurrent
                ? 'border-blue-600 bg-blue-600 text-white'
                : isComplete
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-300 bg-white text-gray-500'
            }`}
          >
            {isComplete ? (
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 11l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              index + 1
            )}
          </span>
          <span className="ml-2 flex flex-col">
            <span
              className={`text-sm font-medium ${
                isCurrent ? 'text-blue-700' : isComplete ? 'text-gray-800' : 'text-gray-600'
              }`}
            >
              {step.name}
            </span>
            <span className="text-xs text-gray-500 line-clamp-2">{step.description}</span>
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 pb-10 pt-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col items-center gap-3 text-center lg:mb-12">
          <Image
            src="/logo/logo-s-2.png"
            alt="B2B Platform Logo"
            width={120}
            height={40}
            className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm"
            priority
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              Seller Registration
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600 sm:text-base">
              Complete the steps to set up your verified seller account and start listing products.
            </p>
          </div>
          {/* Mobile progress bar (excludes auto-complete step visually) */}
          <div className="mt-4 w-full max-w-md lg:hidden">
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-600">
              <span>Step {Math.max(getCurrentStepIndex(),1)} of {steps.length - 1}</span>
              <span>{steps[getCurrentStepIndex()].name}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Sidebar Steps */}
            <aside className="sticky top-4 hidden w-full max-w-xs shrink-0 self-start rounded-lg border border-gray-200 bg-white/80 p-5 backdrop-blur lg:block shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Progress</h2>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{Math.round(progressPercent)}%</span>
              </div>
              {/* Unified sidebar progress bar */}
              <div className="mb-6">
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-medium text-gray-500">
                  <span>Start</span>
                  <span>Finish</span>
                </div>
              </div>
              <ol className="space-y-1" role="list" aria-label="Registration steps">
                {steps.map((step, i) => (
                  <StepBadge key={step.id} index={i} step={step} last={i === steps.length - 1} />
                ))}
              </ol>
              <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
                Account creation marked complete. Continue the remaining steps to finish onboarding.
              </div>
            </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-sm ring-1 ring-black/5 backdrop-blur">
              {/* Removed top progress bar in main content */}
              <div className="p-5 sm:p-8 lg:p-10">
                {renderStep()}
              </div>
            </div>

            {/* Mobile step pills */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:hidden">
              {steps.map((s, i) => {
                const isCurrent = s.id === currentStep;
                const isComplete = isStepComplete(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => (isComplete || isCurrent) && setCurrentStep(s.id)}
                    className={`flex flex-col items-center justify-center rounded-lg border px-2 py-2 text-[11px] font-medium transition sm:text-xs ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-600 text-white shadow'
                        : isComplete
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-500'
                    }`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <span>{i + 1}</span>
                    <span className="mt-1 line-clamp-2 leading-tight">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
