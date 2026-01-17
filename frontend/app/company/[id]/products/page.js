'use client';

import { useMemo, useState } from 'react';
import Navbar from '@/components/buyer/Navbar';
import { Card, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';

function ProductCard({ p }){
  return (
    <div className="rounded-lg border bg-white overflow-hidden hover:shadow-sm transition">
      <img src={p.image} alt={p.name} className="h-36 w-full object-cover"/>
      <div className="p-3">
        <div className="text-sm font-medium text-gray-900 line-clamp-2" title={p.name}>{p.name}</div>
        <div className="mt-1 text-xs text-gray-600">From ${p.price}</div>
        <div className="mt-2 flex items-center gap-2">
          <Button as='a' href={`/product/${p.id}`} variant='outline' size='sm' className='flex-1'>View</Button>
          <Button size='sm' className='flex-1'>Contact</Button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyProductsPage({ params }){
  const { id } = params;
  // Mock categories and products; replace with API wired to company id
  const categories = [
    { key:'all', name:'All' },
    { key:'electronics', name:'Electronics' },
    { key:'gadgets', name:'Gadgets' },
    { key:'accessories', name:'Accessories' }
  ];
  const allProducts = Array.from({length:24}).map((_,i)=> ({
    id:i+1,
    name:`Product ${i+1} — High precision industrial component`,
    price:(39 + (i%6)*10).toFixed(2),
    image:'/product-image.jpg',
    category: i%3===0? 'electronics' : i%3===1? 'gadgets' : 'accessories'
  }));

  const [activeCat, setActiveCat] = useState('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('latest');

  const filtered = useMemo(()=>{
    let list = allProducts;
    if(activeCat !== 'all') list = list.filter(p=> p.category===activeCat);
    if(q.trim()) list = list.filter(p=> p.name.toLowerCase().includes(q.toLowerCase()));
    if(sort==='price-asc') list = [...list].sort((a,b)=> Number(a.price)-Number(b.price));
    if(sort==='price-desc') list = [...list].sort((a,b)=> Number(b.price)-Number(a.price));
    return list;
  }, [activeCat, q, sort]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-white">
      <Navbar />
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Company Products</h1>
          <div className="flex items-center gap-2">
            <Input value={q} onChange={(e)=> setQ(e.target.value)} placeholder="Search products" />
            <Select value={sort} onChange={(e)=> setSort(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </Select>
          </div>
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-12">
          {/* Sidebar categories */}
          <aside className="md:col-span-3 lg:col-span-2">
            <Card>
              <CardHeader title="Categories" />
              <ul className="space-y-2 text-sm">
                {categories.map(c=> (
                  <li key={c.key}>
                    <button
                      onClick={()=> setActiveCat(c.key)}
                      className={`w-full text-left px-3 py-2 rounded-md border ${activeCat===c.key? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>

          {/* Product grid */}
          <section className="md:col-span-9 lg:col-span-10">
            <Card>
              <CardHeader title={categories.find(c=> c.key===activeCat)?.name || 'Products'} />
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-500">No products found.</div>
              ) : (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {filtered.map(p=> <ProductCard key={p.id} p={p} />)}
                </div>
              )}
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
