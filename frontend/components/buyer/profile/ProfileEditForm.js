'use client';
import { useForm } from 'react-hook-form';
import FormField from '@/components/common/forms/FormField';
import { api } from '@/utils/api/base';
import { useState } from 'react';

export default function ProfileEditForm({ user, business, addressOptions, onClose, onSaved }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatarUrl: user?.avatarUrl || '',
      productCategories: (user?.productCategories || []).join(', '),
      socials: user?.socials || {},
      companyName: business?.companyName || '',
      businessType: business?.businessType || '',
      gstin: business?.gstin || '',
      pan: business?.pan || '',
      address: business?.address?._id || '',
      website: business?.website || '',
      description: business?.description || ''
    }
  });
  const [serverError, setServerError] = useState('');

  const onSubmit = async (values) => {
    setServerError('');
    // Save user fields
    const userPayload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      avatarUrl: values.avatarUrl,
      productCategories: values.productCategories?.split(',').map(s=>s.trim()).filter(Boolean) || [],
      socials: values.socials
    };
    // Save business fields
    const businessPayload = {
      companyName: values.companyName,
      businessType: values.businessType,
      gstin: values.gstin,
      pan: values.pan,
      address: values.address,
      website: values.website,
      description: values.description
    };
    // Save user
    const userRes = await api('/user/profile', { method: 'POST', body: userPayload });
    // Save business
    const businessRes = await api('/user/business-profile', { method: 'POST', body: businessPayload });
    if (!userRes.success || !businessRes.success) {
      setServerError(userRes.message || businessRes.message || 'Failed to save');
    } else {
      onSaved?.();
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto p-4 sm:p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{serverError}</div>}
          <FormField label="Name" error={errors.name?.message}>
            <input className="rounded-md border px-3 py-2 w-full" {...register('name', { required: 'Required' })} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <input className="rounded-md border px-3 py-2 w-full" type="email" {...register('email', { required: 'Required' })} />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <input className="rounded-md border px-3 py-2 w-full" inputMode="numeric" {...register('phone', { pattern: { value: /^\d{10}$/, message: '10 digits' } })} />
          </FormField>
          <FormField label="Avatar URL">
            <input className="rounded-md border px-3 py-2 w-full" {...register('avatarUrl')} />
          </FormField>
          <FormField label="Product Categories">
            <input className="rounded-md border px-3 py-2 w-full" placeholder="Comma separated" {...register('productCategories')} />
          </FormField>
          <FormField label="Socials">
            <input className="rounded-md border px-3 py-2 w-full mb-1" placeholder="LinkedIn" {...register('socials.linkedin')} />
            <input className="rounded-md border px-3 py-2 w-full mb-1" placeholder="Facebook" {...register('socials.facebook')} />
            <input className="rounded-md border px-3 py-2 w-full" placeholder="Twitter" {...register('socials.twitter')} />
          </FormField>
          <FormField label="Company Name">
            <input className="rounded-md border px-3 py-2 w-full" {...register('companyName')} />
          </FormField>
          <FormField label="Business Type">
            <select className="rounded-md border px-3 py-2 w-full" {...register('businessType')}>
              <option value="">Select…</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="trader">Trader</option>
              <option value="retailer">Retailer</option>
              <option value="service">Service</option>
            </select>
          </FormField>
          <FormField label="GSTIN">
            <input className="rounded-md border px-3 py-2 w-full" {...register('gstin')} />
          </FormField>
          <FormField label="PAN">
            <input className="rounded-md border px-3 py-2 w-full" {...register('pan')} />
          </FormField>
          <FormField label="Address">
            <select className="rounded-md border px-3 py-2 w-full" {...register('address')}>
              <option value="">Select address…</option>
              {addressOptions?.map(addr => (
                <option key={addr._id} value={addr._id}>{addr.addressLine1}, {addr.city}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Website">
            <input className="rounded-md border px-3 py-2 w-full" {...register('website')} />
          </FormField>
          <FormField label="Description">
            <textarea className="rounded-md border px-3 py-2 w-full" rows={3} {...register('description')} />
          </FormField>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center rounded-md bg-emerald-600 px-5 py-2 text-base font-medium text-white hover:bg-emerald-700 disabled:opacity-50">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
