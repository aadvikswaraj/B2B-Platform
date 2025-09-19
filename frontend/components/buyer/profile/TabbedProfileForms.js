'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField from '@/components/common/forms/FormField';
import { api } from '@/utils/api/base';

const TABS = [
  { key: 'personal', label: 'Personal Details' },
  { key: 'business', label: 'Business Details' },
  { key: 'social', label: 'Social Links' }
];


function TabNav({ active, setActive }){
  return (
    <nav className="flex border-b overflow-x-auto scrollbar-none bg-white sticky top-0 z-10">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors min-w-[140px] whitespace-nowrap ${active===tab.key ? 'border-emerald-600 text-emerald-700 bg-emerald-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          onClick={()=>setActive(tab.key)}
        >{tab.label}</button>
      ))}
    </nav>
  );
}

export default function TabbedProfileForms(){
  const [activeTab, setActiveTab] = useState('personal');
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
    <div className="bg-white rounded-lg shadow w-full">
      <TabNav active={activeTab} setActive={setActiveTab} />
      <form onSubmit={handleSubmit(onSubmit)} className="p-3 sm:p-6 space-y-4">
        {serverError && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{serverError}</div>}
        {activeTab === 'personal' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <FormField label="First Name" error={errors.firstName?.message}>
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('firstName', { required: 'Required' })} />
            </FormField>
            <FormField label="Last Name" error={errors.lastName?.message}>
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('lastName')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" inputMode="numeric" {...register('phone', { pattern: { value: /^\d{10}$/, message: '10 digits' } })} />
            </FormField>
          </div>
        )}
        {activeTab === 'business' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <FormField label="Company Name" error={errors.companyName?.message}>
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('companyName')} />
            </FormField>
            <FormField label="Business Category" error={errors.businessCategory?.message}>
              <select className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('businessCategory')}>
                <option value="">Select…</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="trading">Trading</option>
                <option value="services">Services</option>
              </select>
            </FormField>
            <FormField label="Website">
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('website')} />
            </FormField>
            <FormField label="Product Categories">
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" placeholder="Comma separated" {...register('productCategories')} />
            </FormField>
            <FormField label="About Your Business" error={errors.description?.message}>
              <textarea rows={4} className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm" {...register('description', { maxLength: { value: 500, message: 'Max 500 chars' } })} />
            </FormField>
          </div>
        )}
        {activeTab === 'social' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <FormField label="LinkedIn">
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('linkedin')} />
            </FormField>
            <FormField label="Facebook">
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('facebook')} />
            </FormField>
            <FormField label="Twitter/X">
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('twitter')} />
            </FormField>
          </div>
        )}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center rounded-md bg-emerald-600 px-5 py-3 text-base font-medium text-white hover:bg-emerald-700 disabled:opacity-50">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
