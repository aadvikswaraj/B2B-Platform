"use client";
import ManagementPanel from '@/components/common/ManagementPanel';
import { useCategoryStore } from '@/components/admin/categories/useCategoryStore';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function CategoriesPage(){
  const { categories, deleteCategory, bulkDelete } = useCategoryStore();
  const [selected, setSelected] = useState([]);

  const parentOptions = useMemo(()=> categories.filter(c => !c.parent).map(c => ({ value: c.id, label: c.name })), [categories]);

  return (
    <div className="space-y-6">
      <ManagementPanel
        title="Category Management"
        items={categories}
        searchableKeys={['name','slug','description']}
        filters={[
          { key: 'parent', label: 'Parent', options: [{ value: 'null', label: 'Top Level' }, ...parentOptions] },
        ]}
        enableSorting
        initialSort={{ key: 'name', direction: 'asc' }}
        columns={[
          { key: 'name', header: 'Name', sortable: true, render: c => (
            <div>
              <p className="font-medium">{c.name}</p>
              {c.description && <p className="text-[11px] text-gray-500 line-clamp-1">{c.description}</p>}
            </div>
          ) },
          { key: 'slug', header: 'Slug', sortable: true, className: 'hidden md:table-cell text-xs text-gray-500' },
          { key: 'parent', header: 'Parent', sortable: false, render: c => {
            const parent = categories.find(x=>x.id===c.parent);
            return parent ? <span className="text-xs text-gray-600">{parent.name}</span> : <span className="text-[11px] text-gray-400 italic">Top</span>;
          } },
          { key: 'specs', header: 'Specs', render: c => (
            <div className="flex flex-wrap gap-1 max-w-[160px]">
              {c.specifications.slice(0,4).map((s,i)=>(
                <span key={i} className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 font-medium">{s.name}</span>
              ))}
              {c.specifications.length>4 && <span className="text-[10px] text-gray-500">+{c.specifications.length-4}</span>}
              {c.specifications.length===0 && <span className="text-[10px] italic text-gray-400">None</span>}
            </div>
          ) },
        ]}
        rowActions={(c) => [
          { label: 'Edit', onClick: () => window.location.href = `/admin/categories/${c.id}/edit`, icon: <PencilIcon className="h-4 w-4"/> },
          { label: 'Delete', onClick: () => deleteCategory(c.id), icon: <TrashIcon className="h-4 w-4"/> },
        ]}
        bulkActions={[{ key: 'delete', label: 'Delete', onClick: ids => bulkDelete(ids) }]}
        onSelectionChange={setSelected}
        primaryAction={{ label: 'New Category', onClick: () => window.location.href = '/admin/categories/new', icon: PlusIcon }}
      />
    </div>
  );
}
