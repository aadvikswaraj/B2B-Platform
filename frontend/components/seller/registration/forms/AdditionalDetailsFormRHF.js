"use client";
import { useForm } from "react-hook-form";

export default function AdditionalDetailsFormRHF({ defaultValues = {}, onBack, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      contactPerson: "",
      phoneNumber: "",
      businessCategory: "",
      productCategories: [],
      description: "",
      ...defaultValues,
    },
    mode: "onTouched",
  });

  const submit = (data) => onSubmit?.(data);

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-gray-900">Additional Info</h2>
        <p className="text-xs text-gray-500">Tell buyers more about your business. All fields are mobile-friendly.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-700">Contact Person</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Full name"
            {...register("contactPerson", { required: "Required" })}
          />
          {errors.contactPerson && (
            <span className="text-xs text-rose-600">{errors.contactPerson.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-700">Phone Number</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="10-digit mobile"
            inputMode="numeric"
            {...register("phoneNumber", {
              required: "Required",
              pattern: { value: /^\d{10}$/, message: "Enter 10 digits" },
            })}
          />
          {errors.phoneNumber && (
            <span className="text-xs text-rose-600">{errors.phoneNumber.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-gray-700">Business Category</span>
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

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-gray-700">Product Categories</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Comma separated (e.g., bearings, pumps)"
            {...register("productCategories")}
          />
          <span className="text-[11px] text-gray-500">Tip: keep it short and relevant.</span>
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-gray-700">About Your Business</span>
          <textarea
            rows={4}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Short description that appears on your store."
            {...register("description", { maxLength: { value: 500, message: "Max 500 chars" } })}
          />
          {errors.description && (
            <span className="text-xs text-rose-600">{errors.description.message}</span>
          )}
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
