"use client";
import { useParams, useRouter } from 'next/navigation';
import { useCategoryStore } from '@/components/admin/categories/useCategoryStore';
import CategoryForm from '@/components/admin/categories/CategoryForm';
import { useMemo } from 'react';

export default function EditCategoryPage(){
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { categories, updateCategory, getById } = useCategoryStore();
  const category = getById(id);

  const parentCategory = useMemo(()=> category ? categories.find(c => c.id === category.parent) : null, [category, categories]);

  if(!category){
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-4">
        <p className="text-sm text-red-600">Category not found.</p>
        <button onClick={()=>router.push('/admin/categories')} className="text-xs text-blue-600 hover:underline">Back to list</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Edit Category</h1>
          <p className="text-xs text-gray-500">Editing: <span className="font-semibold">{category.name}</span></p>
        </div>
        <button onClick={()=>router.push('/admin/categories')} className="text-xs text-blue-600 hover:underline">Back to list</button>
      </div>
      <CategoryForm
        mode="edit"
        initial={category}
        parentCategory={parentCategory}
        categories={categories}
        onCancel={()=>router.push('/admin/categories')}
        onSubmit={(data)=>{ updateCategory(category.id, data); router.push('/admin/categories'); }}
      />
    </div>
  );
}
