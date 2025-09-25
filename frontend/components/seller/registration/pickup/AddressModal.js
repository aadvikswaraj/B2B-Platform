"use client";
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';

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
            <FormField label="Address Line 1" htmlFor="line1" required error={errors.line1?.message}>
              <Input id="line1" placeholder="Building, street" invalid={!!errors.line1} {...register('line1', { required: 'Required' })} />
            </FormField>
            <FormField label="Address Line 2" htmlFor="line2" error={errors.line2?.message}>
              <Input id="line2" placeholder="Area, landmark (optional)" {...register('line2')} />
            </FormField>
            <FormField label="City" htmlFor="city" required error={errors.city?.message}>
              <Input id="city" placeholder="City" invalid={!!errors.city} {...register('city', { required: 'Required' })} />
            </FormField>
            <FormField label="State" htmlFor="state" required error={errors.state?.message}>
              <Input id="state" placeholder="State" invalid={!!errors.state} {...register('state', { required: 'Required' })} />
            </FormField>
            <FormField label="Pincode" htmlFor="pincode" required error={errors.pincode?.message}>
              <Input id="pincode" placeholder="6-digit pincode" inputMode="numeric" invalid={!!errors.pincode} {...register('pincode', { required: 'Required', pattern: { value: /^\d{6}$/, message: 'Enter 6 digits' } })} />
            </FormField>
            <FormField label="Contact Name" htmlFor="contactName" required error={errors.contactName?.message}>
              <Input id="contactName" placeholder="Pickup contact" invalid={!!errors.contactName} {...register('contactName', { required: 'Required' })} />
            </FormField>
            <FormField label="Contact Phone" htmlFor="contactPhone" required error={errors.contactPhone?.message}>
              <Input id="contactPhone" placeholder="10-digit mobile" inputMode="numeric" invalid={!!errors.contactPhone} {...register('contactPhone', { required: 'Required', pattern: { value: /^\d{10}$/, message: 'Enter 10 digits' } })} />
            </FormField>
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
