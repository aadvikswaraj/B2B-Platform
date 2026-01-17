"use client";
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input, Select } from '@/components/ui/Input';
import { INDIAN_STATES } from '@/data/indianStates';


export const FIELD_SPECS = {
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
  }
};

function ModalContent({ onClose, onSave, loading }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  useEffect(() => () => reset(), [reset]);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-xl p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Add Pickup Address</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100">✕</button>
        </div>
        <form
          className="space-y-3"
          onSubmit={handleSubmit((data) => onSave?.(data))}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(FIELD_SPECS).map(([name, spec]) => {
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
                    value={spec.defaultValue ? spec.defaultValue : undefined}
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
              );
            })}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" loading={loading}>Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddressModal({ open, onClose, onSave, loading }) {
  if (!open) return null;
  if (typeof window === 'undefined') return null;
  const portalRoot = document.getElementById('portal-root') || (() => {
    const el = document.createElement('div');
    el.id = 'portal-root';
    document.body.appendChild(el);
    return el;
  })();
  return createPortal(
    <ModalContent onClose={onClose} onSave={onSave} loading={loading} />,
    portalRoot
  );
}
