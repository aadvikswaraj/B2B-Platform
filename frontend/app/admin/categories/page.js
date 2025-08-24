"use client";
import ManagementPanel from '@/components/common/ManagementPanel';
import useSampleList from '@/hooks/useSampleList';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';


// Mock categories array for demonstration
const categories = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Devices, gadgets, and accessories',
    parent: null,
    specifications: [
      { name: 'Brand' },
      { name: 'Model' },
      { name: 'Warranty' },
      { name: 'Color' },
      { name: 'Battery Life' },
    ],
  },
  {
    id: '2',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Portable computers',
    parent: '1',
    specifications: [
      { name: 'Processor' },
      { name: 'RAM' },
      { name: 'Storage' },
      { name: 'Screen Size' },
    ],
  },
  {
    id: '3',
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Mobile phones and accessories',
    parent: '1',
    specifications: [
      { name: 'Screen Size' },
      { name: 'Camera' },
      { name: 'Battery' },
    ],
  },
  {
    id: '4',
    name: 'Home Appliances',
    slug: 'home-appliances',
    description: 'Appliances for home use',
    parent: null,
    specifications: [
      { name: 'Power' },
      { name: 'Warranty' },
    ],
  },
  {
    id: '5',
    name: 'Kitchen',
    slug: 'kitchen',
    description: 'Kitchen appliances and tools',
    parent: '4',
    specifications: [],
  },
];

export default function CategoriesPage(){
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState({ search:'', filters:{}, page:1, pageSize:10, sort:{ key:'name', direction:'asc' } });
  const { items, totalCount } = useSampleList(categories, query, { searchableKeys:['name','slug','description'] });

  // Dummy delete and bulkDelete functions for demonstration
  const deleteCategory = (id) => alert('Delete category ' + id);
  const bulkDelete = (ids) => alert('Bulk delete: ' + ids.join(', '));

  return (
    <div className="space-y-6">
      <ManagementPanel
        title="Category Management"
        items={items}
        totalCount={totalCount}
        search={query.search}
        onSearchChange={v=>setQuery(q=>({ ...q, search:v, page:1 }))}
        filters={[
          { key: 'parent', label: 'Parent', options: [{ value: 'null', label: 'Top Level' }] },
        ]}
        activeFilters={query.filters}
        onFilterChange={f=>setQuery(q=>({ ...q, filters:f, page:1 }))}
        sort={query.sort}
        onSortChange={s=>setQuery(q=>({ ...q, sort:s, page:1 }))}
        enableSorting
        page={query.page}
        pageSize={query.pageSize}
        onPageChange={p=>setQuery(q=>({ ...q, page:p }))}
        onPageSizeChange={ps=>setQuery(q=>({ ...q, pageSize:ps, page:1 }))}
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
        rowActions={c => [
          { label: 'Edit', onClick: () => window.location.href = `/admin/categories/${c.id}/edit` },
          { label: 'Delete', onClick: () => deleteCategory(c.id) },
        ]}
        bulkActions={[{ key: 'delete', label: 'Delete', onClick: ids => bulkDelete(ids) }]}
        selectedIds={selected}
        onSelectionChange={setSelected}
        primaryActions={[
          { type:"link", label:'New Category', href:'/admin/categories/new', icon:PlusIcon }
        ]}
      />
    </div>
  );
}
