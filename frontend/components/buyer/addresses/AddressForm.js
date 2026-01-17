"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import FormSection from "@/components/ui/FormSection";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input, Select } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
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
  const buildDefaults = (src) => {
    const dv = {};
    FIELD_SPECS_SECTIONS.forEach((section) => {
      Object.entries(section.fields).forEach(([name, spec]) => {
        dv[name] =
          src && src[name] !== undefined ? src[name] : spec.defaultValue || "";
      });
    });
    dv.isDefault =
      src && typeof src.isDefault !== "undefined" ? !!src.isDefault : false;
    return dv;
  };
  const defaultValues = buildDefaults(initial);
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  // When initial changes (edit page), sync values
  useEffect(() => {
    reset(buildDefaults(initial));
  }, [initial, reset]);

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit?.(data))}
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
      {/* Preferences */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Set as default address
          </p>
          <p className="text-xs text-gray-600">
            Use this address by default for orders and shipping.
          </p>
        </div>
        <Controller
          name="isDefault"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Toggle
              checked={!!value}
              onChange={onChange}
              disabled={submitting}
              aria-label="Toggle default address"
            />
          )}
        />
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}