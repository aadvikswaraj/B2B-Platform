"use client";
import { useForm } from "react-hook-form";

export default function BusinessDetailsFormRHF({ defaultValues = {}, onBack, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      companyName: "",
      businessPan: "",
      businessCategory: "",
      gstin: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      ...defaultValues,
    },
    mode: "onTouched",
  });

  const onValid = (data) => onSubmit?.(data);

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-gray-900">Business Details</h2>
        <p className="text-xs text-gray-500">We’ll use this to set up your seller profile.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-gray-700">Company Name</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Registered business name"
            {...register("companyName", { required: "Required" })}
          />
          {errors.companyName && (
            <span className="text-xs text-rose-600">{errors.companyName.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-700">Business PAN</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm uppercase"
            maxLength={10}
            placeholder="ABCDE1234F"
            {...register("businessPan", { required: "Required", pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, message: "Invalid PAN" } })}
          />
          {errors.businessPan && (
            <span className="text-xs text-rose-600">{errors.businessPan.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-700">Category</span>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register("businessCategory", { required: "Select one" })}
          >
            <option value="">Select…</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="trading">Trading</option>
            <option value="services">Services</option>
          </select>
          {errors.businessCategory && (
            <span className="text-xs text-rose-600">{errors.businessCategory.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-700">GSTIN (optional)</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm uppercase"
            maxLength={15}
            placeholder="15-digit GSTIN"
            {...register("gstin", { pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: "Invalid GSTIN" } })}
          />
          {errors.gstin && (
            <span className="text-xs text-rose-600">{errors.gstin.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-gray-700">Address</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Street, locality"
            {...register("address", { required: "Required" })}
          />
          {errors.address && (
            <span className="text-xs text-rose-600">{errors.address.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-700">City</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register("city", { required: "Required" })}
          />
          {errors.city && <span className="text-xs text-rose-600">{errors.city.message}</span>}
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-700">State</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register("state", { required: "Required" })}
          />
          {errors.state && <span className="text-xs text-rose-600">{errors.state.message}</span>}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-700">PIN Code</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            inputMode="numeric"
            maxLength={6}
            {...register("pinCode", { required: "Required", pattern: { value: /^\d{6}$/, message: "6 digits" } })}
          />
          {errors.pinCode && <span className="text-xs text-rose-600">{errors.pinCode.message}</span>}
        </label>
      </div>

      <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-between gap-3 border-t border-gray-200 bg-white/80 px-5 py-3 backdrop-blur sm:static sm:m-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button type="button" onClick={onBack} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Back
        </button>
        <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          Save & Continue
        </button>
      </div>
    </form>
  );
}
