"use client"
import { useState } from 'react';
import ManagementPanel from '@/components/common/ManagementPanel';
import { PhotoIcon, PencilSquareIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Temporary mock data (replace with API fetch)
const MOCK_PRODUCTS = Array.from({ length: 23 }).map((_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  sku: `SKU-${1000 + i}`,
  price: (Math.random() * 500 + 10).toFixed(2),
  stock: Math.floor(Math.random() * 200),
  status: i % 3 === 0 ? 'draft' : 'active',
  category: ['Pumps', 'Motors', 'Pipes'][i % 3],
  updatedAt: new Date(Date.now() - i * 86400000).toISOString().slice(0,10)
}));

export default function SellerManageProductsPage(){
  const [items, setItems] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = items.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())) &&
    (!filters.status || p.status === filters.status) &&
    (!filters.category || p.category === filters.category)
  );

  const sorted = sort ? [...filtered].sort((a,b)=>{
    const dir = sort.direction === 'asc' ? 1 : -1;
    if(a[sort.key] < b[sort.key]) return -1 * dir;
    if(a[sort.key] > b[sort.key]) return 1 * dir;
    return 0;
  }) : filtered;

  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  const columns = [
    { key: 'name', header: 'Name', sortable: true, render: (p)=> <div className='flex items-center gap-2'><span className='inline-flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-500'><PhotoIcon className='h-4 w-4'/></span><div><div className='font-medium'>{p.name}</div><div className='text-[11px] text-gray-500'>{p.sku}</div></div></div> },
    { key: 'category', header: 'Category', sortable: true, className:'text-xs text-gray-500' },
    { key: 'price', header: 'Price', sortable: true, render: p => `$${p.price}` },
    { key: 'stock', header: 'Stock', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render:p => <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${p.status==='active'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{p.status}</span> },
    { key: 'updatedAt', header: 'Updated', sortable: true, render:p => <span className='text-xs text-gray-500'>{p.updatedAt}</span> }
  ];

  return (
    <div className='space-y-8'>
      <ManagementPanel
        title={"Products"}
        items={pageItems}
        totalCount={sorted.length}
        columns={columns}
        search={search}
        onSearchChange={(v)=>{ setSearch(v); setPage(1); }}
        filters={[{
          key:'status', label:'Status', options:[{value:'active', label:'Active'},{value:'draft', label:'Draft'}]
        },{
          key:'category', label:'Category', options:[...Array.from(new Set(items.map(i=>i.category))).map(c=>({ value:c, label:c }))] } ]}
        activeFilters={filters}
        onFilterChange={(f)=>{ setFilters(f); setPage(1); }}
        sort={sort}
        onSortChange={setSort}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        rowActions={(p)=>[
          { label:'Edit', icon:PencilSquareIcon, onClick:()=>{/* navigate */} },
          { label:'Delete', icon:TrashIcon, onClick:()=> setItems(prev=> prev.filter(i=>i.id!==p.id)) }
        ]}
        primaryActions={[{ type:'link', label:'Add Product', href:'/seller/products/new', icon:PlusCircleIcon }]}
      />
    </div>
  );
}