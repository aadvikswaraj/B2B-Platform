"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BusinessKYCFormRHF from "@/components/seller/registration/forms/BusinessKYCFormRHF";
import BankAccountFormRHF from "@/components/seller/registration/forms/BankAccountFormRHF";
import AdditionalDetailsFormRHF from "@/components/seller/registration/forms/AdditionalDetailsFormRHF";
import PickupAddressFormRHF from "@/components/seller/registration/forms/PickupAddressFormRHF";
import RegistrationStepper from "@/components/seller/registration/RegistrationStepper";
import SidebarSkeleton from "@/components/seller/registration/skeletons/SidebarSkeleton";
import StepperSkeleton from "@/components/seller/registration/skeletons/StepperSkeleton";
import FormSkeleton from "@/components/seller/registration/skeletons/FormSkeleton";
import { getRegistrationProgress, saveRegistrationStep } from "@/utils/api/seller/registration";

const steps = [
  { id: "account", name: "Account Created", description: "Login credentials saved", locked: true, autoComplete: true },
  { id: "businessKYC", name: "Business KYC", description: "PAN, GSTIN, Signature" },
  { id: "bankAccount", name: "Bank Account", description: "Account No, IFSC, Cheque Upload" },
  { id: "additionalDetails", name: "Additional Business Details", description: "Business info, categories, etc." },
  { id: "pickupAddress", name: "Pickup Address", description: "Select or add pickup address" },
];

