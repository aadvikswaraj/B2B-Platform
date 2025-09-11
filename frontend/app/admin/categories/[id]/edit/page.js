"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import CategoryAPI from '@/utils/api/categories';
import CategoryForm from '@/components/admin/categories/CategoryForm';

export default function EditCategoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const c = await CategoryAPI.get(id); setCategory(c); } catch (e) { setError(e.message); }
    setLoading(false);
  }, [id]);

  useEffect(() => { if (id) load(); }, [id, load]);

  if (loading) {
    return <div className="max-w-3xl mx-auto py-10 text-xs text-gray-500">Loading category...</div>;
  }
  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={() => router.push('/admin/categories')} className="text-xs text-blue-600 hover:underline">Back to list</button>
      </div>
    );
  }
  if (!category) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-4">
        <p className="text-sm text-red-600">Category not found.</p>
        <button onClick={() => router.push('/admin/categories')} className="text-xs text-blue-600 hover:underline">Back to list</button>
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
        <button onClick={() => router.push('/admin/categories')} className="text-xs text-blue-600 hover:underline">Back to list</button>
      </div>
      <CategoryForm
        mode="edit"
        initial={category}
        onCancel={() => router.push('/admin/categories')}
        onSubmit={async (data) => {
          try {
            const payload = {
              name: data.name,
              slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: data.description,
              parentCategory: data.parentCategory || null,
              specifications: data.specifications?.map(s => ({ name: s.name, type: s.type || 'text', required: !!s.required, options: s.options ? String(s.options).split(',').map(o => o.trim()).filter(Boolean) : [] })),
              commission: data.commission
            };
            await CategoryAPI.update(category._id, payload);
            router.push('/admin/categories');
          } catch (e) { alert(e.message); }
        }}
      />
    </div>
  );
}
