"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import FormSection from "@/components/ui/FormSection";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input, Select } from "@/components/ui/Input";
import { INDIAN_STATES } from "@/data/indianStates";
// Shared field specs

export const FIELD_SPECS_SECTIONS = [
  {
    title: "Contact Information",
    description: "Who should we contact if the courier has questions?",
    fields: {
      name: {
        label: "Full Name",
        type: "text",
        maxLength: 100,
        required: true,
      },
      phone: {
        label: "Phone",
        type: "tel",
        test: /^[6-9]\d{9}$/,
        required: true,
      },
    },
  },
  {
    title: "Address Details",
    description: "Precise location details help ensure on-time delivery.",
    fields: {
      addressLine1: {
        label: "Address Line 1",
        type: "text",
        maxLength: 100,
        required: true,
      },
      addressLine2: { label: "Address Line 2", type: "text", maxLength: 100 },
      landmark: { label: "Landmark", type: "text", maxLength: 100 },
      city: { label: "City", type: "text", maxLength: 100, required: true },
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
    },
  },
];

// ADDRESS_FIELD_SPECS is now obsolete; use FIELD_SPECS_SECTIONS

/**
 * AddressForm
 * Props:
 *  - initial: object with initial field values
 *  - onSubmit: async (values) => { success, message }
 *  - saving: boolean (external saving state) OR component manages if omitted
 *  - submitLabel: custom button label
 *  - cancelLabel: label for cancel button (optional)
 *  - onCancel: handler when cancel clicked
 *  - showCancel: boolean (default true)
 */
export default function AddressForm({
  initial,
  submitting,
  submitLabel = "Save Address",
  onSubmit,
}) {
  // Build defaultValues from FIELD_SPECS_SECTIONS
  const defaultValues = {};
  FIELD_SPECS_SECTIONS.forEach((section) => {
    Object.entries(section.fields).forEach(([name, spec]) => {
      defaultValues[name] =
        initial && initial[name] !== undefined
          ? initial[name]
          : spec.defaultValue || "";
    });
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form
      onSubmit={handleSubmit(async (data) => await onSubmit?.(data))}
      className="space-y-8"
      id="address-form"
    >
      {FIELD_SPECS_SECTIONS.map((section, idx) => (
        <FormSection
          key={idx}
          title={section.title}
          description={section.description}
          className="border-gray-200"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {Object.entries(section.fields).map(([name, spec]) => {
              const InputComponent = spec.type === "select" ? Select : Input;

              return (
                <FormField
                  key={name}
                  label={spec.label}
                  htmlFor={name}
                  required={spec.required}
                  error={errors[name]?.message}
                >
                  <InputComponent
                    id={name}
                    autoComplete={name}
                    placeholder={spec.label}
                    size="md"
                    type={spec.type || "text"}
                    readOnly={spec.readOnly}
                    {...register(name, {
                      required: spec.required
                        ? `${spec.label} required`
                        : false,
                      pattern: spec.test
                        ? { value: spec.test, message: `Invalid ${spec.label}` }
                        : undefined,
                      maxLength: spec.maxLength
                        ? {
                            value: spec.maxLength,
                            message: `${spec.label} max length ${spec.maxLength}`,
                          }
                        : undefined,
                      minLength: spec.minLength
                        ? {
                            value: spec.minLength,
                            message: `${spec.label} min length ${spec.minLength}`,
                          }
                        : undefined,
                    })}
                  >
                    {/* ✅ Render children ONLY if it's a select */}
                    {spec.type === "select"
                      ? spec.options?.map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))
                      : null}
                  </InputComponent>
                </FormField>
              );
            })}
          </div>
        </FormSection>
      ))}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
