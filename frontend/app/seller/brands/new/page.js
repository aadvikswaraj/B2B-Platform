"use client";
import React, { useState } from 'react';
import BrandForm from '@/components/seller/brands/BrandForm';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import FormSection from '@/components/ui/FormSection';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useAlert } from '@/components/ui/AlertManager';
import BrandsAPI from '@/utils/api/seller/brands';

export default function NewBrandPage(){
  const formId = 'brand-create-form';
  const router = useRouter();
    const pushAlert = useAlert();
    const [saving, setSaving] = useState(false);
    async function handleCreate(data) {
      setSaving(true);
      try {
        const serverResponse = await BrandsAPI.create(data);
        if (serverResponse.success) {
          pushAlert('success', 'Brand created successfully!');
          router.push('/seller/brands');
        } else if (["Failed to create brand: Brand with this name already exists for the user","Brand name already exists"].includes(serverResponse.message)) {
          pushAlert('error', 'Brand name already exists.');
        } else {
          pushAlert('error', 'Failed to create brand. Please try again.');
        }
      } catch (error) {
        console.error("Error creating brand:", error);
        pushAlert('error', 'Failed to create brand. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  return (
    <div className='my-5 space-y-6 max-w-5xl mx-auto px-3 sm:px-4 pb-24'>
      <PageHeader
        backHref='/seller/brands'
        backLabel='Brands'
        title='Add Brand'
        subtitle='Verified brands can be used when creating non-generic products.'
        primaryLabel={saving ? 'Submitting…' : 'Add Brand'}
        primaryIcon={CheckIcon}
        primaryDisabled={saving}
        onPrimary={() => document.getElementById(formId)?.requestSubmit()}
      />
      <BrandForm
        formId={formId}
        submitting={saving}
        onSubmit={handleCreate}
      />
    </div>
  );
}
