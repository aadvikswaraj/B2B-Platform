'use client';
import { useState } from 'react';
import ManagementPanel from '@/components/common/ManagementPanel';

const mockProducts = [
  { id: 1, name: 'Wireless Headphones', seller: 'ABC Electronics', category: 'Electronics', status: 'pending', price: 99.99, stock: 50, createdAt: '2025-08-08' },
];

const categoryFilter = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Living' },
  { value: 'sports', label: 'Sports & Outdoors' },
];
const statusFilter = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ProductsPage(){
  const [data, setData] = useState(mockProducts);
  const [selected, setSelected] = useState([]);

  return (
    <ManagementPanel
      title="Product Management"
      items={data}
      searchableKeys={['name','seller','category','status']}
      filters={[
        { key: 'category', label: 'Category', options: categoryFilter },
        { key: 'status', label: 'Status', options: statusFilter },
      ]}
      columns={[
        { key: 'product', header: 'Product', render: (p) => (
          <div className="flex items-center gap-3">
            <img src="https://via.placeholder.com/40" alt="" className="h-10 w-10 rounded-md object-cover"/>
            <div className="flex flex-col">
              <span className="font-medium">{p.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">ID: {p.id}</span>
            </div>
          </div>
        ) },
        { key: 'seller', header: 'Seller' },
        { key: 'category', header: 'Category' },
        { key: 'price', header: 'Price', render: p => `$${p.price}` },
        { key: 'status', header: 'Status', render: p => (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status==='active'?'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':p.status==='pending'?'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{p.status}</span>
        ) },
      ]}
      rowActions={(p) => (
        <div className="flex gap-2 justify-end">
          <button className="text-blue-600 hover:underline text-xs" onClick={()=>{}}>View</button>
          <button className="text-green-600 hover:underline text-xs" onClick={()=>{}}>Approve</button>
          <button className="text-red-600 hover:underline text-xs" onClick={()=>{}}>Reject</button>
        </div>
      )}
      bulkActions={[
        { key: 'approve', label: 'Approve', onClick: ids => console.log('approve', ids) },
        { key: 'reject', label: 'Reject', onClick: ids => console.log('reject', ids) },
      ]}
      onSelectionChange={setSelected}
    />
  );
}
