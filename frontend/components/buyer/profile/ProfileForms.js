'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField from '@/components/common/forms/FormField';
import { api } from '@/utils/api/base';

function Section({ title, subtitle, children }){
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ children }){
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

export default function ProfileForms(){
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ mode: 'onTouched' });
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      const res = await api('/user/profile');
      const p = res?.data?.profile || {};
      reset({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        phone: p.phone || '',
        companyName: p.companyName || '',
        businessCategory: p.businessCategory || '',
        website: p.website || '',
        productCategories: (p.productCategories||[]).join(', '),
        description: p.description || '',
        linkedin: p.socials?.linkedin || '',
        facebook: p.socials?.facebook || '',
        twitter: p.socials?.twitter || ''
      });
      setLoading(false);
    })();
  },[reset]);

  const onSubmit = async (values)=>{
    setServerError('');
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      companyName: values.companyName,
      businessCategory: values.businessCategory,
      website: values.website,
      productCategories: values.productCategories?.split(',').map(s=>s.trim()).filter(Boolean) || [],
      description: values.description,
      socials: {
        linkedin: values.linkedin,
        facebook: values.facebook,
        twitter: values.twitter
      }
    };
    const res = await api('/user/profile', { method: 'POST', body: payload });
    if(!res?.success){
      setServerError(res?.message || 'Failed to save');
    }
  };

  if(loading){
    return <div className="rounded-xl border p-8 bg-white">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{serverError}</div>}

      <Section title="Personal Details" subtitle="Basic information about you.">
        <Row>
          <FormField label="First Name" error={errors.firstName?.message}>
            <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('firstName', { required: 'Required' })} />
          </FormField>
          <FormField label="Last Name" error={errors.lastName?.message}>
            <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('lastName')} />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" inputMode="numeric" {...register('phone', { pattern: { value: /^\d{10}$/, message: '10 digits' } })} />
          </FormField>
        </Row>
      </Section>

      <Section title="Business Details" subtitle="Aligns with seller registration fields.">
        <Row>
          <FormField label="Company Name" error={errors.companyName?.message}>
            <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('companyName')} />
          </FormField>
          <FormField label="Business Category" error={errors.businessCategory?.message}>
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('businessCategory')}>
              <option value="">Select…</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="trading">Trading</option>
              <option value="services">Services</option>
            </select>
          </FormField>
          <FormField label="Website">
            <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('website')} />
          </FormField>
          <FormField label="Product Categories">
            <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Comma separated" {...register('productCategories')} />
          </FormField>
        </Row>
        <FormField label="About Your Business" error={errors.description?.message}>
          <textarea rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('description', { maxLength: { value: 500, message: 'Max 500 chars' } })} />
        </FormField>
      </Section>

      <Section title="Social Links">
        <Row>
          <FormField label="LinkedIn">
            <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('linkedin')} />
          </FormField>
          <FormField label="Facebook">
            <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('facebook')} />
          </FormField>
          <FormField label="Twitter/X">
            <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('twitter')} />
          </FormField>
        </Row>
      </Section>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">Save Profile</button>
      </div>
    </form>
  );
}
