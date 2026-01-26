"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input, Select } from "@/components/ui/Input";
import { INDIAN_STATES } from "@/data/indianStates";
import { X, ChevronLeft } from "lucide-react";

export const FIELD_SPECS = {
  name: {
    label: "Full Name",
    type: "text",
    maxLength: 100,
    required: true,
  },
  phone: {
    label: "Phone Number",
    type: "tel",
    test: /^[6-9]\d{9}$/,
    required: true,
    placeholder: "10-digit mobile number",
  },
  addressLine1: {
    label: "Address (House No, Building, Street, Area)",
    type: "text",
    maxLength: 100,
    required: true,
  },
  addressLine2: {
    label: "Address Line 2 (Optional)",
    type: "text",
    maxLength: 100,
  },
  landmark: { label: "Landmark (Optional)", type: "text", maxLength: 100 },
  city: {
    label: "City / District",
    type: "text",
    maxLength: 100,
    required: true,
  },
  state: {
    label: "State",
    type: "select",
    options: INDIAN_STATES.map((state) => ({
      value: state.code,
      label: state.name,
    })),
    maxLength: 100,
    required: true,
  },
  pincode: {
    label: "Pincode",
    type: "number",
    test: /^[1-9][0-9]{5}$/,
    required: true,
  },
  country: {
    label: "Country",
    type: "text",
    required: true,
    defaultValue: "India",
    readOnly: true,
  },
};

function ModalContent({ onClose, onSave, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => () => reset(), [reset]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col sm:flex-row items-end sm:items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="sm:hidden p-1 -ml-1 text-slate-500 hover:bg-slate-100 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold text-slate-900">
              Add New Address
            </h3>
          </div>
          <button
            onClick={onClose}
            className="hidden sm:flex p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          <form
            id="address-form"
            className="space-y-5"
            onSubmit={handleSubmit((data) => onSave?.(data))}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {Object.entries(FIELD_SPECS).map(([name, spec]) => {
                const InputComponent = spec.type === "select" ? Select : Input;
                // Full width for address lines
                const isFullWidth = [
                  "addressLine1",
                  "addressLine2",
                  "landmark",
                ].includes(name);

                return (
                  <div
                    key={name}
                    className={
                      isFullWidth ? "col-span-1 sm:col-span-2" : "col-span-1"
                    }
                  >
                    <FormField
                      label={spec.label}
                      htmlFor={name}
                      required={spec.required}
                      error={errors[name]?.message}
                    >
                      <InputComponent
                        id={name}
                        autoComplete={name}
                        placeholder={spec.placeholder || spec.label}
                        size="lg" // Larger inputs for better touch targets
                        type={spec.type || "text"}
                        readOnly={spec.readOnly}
                        className="bg-white"
                        {...register(name, {
                          required: spec.required
                            ? `${spec.label} is required`
                            : false,
                          pattern: spec.test
                            ? {
                                value: spec.test,
                                message: `Invalid ${spec.label}`,
                              }
                            : undefined,
                          maxLength: spec.maxLength
                            ? {
                                value: spec.maxLength,
                                message: `${spec.label} cannot exceed ${spec.maxLength} chars`,
                              }
                            : undefined,
                        })}
                        value={
                          spec.defaultValue ? spec.defaultValue : undefined
                        }
                      >
                        {spec.type === "select"
                          ? spec.options?.map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))
                          : null}
                      </InputComponent>
                    </FormField>
                  </div>
                );
              })}
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:px-6 sm:py-4 bg-white border-t border-slate-100 flex gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="hidden sm:flex flex-1 sm:flex-none justify-center"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="address-form"
            loading={loading}
            className="flex-1 sm:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
          >
            Save Address
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AddressModal({ open, onClose, onSave, loading }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !open) return null;

  const portalRoot = document.getElementById("portal-root") || document.body;

  return createPortal(
    <ModalContent onClose={onClose} onSave={onSave} loading={loading} />,
    portalRoot,
  );
}
