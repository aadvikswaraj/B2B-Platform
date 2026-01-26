"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BusinessKYCFormRHF from "@/components/seller/registration/forms/BusinessKYCFormRHF";
import BankAccountFormRHF from "@/components/seller/registration/forms/BankAccountFormRHF";
import AdditionalDetailsFormRHF from "@/components/seller/registration/forms/AdditionalDetailsFormRHF";
import PickupAddressFormRHF from "@/components/seller/registration/forms/PickupAddressFormRHF";
import RegistrationStepper from "@/components/seller/registration/RegistrationStepper";
import SidebarSkeleton from "@/components/seller/registration/skeletons/SidebarSkeleton";
import StepperSkeleton from "@/components/seller/registration/skeletons/StepperSkeleton";
import FormSkeleton from "@/components/seller/registration/skeletons/FormSkeleton";
import {
  getRegistrationProgress,
  saveRegistrationStep,
} from "@/utils/api/seller/registration";
import Link from "next/link";

const steps = [
  {
    id: "account",
    name: "Account Created",
    description: "Login credentials saved",
    locked: true,
    autoComplete: true,
  },
  {
    id: "businessKYC",
    name: "Business KYC",
    description: "PAN, GSTIN, Signature",
  },
  {
    id: "bankAccount",
    name: "Bank Account",
    description: "Account No, IFSC, Cheque Upload",
  },
  {
    id: "additionalDetails",
    name: "Additional Business Details",
    description: "Business info, categories, etc.",
  },
  {
    id: "pickupAddress",
    name: "Pickup Address",
    description: "Select or add pickup address",
  },
];

