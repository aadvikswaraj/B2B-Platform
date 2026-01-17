"use client";
export const dynamic = 'force-dynamic'
import CategoryForm from '@/components/admin/categories/CategoryForm';
import PageHeaderSkeleton from '@/components/ui/skeletons/PageHeaderSkeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import CategoryAPI from '@/utils/api/admin/categories';
import { useState } from 'react';
import { useAlert } from '@/components/ui/AlertManager';

export default function NewCategoryPage(){
  const router = useRouter();
  const pushAlert = useAlert();
  const [saving, setSaving] = useState(false);
  async function handleCreate(data) {
    setSaving(true);
    try {
      if (data.acceptOrders === "yes") {
        data.acceptOrders = true;
        // commission is already an object from the form
      }
      else{
        data.acceptOrders = false;
        data.commission = null;
      }
      // specifications is already an array from the form
      const serverResponse = await CategoryAPI.create(data);
      if (serverResponse.success) {
        pushAlert('success', 'Category created successfully!');
        router.push('/admin/categories');
      } else if (serverResponse.message === "Category name already exists") {
        pushAlert('error', 'Category name already exists.');
      } else {
        pushAlert('error', 'Failed to create category. Please try again.');
      }
    } catch (error) {
      console.error("Error creating category:", error);
      pushAlert('error', 'Failed to create category. Please try again.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <CategoryForm
        submitting={saving}
        submitLabel={saving ? 'Saving...' : 'Create Category'}
        onSubmit={handleCreate}
        stickyMobileBar
      />
    </div>
  );
}