export default function SellerRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState("businessKYC");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    pan: '', panFile: null, gstin: '', gstinFile: null, signatureFile: null,
    accountNumber: '', ifsc: '', accountHolder: '', cancelledChequeFile: null,
    companyName: '', businessType: '', businessCategory: '', contactPerson: '', phoneNumber: '', productCategories: [], description: '',
    addresses: [], pickupAddressId: null,
  });

  const updateFormData = (data) => setFormData(prev => ({ ...prev, ...data }));
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  const hydrateFromKYC = (kyc) => {
    if (!kyc) return;
    updateFormData({
      pan: kyc?.pan?.pan || '',
      gstin: kyc?.gstin?.gstin || '',
      accountNumber: kyc?.bankAccount?.accountNumber || '',
      ifsc: kyc?.bankAccount?.ifsc || '',
      accountHolder: kyc?.bankAccount?.accountHolder || '',
      pickupAddressId: kyc?.pickupAddress || null,
      panFile: kyc?.pan?.file || null,
      gstinFile: kyc?.gstin?.file || null,
      signatureFile: kyc?.signature?.file || null,
      cancelledChequeFile: kyc?.bankAccount?.cancelledCheque || null,
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setInitialLoading(true); setLoadError(null);
        const data = await getRegistrationProgress();
        if (mounted) {
          const { step, kyc } = data || {};
          if (step) setCurrentStep(step);
          hydrateFromKYC(kyc);
        }
      } catch (e) { if (mounted) setLoadError(e.message || 'Error loading progress'); }
      finally { if (mounted) setInitialLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const saveStep = useCallback(async (payload, filesKeys = [], nextStep) => {
    setSaving(true); setSaveError(null);
    try {
      const data = await saveRegistrationStep(payload, filesKeys, nextStep);
      hydrateFromKYC(data?.kyc);
      if (data?.step) setCurrentStep(data.step);
      if (nextStep) setCurrentStep(nextStep);
      return true;
    } catch (e) { setSaveError(e.message || 'Error saving'); return false; }
    finally { setSaving(false); }
  }, []);

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);
  const isStepComplete = (stepId) => { const step = steps.find(s => s.id === stepId); if (!step) return false; if (step.autoComplete) return true; return steps.findIndex(s => s.id === stepId) < getCurrentStepIndex(); };
  const canNavigateTo = (stepId) => { const targetIdx = steps.findIndex(s => s.id === stepId); const currentIdx = getCurrentStepIndex(); if (targetIdx === -1) return false; if (stepId === currentStep) return true; if (targetIdx < currentIdx) return true; const currentObj = steps[currentIdx]; if (targetIdx === currentIdx + 1 && currentObj?.autoComplete) return true; return isStepComplete(stepId); };

  const renderStep = () => {
    switch (currentStep) {
      case 'account':
        return (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Account Created</h2>
            <p className="max-w-sm text-sm text-gray-600">Your login credentials are set. Continue with your business profile below.</p>
            <button type="button" onClick={() => setCurrentStep('businessKYC')} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Proceed to Business KYC<svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </div>
        );
      case 'businessKYC':
        return (
          <BusinessKYCFormRHF
            defaultValues={formData}
            loading={saving}
            backendFileState={{
              panFileId: typeof formData.panFile === 'string' ? formData.panFile : null,
              gstinFileId: typeof formData.gstinFile === 'string' ? formData.gstinFile : null,
              signatureFileId: typeof formData.signatureFile === 'string' ? formData.signatureFile : null,
            }}
            onBack={() => setCurrentStep('account')}
            onSubmit={async values => {
              updateFormData({
                ...values,
                panFile: values.panFile ?? formData.panFile,
                gstinFile: values.gstinFile ?? formData.gstinFile,
                signatureFile: values.signatureFile ?? formData.signatureFile,
              });
              const ok = await saveStep({ pan: values.pan, gstin: values.gstin }, ['panFile','gstinFile','signatureFile'], 'bankAccount');
              if (!ok) return;
            }}
          />
        );
      case 'bankAccount':
        return (
          <BankAccountFormRHF
            defaultValues={formData}
            loading={saving}
            backendFileState={{
              cancelledChequeFileId: typeof formData.cancelledChequeFile === 'string' ? formData.cancelledChequeFile : null,
            }}
            onBack={() => setCurrentStep('businessKYC')}
            onSubmit={async values => {
              updateFormData({
                ...values,
                cancelledChequeFile: values.cancelledChequeFile ?? formData.cancelledChequeFile,
              });
              const ok = await saveStep({ accountNumber: values.accountNumber, ifsc: values.ifsc, accountHolder: values.accountHolder }, ['cancelledChequeFile'], 'additionalDetails');
              if (!ok) return;
            }}
          />
        );
      case 'additionalDetails':
        return (
          <AdditionalDetailsFormRHF
            defaultValues={formData}
            loading={saving}
            onBack={() => setCurrentStep('bankAccount')}
            onSubmit={async values => { updateFormData(values); setCurrentStep('pickupAddress'); }}
          />
        );
      case 'pickupAddress':
        return (
          <PickupAddressFormRHF
            defaultValues={formData}
            loading={saving}
            onBack={() => setCurrentStep('additionalDetails')}
            onSubmit={async values => {
              updateFormData(values);
              const ok = await saveStep({ pickupAddress: values.pickupAddressId }, [], null);
              if (ok) setCurrentStep('pickupAddress');
            }}
          />
        );
      default:
        return null;
    }
  };

  const getProgressPercent = () => ((getCurrentStepIndex()) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 pb-10 pt-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col items-center gap-3 text-center lg:mb-12">
          <Image src="/logo/logo-s-2.png" alt="B2B Platform Logo" width={120} height={40} className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm" priority />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">Seller Registration</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600 sm:text-base">Complete the steps to set up your verified seller account and start listing products.</p>
          </div>
          <div className="mt-4 w-full max-w-md lg:hidden">
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-600">
              <span>Step {Math.max(getCurrentStepIndex(),1)} of {steps.length - 1}</span>
              <span>{steps[getCurrentStepIndex()].name}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${getProgressPercent()}%` }} />
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="sticky top-4 hidden w-full max-w-xs shrink-0 self-start rounded-lg border border-gray-200 bg-white/80 p-5 backdrop-blur lg:block shadow-sm">
            {initialLoading ? <SidebarSkeleton steps={steps} /> : (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Progress</h2>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{Math.round(getProgressPercent())}%</span>
                </div>
                <div className="mb-6">
                  <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-500" style={{ width: `${getProgressPercent()}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] font-medium text-gray-500"><span>Start</span><span>Finish</span></div>
                </div>
                <ol className="space-y-1" role="list" aria-label="Registration steps">
                  {steps.map((step, i) => {
                    const isCurrent = step.id === currentStep;
                    const isComplete = isStepComplete(step.id);
                    const clickable = canNavigateTo(step.id);
                    return (
                      <li key={step.id} className="relative pl-10">
                        {!(i === steps.length - 1) && (
                          <span className="absolute left-4 top-8 block h-[calc(100%-0.5rem)] w-px bg-gray-200" aria-hidden="true" />
                        )}
                        {!(i === steps.length - 1) && (
                          <span className={`absolute left-4 top-8 block w-px bg-blue-500 transition-all duration-500 ${isComplete ? 'h-[calc(100%-0.5rem)]' : isCurrent ? 'h-4' : 'h-0'}`} aria-hidden="true" />
                        )}
                        <button
                          type="button"
                          onClick={() => clickable && setCurrentStep(step.id)}
                          className={`group flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition ${isCurrent ? 'bg-blue-50 ring-1 ring-inset ring-blue-600/20' : isComplete ? 'hover:bg-gray-50' : 'opacity-60 hover:opacity-100'}`}
                          disabled={!clickable}
                          aria-current={isCurrent ? 'step' : undefined}
                        >
                          <span className={`absolute left-0 top-2 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition ${isCurrent ? 'border-blue-600 bg-blue-600 text-white' : isComplete ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>
                            {isComplete ? (
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 11l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            ) : (
                              i + 1
                            )}
                          </span>
                          <span className="ml-2 flex flex-col">
                            <span className={`text-sm font-medium ${isCurrent ? 'text-blue-700' : isComplete ? 'text-gray-800' : 'text-gray-600'}`}>{step.name}</span>
                            <span className="text-xs text-gray-500 line-clamp-2">{step.description}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">Account creation marked complete. Continue the remaining steps to finish onboarding.</div>
              </>
            )}
          </aside>

          <main className="flex-1">
            {initialLoading ? <StepperSkeleton steps={steps} /> : (
              <RegistrationStepper steps={steps} currentStepId={currentStep} onStep={(id) => { if (canNavigateTo(id)) setCurrentStep(id); }} />
            )}
            <div className="min-h-[320px]">
              {initialLoading ? <FormSkeleton /> : loadError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError} <button onClick={() => location.reload()} className="ml-2 underline">Retry</button></div>
              ) : (
                <>
                  {saveError && (
                    <div className="mb-4 rounded-md border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">{saveError}</div>
                  )}
                  {renderStep()}
                </>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:hidden">
              {steps.map((s, i) => {
                const isCurrent = s.id === currentStep;
                const isComplete = isStepComplete(s.id);
                const clickable = canNavigateTo(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => clickable && setCurrentStep(s.id)}
                    className={`flex flex-col items-center justify-center rounded-lg border px-2 py-2 text-[11px] font-medium transition sm:text-xs ${isCurrent ? 'border-blue-600 bg-blue-600 text-white shadow' : isComplete ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500'}`}
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