export default function SellerRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState("businessKYC");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    pan: "",
    panFile: null,
    gstin: "",
    gstinFile: null,
    signatureFile: null,
    accountNumber: "",
    ifsc: "",
    accountHolder: "",
    cancelledChequeFile: null,
    companyName: "",
    businessType: "",
    businessCategory: "",
    contactPerson: "",
    phoneNumber: "",
    productCategories: [],
    description: "",
    addresses: [],
    pickupAddressId: null,
  });
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Update formData and always preserve file objects and preview URLs for file fields
  const updateFormData = (data) =>
    setFormData((prev) => ({
      ...prev,
      ...data,
      // Always keep file objects and URLs if present
      panFile: data.panFile !== undefined ? data.panFile : prev.panFile,
      panFileUrl:
        data.panFileUrl !== undefined ? data.panFileUrl : prev.panFileUrl,
      gstinFile: data.gstinFile !== undefined ? data.gstinFile : prev.gstinFile,
      gstinFileUrl:
        data.gstinFileUrl !== undefined ? data.gstinFileUrl : prev.gstinFileUrl,
      signatureFile:
        data.signatureFile !== undefined
          ? data.signatureFile
          : prev.signatureFile,
      signatureFileUrl:
        data.signatureFileUrl !== undefined
          ? data.signatureFileUrl
          : prev.signatureFileUrl,
      cancelledChequeFile:
        data.cancelledChequeFile !== undefined
          ? data.cancelledChequeFile
          : prev.cancelledChequeFile,
      cancelledChequeFileUrl:
        data.cancelledChequeFileUrl !== undefined
          ? data.cancelledChequeFileUrl
          : prev.cancelledChequeFileUrl,
    }));
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  /**
   * Hydrate formData from backend KYC object.
   * Always preserve both file object (if present) and file URL for preview.
   */
  const hydrateFromKYC = (kyc) => {
    if (!kyc) return;
    updateFormData({
      pan: kyc?.pan?.pan || "",
      gstin: kyc?.gstin?.gstin || "",
      accountNumber: kyc?.bankAccount?.accountNumber || "",
      ifsc: kyc?.bankAccount?.ifsc || "",
      accountHolder: kyc?.bankAccount?.accountHolder || "",
      pickupAddressId: kyc?.pickupAddress || null,
      panFile: kyc?.pan?.file?._id || kyc?.pan?.file || null,
      panFileUrl: kyc?.pan?.file?.relativePath
        ? `${apiBase}/${kyc.pan.file.relativePath}`
        : null,
      gstinFile: kyc?.gstin?.file?._id || kyc?.gstin?.file || null,
      gstinFileUrl: kyc?.gstin?.file?.relativePath
        ? `${apiBase}/${kyc.gstin.file.relativePath}`
        : null,
      signatureFile: kyc?.signature?.file?._id || kyc?.signature?.file || null,
      signatureFileUrl: kyc?.signature?.file?.relativePath
        ? `${apiBase}/${kyc.signature.file.relativePath}`
        : null,
      cancelledChequeFile:
        kyc?.bankAccount?.cancelledCheque?._id ||
        kyc?.bankAccount?.cancelledCheque ||
        null,
      cancelledChequeFileUrl: kyc?.bankAccount?.cancelledCheque?.relativePath
        ? `${apiBase}/${kyc.bankAccount.cancelledCheque.relativePath}`
        : null,
    });
  };

  // On first mount, fetch registration progress and hydrate form state
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setInitialLoading(true);
        setLoadError(null);
        const response = await getRegistrationProgress();
        if (mounted) {
          const { step, kyc, profile, user } = response?.data || {};

          if (step) {
            // If step is valid, use it. But if it's "account", we might want to skip to businessKYC if account is created?
            // Actually backend says "bankAccount", so we should trust backend.
            setCurrentStep(step);
          }

          hydrateFromKYC(kyc);

          // hydrate additional details and user phone
          updateFormData({
            companyName: profile?.companyName || "",
            contactPerson: user?.name || "",
            businessCategory: profile?.businessCategory || "",
            employeeCount: profile?.employeeCount || "",
            annualTurnover: profile?.annualTurnover || "",
            description: profile?.description || "",
            phoneNumber: user?.phone || "",
          });

          if (profile?.verification) {
            setVerificationStatus(profile.verification);
          }
        }
      } catch (e) {
        if (mounted) setLoadError(e.message || "Error loading progress");
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // --- Only hydrate file previews/state from local formData on step navigation ---

  const saveStep = useCallback(
    async (stepData, filesKeys = [], currentStep) => {
      setSaving(true);
      setSaveError(null);
      try {
        // Only send fields relevant to the current step to minimize payload
        let payload = { ...stepData };

        // Helper to upload a single file (Raw Binary Upload)
        const uploadFile = async (file) => {
          const res = await fetch(`${apiBase}/user/file/upload`, {
            method: "POST",
            headers: {
              "Content-Type": file.type,
              "x-file-name": encodeURIComponent(file.name),
              "x-folder": "seller-kyc",
            },
            body: file,
            credentials: "include",
          });
          const json = await res.json();
          if (!res.ok || !json.success)
            throw new Error(json.message || "File upload failed");
          return json.data._id; // Backend returns file document with _id
        };

        // Process file uploads first
        for (const key of filesKeys) {
          const file = payload[key];
          if (file instanceof File || file instanceof Blob) {
            try {
              const fileId = await uploadFile(file);
              payload[key] = fileId; // Replace file object with ID
            } catch (err) {
              throw new Error(`Failed to upload ${key}: ${err.message}`);
            }
          }
        }

        // Add step context for backend validation
        if (currentStep) payload.step = currentStep;

        const response = await saveRegistrationStep(payload);
        const data = response?.data;

        hydrateFromKYC(data?.kyc);
        if (data?.step) {
          setCurrentStep(data.step === "completed" ? "completed" : data.step);
        }
        return true;
      } catch (e) {
        setSaveError(e.message || "Error saving");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [apiBase],
  );

  const getCurrentStepIndex = () =>
    steps.findIndex((step) => step.id === currentStep);
  const isStepComplete = (stepId) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return false;
    if (step.autoComplete) return true;
    return steps.findIndex((s) => s.id === stepId) < getCurrentStepIndex();
  };
  const canNavigateTo = (stepId) => {
    // When completed, lock navigation
    if (currentStep === "completed") return stepId === "completed";
    const targetIdx = steps.findIndex((s) => s.id === stepId);
    const currentIdx = getCurrentStepIndex();
    if (targetIdx === -1) return false;
    if (stepId === currentStep) return true;
    if (targetIdx < currentIdx) return true;
    const currentObj = steps[currentIdx];
    if (targetIdx === currentIdx + 1 && currentObj?.autoComplete) return true;
    return isStepComplete(stepId);
  };

  /**
   * Render the current registration step.
   * Hydration is always from local formData, never from network on step navigation.
   */
  const renderStep = () => {
    switch (currentStep) {
      case "account":
        return (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Account Created
            </h2>
            <p className="max-w-sm text-sm text-gray-600">
              Your login credentials are set. Continue with your business
              profile below.
            </p>
            <button
              type="button"
              onClick={() => setCurrentStep("businessKYC")}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Proceed to Business KYC
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M7 5l5 5-5 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        );
      case "businessKYC":
        return (
          <BusinessKYCFormRHF
            defaultValues={formData}
            loading={saving}
            backendFileState={{
              panFileId:
                typeof formData.panFile === "string" ? formData.panFile : null,
              gstinFileId:
                typeof formData.gstinFile === "string"
                  ? formData.gstinFile
                  : null,
              signatureFileId:
                typeof formData.signatureFile === "string"
                  ? formData.signatureFile
                  : null,
            }}
            onBack={() => setCurrentStep("account")}
            // On submit, only send update if form values or files changed
            onSubmit={async (values) => {
              // Always preserve file objects and URLs for hydration
              updateFormData({
                ...values,
                panFile: values.panFile ?? formData.panFile,
                panFileUrl: formData.panFileUrl,
                gstinFile: values.gstinFile ?? formData.gstinFile,
                gstinFileUrl: formData.gstinFileUrl,
                signatureFile: values.signatureFile ?? formData.signatureFile,
                signatureFileUrl: formData.signatureFileUrl,
              });

              // Only send API request if any value or file changed
              const changed =
                values.pan !== formData.pan ||
                values.gstin !== formData.gstin ||
                values.companyName !== formData.companyName ||
                (values.panFile && values.panFile !== formData.panFile) ||
                (values.gstinFile && values.gstinFile !== formData.gstinFile) ||
                (values.signatureFile &&
                  values.signatureFile !== formData.signatureFile);
              if (!changed) {
                setCurrentStep("bankAccount");
                return;
              }

              // STEP 1: businessKYC - Only send KYC-related fields
              const businessKYCPayload = {
                pan: values.pan,
                gstin: values.gstin,
                companyName: values.companyName,
                panFile: values.panFile ?? formData.panFile,
                gstinFile: values.gstinFile ?? formData.gstinFile,
                signatureFile: values.signatureFile ?? formData.signatureFile,
              };

              const ok = await saveStep(
                businessKYCPayload,
                ["panFile", "gstinFile", "signatureFile"],
                "businessKYC",
              );
              if (!ok) return;
            }}
          />
        );
      case "bankAccount":
        return (
          <BankAccountFormRHF
            defaultValues={formData}
            loading={saving}
            backendFileState={{
              cancelledChequeFileId:
                typeof formData.cancelledChequeFile === "string"
                  ? formData.cancelledChequeFile
                  : null,
            }}
            onBack={() => setCurrentStep("businessKYC")}
            // Only send update if values or file changed
            onSubmit={async (values) => {
              updateFormData({
                ...values,
                cancelledChequeFile:
                  values.cancelledChequeFile ?? formData.cancelledChequeFile,
              });
              const changed =
                values.accountNumber !== formData.accountNumber ||
                values.ifsc !== formData.ifsc ||
                values.accountHolder !== formData.accountHolder ||
                (values.cancelledChequeFile &&
                  values.cancelledChequeFile !== formData.cancelledChequeFile);
              if (!changed) {
                setCurrentStep("additionalDetails");
                return;
              }

              // STEP 2: bankAccount - Only send bank-related fields
              const bankAccountPayload = {
                accountNumber: values.accountNumber,
                ifsc: values.ifsc,
                accountHolder: values.accountHolder,
                cancelledChequeFile:
                  values.cancelledChequeFile ?? formData.cancelledChequeFile,
              };

              const ok = await saveStep(
                bankAccountPayload,
                ["cancelledChequeFile"],
                "bankAccount",
              );
              if (!ok) return;
            }}
          />
        );
      case "additionalDetails":
        return (
          <AdditionalDetailsFormRHF
            defaultValues={formData}
            loading={saving}
            onBack={() => setCurrentStep("bankAccount")}
            onSubmit={async (values) => {
              // STEP 3: additionalDetails - Only send business profile fields (not phoneNumber)
              const additionalDetailsPayload = {
                contactPerson: values.contactPerson,
                phone: values.phoneNumber,
                businessCategory: values.businessCategory,
                employeeCount: values.employeeCount,
                annualTurnover: values.annualTurnover,
                description: values.description,
              };

              updateFormData({ ...values });
              const ok = await saveStep(
                additionalDetailsPayload,
                [],
                "additionalDetails",
              );
              if (!ok) return;
            }}
          />
        );
      case "pickupAddress":
        return (
          <PickupAddressFormRHF
            defaultValues={formData}
            loading={saving}
            onBack={() => setCurrentStep("additionalDetails")}
            onSubmit={async (values) => {
              // STEP 4: pickupAddress - Only send address ID
              const pickupAddressPayload = {
                pickupAddress: values.pickupAddressId,
              };

              updateFormData(values);
              await saveStep(pickupAddressPayload, [], "pickupAddress");
            }}
          />
        );
      case "completed":
        const status = verificationStatus?.status || "pending";
        const isVerified = status === "verified";
        const isRejected = status === "rejected";

        return (
          <div className="flex min-h-[500px] flex-col items-center justify-center py-10">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-2xl shadow-blue-900/5 ring-1 ring-gray-900/5 sm:p-12">
              {/* Premium Background Decoration */}
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-50 blur-3xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-purple-50 blur-3xl" />

              <div
                className={`relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full ${isVerified ? "bg-green-50 text-green-600" : isRejected ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"} ring-8 ring-white`}
              >
                {isVerified ? (
                  <svg
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : isRejected ? (
                  <svg
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
                    <svg
                      className="h-12 w-12 animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <h2 className="mb-3 text-2xl font-bold tracking-tighter text-gray-900 sm:text-3xl">
                {isVerified
                  ? "You are Verified!"
                  : isRejected
                    ? "Account Rejected"
                    : "Verification in Progress"}
              </h2>

              <p className="mx-auto max-w-sm text-base leading-relaxed text-gray-500">
                {isVerified
                  ? "Your seller account has been approved. You can now access your dashboard and start listing products."
                  : isRejected
                    ? `Unfortunately, your account was rejected. ${verificationStatus?.rejectedReason || "Please contact support."}`
                    : "We are currently reviewing your documents. This process typically takes 24-48 hours. You will be notified via email."}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => location.reload()}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
                >
                  <svg
                    className="mr-2 h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Check Status
                </button>
                {isVerified && (
                  <Link
                    href="/seller/dashboard"
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
                  >
                    Go to Dashboard
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                )}
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-transparent px-6 py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 active:scale-95"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getProgressPercent = () =>
    (getCurrentStepIndex() / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 pb-10 pt-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
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
              Complete the steps to set up your verified seller account and
              start listing products.
            </p>
          </div>
          <div className="mt-6 w-full max-w-md lg:hidden">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Step {Math.max(getCurrentStepIndex() + 1, 1)}/{steps.length}
              </span>
              <span className="text-xs font-semibold text-blue-600">
                {steps[getCurrentStepIndex()]?.name}
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
              <div className="absolute inset-0 bg-gray-100/50" />
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md transition-all duration-500 ease-out"
                style={{
                  width: `${((getCurrentStepIndex() + 1) / steps.length) * 100}%`,
                }}
              >
                <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {currentStep !== "completed" && (
            <aside className="sticky top-4 hidden w-full max-w-xs shrink-0 self-start rounded-lg border border-gray-200 bg-white/80 p-5 backdrop-blur lg:block shadow-sm">
              {initialLoading ? (
                <SidebarSkeleton steps={steps} />
              ) : (
                <>
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Progress
                    </h2>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {Math.round(getProgressPercent())}%
                    </span>
                  </div>
                  <div className="mb-6">
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-500"
                        style={{ width: `${getProgressPercent()}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] font-medium text-gray-500">
                      <span>Start</span>
                      <span>Finish</span>
                    </div>
                  </div>
                  <ol
                    className="space-y-1"
                    role="list"
                    aria-label="Registration steps"
                  >
                    {steps.map((step, i) => {
                      const isCurrent = step.id === currentStep;
                      const isComplete = isStepComplete(step.id);
                      const clickable = canNavigateTo(step.id);
                      return (
                        <li key={step.id} className="relative pl-10">
                          {!(i === steps.length - 1) && (
                            <span
                              className="absolute left-4 top-8 block h-[calc(100%-0.5rem)] w-px bg-gray-200"
                              aria-hidden="true"
                            />
                          )}
                          {!(i === steps.length - 1) && (
                            <span
                              className={`absolute left-4 top-8 block w-px bg-blue-500 transition-all duration-500 ${isComplete ? "h-[calc(100%-0.5rem)]" : isCurrent ? "h-4" : "h-0"}`}
                              aria-hidden="true"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => clickable && setCurrentStep(step.id)}
                            className={`group flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition ${isCurrent ? "bg-blue-50 ring-1 ring-inset ring-blue-600/20" : isComplete ? "hover:bg-gray-50" : "opacity-60 hover:opacity-100"}`}
                            disabled={!clickable}
                            aria-current={isCurrent ? "step" : undefined}
                          >
                            <span
                              className={`absolute left-0 top-2 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition ${isCurrent ? "border-blue-600 bg-blue-600 text-white" : isComplete ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white text-gray-500"}`}
                            >
                              {isComplete ? (
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    d="M5 11l3 3 7-7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : (
                                i + 1
                              )}
                            </span>
                            <span className="ml-2 flex flex-col">
                              <span
                                className={`text-sm font-medium ${isCurrent ? "text-blue-700" : isComplete ? "text-gray-800" : "text-gray-600"}`}
                              >
                                {step.name}
                              </span>
                              <span className="text-xs text-gray-500 line-clamp-2">
                                {step.description}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
                    Account creation marked complete. Continue the remaining
                    steps to finish onboarding.
                  </div>
                </>
              )}
            </aside>
          )}
          <main className="flex-1">
            {/* Desktop Stepper only - hidden on mobile */}
            <div className="hidden lg:block">
              {initialLoading ? (
                <StepperSkeleton steps={steps} />
              ) : currentStep !== "completed" ? (
                <RegistrationStepper
                  steps={steps}
                  currentStepId={currentStep}
                  onStep={(id) => {
                    if (!canNavigateTo(id)) return;
                    setCurrentStep(id);
                  }}
                />
              ) : null}
            </div>
            <div className="min-h-[320px]">
              {initialLoading ? (
                <FormSkeleton />
              ) : loadError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {loadError}{" "}
                  <button
                    onClick={() => location.reload()}
                    className="ml-2 underline"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {saveError && (
                    <div className="mb-4 rounded-md border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
                      {saveError}
                    </div>
                  )}
                  {renderStep()}
                </>
              )}
            </div>

            {/* Mobile bottom grid removed as requested for single progress bar experience */}
          </main>
        </div>
      </div>
    </div>
  );
}
