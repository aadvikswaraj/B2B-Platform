"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import FormField from "@/components/common/forms/FormField";
import ProfileSection from "@/components/common/profile/ProfileSection";
import ProfilePhotoUploader from "@/components/common/profile/ProfilePhotoUploader";
import LogoUploader from "@/components/common/profile/LogoUploader";
import { api } from "@/utils/api/base";
import {
  employeeCountOptions,
  annualTurnoverOptions,
  businessCategoryOptions,
} from "@/data/businessDetails";
import {
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

/**
 * Unified Profile Form Component
 *
 * Senior-level UI/UX design with:
 * - Hero header with avatar + logo
 * - Section-based layout (non-tabbed)
 * - Per-section save functionality
 * - Fully responsive mobile-first design
 */
export default function UnifiedProfileForm({
  user,
  business,
  addresses = [],
  onSaved,
  mode = "buyer", // 'buyer' | 'seller'
}) {
  const [sectionStatus, setSectionStatus] = useState({
    personal: { loading: false, error: "", success: "" },
    business: { loading: false, error: "", success: "" },
    additional: { loading: false, error: "", success: "" },
  });

  const [avatarFileId, setAvatarFileId] = useState(null);
  const [logoFileId, setLogoFileId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  // Initialize form from props
  useEffect(() => {
    reset({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      companyName: business?.companyName || "",
      gstin: business?.gstin || "",
      pan: business?.pan || "",
      website: business?.website || "",
      description: business?.description || "",
      addressId: business?.address?._id || "",
      contactPersonName: business?.contactPersonName || "",
      designation: business?.designation || "",
      ceo: business?.ceo || "",
      businessCategory: business?.businessCategory || "",
      employeeCount: business?.employeeCount || "",
      annualTurnover: business?.annualTurnover || "",
    });
    setAvatarFileId(user?.avatar || null);
    setLogoFileId(business?.logo || null);
  }, [user, business, reset]);

  const businessVerification = business?.verification?.status || "pending";
  const addressOptions = useMemo(
    () =>
      addresses.map((a) => ({
        value: a._id,
        label: `${a.addressLine1}, ${a.city}, ${a.state} ${a.pincode}`,
      })),
    [addresses],
  );

  const watchName = watch("name");
  const watchCompanyName = watch("companyName");

  // Save handlers for each section
  const savePersonal = async () => {
    const values = watch();
    setSectionStatus((s) => ({
      ...s,
      personal: { loading: true, error: "", success: "" },
    }));

    try {
      const payload = {
        name: values.name,
        phone: values.phone,
        avatar: avatarFileId,
      };
      const res = await api("/user/profile", { method: "POST", body: payload });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to save");
      }

      setSectionStatus((s) => ({
        ...s,
        personal: { loading: false, error: "", success: "Saved successfully!" },
      }));
      onSaved?.();

      // Clear success after 3s
      setTimeout(() => {
        setSectionStatus((s) => ({
          ...s,
          personal: { ...s.personal, success: "" },
        }));
      }, 3000);
    } catch (err) {
      setSectionStatus((s) => ({
        ...s,
        personal: { loading: false, error: err.message, success: "" },
      }));
    }
  };

  const saveBusiness = async () => {
    const values = watch();
    setSectionStatus((s) => ({
      ...s,
      business: { loading: true, error: "", success: "" },
    }));

    try {
      const payload = {
        companyName: values.companyName,
        gstin: values.gstin,
        pan: values.pan,
        website: values.website,
        description: values.description,
        address: values.addressId || undefined,
        logo: logoFileId,
      };
      const res = await api("/user/profile", { method: "POST", body: payload });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to save");
      }

      setSectionStatus((s) => ({
        ...s,
        business: { loading: false, error: "", success: "Saved successfully!" },
      }));
      onSaved?.();

      setTimeout(() => {
        setSectionStatus((s) => ({
          ...s,
          business: { ...s.business, success: "" },
        }));
      }, 3000);
    } catch (err) {
      setSectionStatus((s) => ({
        ...s,
        business: { loading: false, error: err.message, success: "" },
      }));
    }
  };

  const saveAdditional = async () => {
    const values = watch();
    setSectionStatus((s) => ({
      ...s,
      additional: { loading: true, error: "", success: "" },
    }));

    try {
      const payload = {
        step: "additionalDetails",
        contactPerson: values.contactPersonName,
        businessCategory: values.businessCategory,
        employeeCount: values.employeeCount,
        annualTurnover: values.annualTurnover,
        description: values.description,
      };
      const res = await api("/seller/registration/save-step", {
        method: "POST",
        body: payload,
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to save");
      }

      setSectionStatus((s) => ({
        ...s,
        additional: {
          loading: false,
          error: "",
          success: "Saved successfully!",
        },
      }));
      onSaved?.();

      setTimeout(() => {
        setSectionStatus((s) => ({
          ...s,
          additional: { ...s.additional, success: "" },
        }));
      }, 3000);
    } catch (err) {
      setSectionStatus((s) => ({
        ...s,
        additional: { loading: false, error: err.message, success: "" },
      }));
    }
  };

  // Verification badge
  const VerificationBadge = () => {
    const configs = {
      verified: {
        icon: CheckBadgeIcon,
        text: "Verified",
        classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        dotColor: "bg-emerald-500",
      },
      rejected: {
        icon: ExclamationCircleIcon,
        text: "Rejected",
        classes: "bg-rose-50 text-rose-700 ring-rose-200",
        dotColor: "bg-rose-500",
      },
      pending: {
        icon: ClockIcon,
        text: "Pending",
        classes: "bg-amber-50 text-amber-700 ring-amber-200",
        dotColor: "bg-amber-500",
      },
    };
    const config = configs[businessVerification] || configs.pending;
    const Icon = config.icon;

    return (
      <div
        className={clsx(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1",
          config.classes,
        )}
      >
        <span className={clsx("h-2 w-2 rounded-full", config.dotColor)} />
        <Icon className="h-4 w-4" />
        <span>{config.text}</span>
      </div>
    );
  };

  // Save button component
  const SaveButton = ({ onClick, loading, error, success }) => (
    <div className="flex items-center gap-3">
      {error && <span className="text-sm text-rose-600">{error}</span>}
      {success && (
        <span className="text-sm text-emerald-600 flex items-center gap-1">
          <CheckBadgeIcon className="h-4 w-4" />
          {success}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={clsx(
          "inline-flex items-center gap-2 rounded-lg px-4 py-2.5",
          "bg-gradient-to-r from-emerald-600 to-teal-600",
          "text-sm font-medium text-white shadow-sm",
          "hover:from-emerald-700 hover:to-teal-700",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-200",
        )}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );

  // Input classes
  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
  const inputDisabledClasses =
    "bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200";
  const selectClasses =
    inputClasses +
    " appearance-none bg-[url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10";

  return (
    <div className="space-y-4">
      {/* Compact Profile Header */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-4 sm:p-5">
        <div className="flex items-center gap-4">
          {/* Profile Photo - Smaller */}
          <ProfilePhotoUploader
            value={avatarFileId}
            onChange={setAvatarFileId}
            name={watchName}
            size="md"
          />

          {/* Name & Email - Compact */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {watchName || "Your Name"}
            </h1>
            <p className="text-sm text-gray-500 truncate">
              {user?.email || "email@example.com"}
            </p>
          </div>

          {/* Company Logo - Compact */}
          <LogoUploader
            value={logoFileId}
            onChange={setLogoFileId}
            companyName={watchCompanyName}
          />
        </div>
      </div>

      {/* Personal Details Section */}
      <ProfileSection
        title="Personal Details"
        description="Your personal information"
        icon={UserIcon}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" error={errors.name?.message}>
              <input
                className={inputClasses}
                placeholder="Enter your full name"
                {...register("name", {
                  required: "Required",
                  minLength: { value: 2, message: "Too short" },
                })}
              />
            </FormField>
            <FormField label="Email (Login)" error={errors.email?.message}>
              <input
                className={clsx(inputClasses, inputDisabledClasses)}
                disabled
                {...register("email")}
              />
            </FormField>
          </div>
          <FormField label="Phone Number" error={errors.phone?.message}>
            <input
              className={clsx(inputClasses, "sm:max-w-xs")}
              inputMode="numeric"
              placeholder="10 digit mobile number"
              {...register("phone", {
                pattern: { value: /^\d{10}$/, message: "10 digits required" },
              })}
            />
          </FormField>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <SaveButton
              onClick={savePersonal}
              loading={sectionStatus.personal.loading}
              error={sectionStatus.personal.error}
              success={sectionStatus.personal.success}
            />
          </div>
        </div>
      </ProfileSection>

      {/* Business Details Section */}
      <ProfileSection
        title="Business Details"
        description="Your company information"
        icon={BuildingOfficeIcon}
      >
        <div className="space-y-5">
          <FormField label="Company Name">
            <input
              className={inputClasses}
              placeholder="Your company name"
              {...register("companyName")}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="GSTIN" error={errors.gstin?.message}>
              <input
                className={clsx(inputClasses, "uppercase")}
                placeholder="22AAAAA0000A1Z5"
                {...register("gstin", {
                  pattern: {
                    value:
                      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                    message: "Invalid GSTIN format",
                  },
                })}
              />
            </FormField>
            <FormField label="PAN" error={errors.pan?.message}>
              <input
                className={clsx(inputClasses, "uppercase")}
                placeholder="AAAAA0000A"
                {...register("pan", {
                  pattern: {
                    value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                    message: "Invalid PAN format",
                  },
                })}
              />
            </FormField>
          </div>

          <FormField label="Website">
            <input
              className={inputClasses}
              placeholder="https://yourcompany.com"
              {...register("website")}
            />
          </FormField>

          <FormField label="Registered Address">
            <select className={selectClasses} {...register("addressId")}>
              <option value="">Select from your addresses...</option>
              {addressOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="About Your Business"
            error={errors.description?.message}
          >
            <textarea
              rows={4}
              className={clsx(inputClasses, "resize-none")}
              placeholder="Tell us about your business, products, and services..."
              {...register("description", {
                maxLength: { value: 500, message: "Maximum 500 characters" },
              })}
            />
          </FormField>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <SaveButton
              onClick={saveBusiness}
              loading={sectionStatus.business.loading}
              error={sectionStatus.business.error}
              success={sectionStatus.business.success}
            />
          </div>
        </div>
      </ProfileSection>

      {/* Additional Details Section */}
      <ProfileSection
        title="Additional Details"
        description="More about your organization"
        icon={DocumentTextIcon}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Contact Person Name">
              <input
                className={inputClasses}
                placeholder="Primary contact name"
                {...register("contactPersonName")}
              />
            </FormField>
            <FormField label="Designation">
              <input
                className={inputClasses}
                placeholder="e.g. Director, Manager"
                {...register("designation")}
              />
            </FormField>
          </div>

          <FormField label="CEO / Proprietor">
            <input
              className={clsx(inputClasses, "sm:max-w-md")}
              placeholder="Name of CEO or Proprietor"
              {...register("ceo")}
            />
          </FormField>

          <FormField label="Business Category">
            <select className={selectClasses} {...register("businessCategory")}>
              <option value="">Select category...</option>
              {businessCategoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Employee Count">
              <select className={selectClasses} {...register("employeeCount")}>
                <option value="">Select range...</option>
                {employeeCountOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Annual Turnover">
              <select className={selectClasses} {...register("annualTurnover")}>
                <option value="">Select range...</option>
                {annualTurnoverOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <SaveButton
              onClick={saveAdditional}
              loading={sectionStatus.additional.loading}
              error={sectionStatus.additional.error}
              success={sectionStatus.additional.success}
            />
          </div>
        </div>
      </ProfileSection>

      {/* Footer Note */}
      <p className="text-center text-xs text-gray-400 pb-4">
        Your information is securely stored and never shared without permission.
      </p>
    </div>
  );
}
