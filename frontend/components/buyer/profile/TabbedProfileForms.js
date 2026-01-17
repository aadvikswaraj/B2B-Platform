'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField from '@/components/common/forms/FormField';
import { api } from '@/utils/api/base';
import { employeeCountOptions, annualTurnoverOptions, businessCategoryOptions } from '@/data/businessDetails';


const TABS = [
  { key: 'personal', label: 'Personal Details' },
  { key: 'business', label: 'Business Details' },
  { key: 'additional', label: 'Additional Details' }
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

export default function TabbedProfileForms({ user, business, addresses = [], onSaved }){
  const [activeTab, setActiveTab] = useState('personal');
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({ mode: 'onTouched' });
  const [serverError, setServerError] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Initialize form from props
  useEffect(() => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      companyName: business?.companyName || '',
      gstin: business?.gstin || '',
      pan: business?.pan || '',
      website: business?.website || '',
      description: business?.description || '',
      addressId: business?.address?._id || '',
      contactPersonName: business?.contactPersonName || '',
      designation: business?.designation || '',
      ceo: business?.ceo || '',
      businessCategory: business?.businessCategory || '',
      employeeCount: business?.employeeCount || '',
      annualTurnover: business?.annualTurnover || '',
    });
  }, [user, business, reset]);

  const businessVerification = business?.verification?.status || 'pending';
  const addressOptions = useMemo(() => addresses.map(a => ({ value: a._id, label: `${a.addressLine1}, ${a.city}, ${a.state} ${a.pincode}` })), [addresses]);

  const savePersonal = async (values) => {
    const payload = {
      name: values.name,
      phone: values.phone,
      // email could be editable if allowed by backend; keeping excluded by default
    };
    return api('/user/profile', { method: 'POST', body: payload });
  };

  const saveBusiness = async (values) => {
    const payload = {
      companyName: values.companyName,
      gstin: values.gstin,
      pan: values.pan,
      website: values.website,
      description: values.description,
      address: values.addressId || undefined,
      // businessCategory saved in Additional tab via seller registration flow
    };
    return api('/user/profile', { method: 'POST', body: payload });
  };

  const saveAdditional = async (values) => {
    const payload = {
      step: 'additionalDetails',
      contactPerson: values.contactPersonName,
      businessCategory: values.businessCategory,
      employeeCount: values.employeeCount,
      annualTurnover: values.annualTurnover,
      description: values.description,
    };
    return api('/seller/registration/save-step', { method: 'POST', body: payload });
  };

  const onSubmit = async (values) => {
    setServerError('');
    setServerMessage('');
    let res;
    if (activeTab === 'personal') res = await savePersonal(values);
    if (activeTab === 'business') res = await saveBusiness(values);
    if (activeTab === 'additional') res = await saveAdditional(values);
    if (!res?.success) {
      setServerError(res?.message || 'Failed to save');
    } else {
      setServerMessage('Saved successfully');
      onSaved && onSaved();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow w-full">
      <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Profile photo + company logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="block">
              <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden ring-1 ring-gray-200 shadow-sm flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {avatarPreview ? (
                  <img alt="Profile photo" src={avatarPreview} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xl">👤</span>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e)=>{
                const file = e.target.files?.[0];
                if(file){ setAvatarPreview(URL.createObjectURL(file)); }
              }} />
              <div className="text-xs text-emerald-700 mt-1">Tap to update photo</div>
            </label>
            <div className="h-6 w-px bg-gray-200" />
            <label className="block">
              <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden ring-1 ring-gray-200 shadow-sm flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {logoPreview ? (
                  <img alt="Company logo" src={logoPreview} className="h-full w-full object-contain p-1" />
                ) : (
                  <span className="text-gray-400 text-xl">🏢</span>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e)=>{
                const file = e.target.files?.[0];
                if(file){ setLogoPreview(URL.createObjectURL(file)); }
              }} />
              <div className="text-xs text-emerald-700 mt-1">Tap to update logo</div>
            </label>
          </div>
        </div>
        <div className="sm:ml-auto text-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-200">
            <span className={`h-2 w-2 rounded-full ${businessVerification==='verified' ? 'bg-emerald-600' : businessVerification==='rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
            Business {businessVerification}
          </div>
        </div>
      </div>
      <TabNav active={activeTab} setActive={setActiveTab} />
      <form onSubmit={handleSubmit(onSubmit)} className="p-3 sm:p-6 space-y-4">
        {serverError && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{serverError}</div>}
        {serverMessage && <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{serverMessage}</div>}

        {activeTab === 'personal' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <FormField label="Full Name" error={errors.name?.message}>
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('name', { required: 'Required', minLength: { value: 2, message: 'Too short' } })} />
            </FormField>
            <FormField label="Email (login)" error={errors.email?.message}>
              <input className="rounded-md border border-gray-200 bg-gray-50 px-3 py-3 text-sm w-full" disabled {...register('email')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" inputMode="numeric" placeholder="10 digits" {...register('phone', { pattern: { value: /^\d{10}$/, message: '10 digits' } })} />
            </FormField>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <FormField label="Company Name">
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('companyName')} />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="GSTIN" error={errors.gstin?.message}>
                <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full uppercase" placeholder="22AAAAA0000A1Z5" {...register('gstin', { pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GSTIN' } })} />
              </FormField>
              <FormField label="PAN" error={errors.pan?.message}>
                <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full uppercase" placeholder="AAAAA0000A" {...register('pan', { pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN' } })} />
              </FormField>
            </div>
            <FormField label="Website">
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" placeholder="https://example.com" {...register('website')} />
            </FormField>
            <FormField label="Registered Address">
              <select className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('addressId')}>
                <option value="">Select from your addresses…</option>
                {addressOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="About Your Business" error={errors.description?.message}>
              <textarea rows={4} className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm" placeholder="What do you do?" {...register('description', { maxLength: { value: 500, message: 'Max 500 chars' } })} />
            </FormField>
          </div>
        )}

        {activeTab === 'additional' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <FormField label="Contact Person Name">
              <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('contactPersonName')} />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Designation">
                <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('designation')} />
              </FormField>
              <FormField label="CEO / Proprietor">
                <input className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('ceo')} />
              </FormField>
            </div>
            <FormField label="Business Category">
              <select className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('businessCategory')}>
                <option value="">Select…</option>
                {businessCategoryOptions.map((o)=> (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Employee Count">
                <select className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('employeeCount')}>
                  <option value="">Select…</option>
                  {employeeCountOptions.map((o)=> (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Annual Turnover">
                <select className="rounded-md border border-gray-300 px-3 py-3 text-sm w-full" {...register('annualTurnover')}>
                  <option value="">Select…</option>
                  {annualTurnoverOptions.map((o)=> (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center rounded-md bg-emerald-600 px-5 py-3 text-base font-medium text-white hover:bg-emerald-700 disabled:opacity-50">Save Changes</button>
        </div>
        <p className="text-xs text-gray-400">Profile photo and logo upload UI is ready. We’ll enable saving once the upload endpoint is available.</p>
      </form>
    </div>
  );
}
