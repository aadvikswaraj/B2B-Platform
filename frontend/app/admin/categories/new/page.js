"use client";
export const dynamic = 'force-dynamic'
import CategoryForm from '@/components/admin/categories/CategoryForm';
import PageHeaderSkeleton from '@/components/ui/skeletons/PageHeaderSkeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import CategoryAPI from '@/utils/api/categories';
import { Suspense, useState } from 'react';

function PageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const parentId = params.get('parent');
  const [error, setError] = useState(null);
  return (
    <div className="max-w-5xl mx-auto lg:px-6 py-4 sm:py-6 space-y-8">
      <CategoryForm
        mode="create"
        onSubmit={async (data)=>{ await addCategory(data); router.push('/admin/categories'); }}
      />
    </div>
  );
}

export default function NewCategoryPage(){
  return (
    <Suspense fallback={<PageHeaderSkeleton />}>
      <PageContent />
    </Suspense>
  );
}
