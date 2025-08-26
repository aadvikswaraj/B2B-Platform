"use client";
import CategoryForm from '@/components/admin/categories/CategoryForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

// TODO: Replace this with your backend API call or state management logic
async function addCategory(data) {
  // Example: await fetch('/api/categories', { method: 'POST', body: JSON.stringify(data) })
  // For now, just log to console
  console.log('Category to add:', data);
}

export default function NewCategoryPage(){
  const router = useRouter();
  const params = useSearchParams();
  const parentId = params.get('parent');
  // const parentCategory = useMemo(()=> categories.find(c => c.id === parentId) || null, [categories, parentId]);

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Create Category</h1>
          {/* {parentCategory && <p className="text-xs text-gray-500">Adding sub-category under <span className="font-semibold">{parentCategory.name}</span></p>} */}
        </div>
        <button onClick={()=>router.push('/admin/categories')} className="text-xs text-blue-600 hover:underline">Back to list</button>
      </div>
      <CategoryForm
        mode="create"
        onCancel={()=>router.push('/admin/categories')}
        onSubmit={async (data)=>{ await addCategory(data); router.push('/admin/categories'); }}
      />
    </div>
  );
}
