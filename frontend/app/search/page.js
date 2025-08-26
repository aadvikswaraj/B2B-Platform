"use client";
import { useState, useMemo } from 'react';
import Navbar from "@/components/buyer/Navbar";
import ProductCard from '@/components/buyer/ProductCard';
import { Input, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Mock data (replace with server fetch)
const MOCK_PRODUCTS = Array.from({length:24}).map((_,i)=> ({
  id: i+1,
  title: `Industrial Product ${i+1}`,
  price: (Math.random()*800+50).toFixed(2),
  location: ['USA','Germany','India','China','UAE','Brazil'][i%6],
  category: ['Machinery','Metals','Electrical','Packaging','Chemicals','Solar'][i%6],
  featured: i===0,
}));

const CATEGORIES = ['All','Machinery','Metals','Electrical','Packaging','Chemicals','Solar'];
const LOCATIONS = ['All','USA','Germany','India','China','UAE','Brazil'];

export default function SearchPage(){
  const [q,setQ] = useState('');
  const [category,setCategory] = useState('All');
  const [location,setLocation] = useState('All');
  const [sort,setSort] = useState('relevance');
  const [view,setView] = useState('grid');
  const [showFilters,setShowFilters] = useState(false);

  const filtered = useMemo(()=>{
    let items = MOCK_PRODUCTS.filter(p=> !q || p.title.toLowerCase().includes(q.toLowerCase()));
    if(category!=='All') items = items.filter(p=> p.category===category);
    if(location!=='All') items = items.filter(p=> p.location===location);
    if(sort==='priceLow') items = [...items].sort((a,b)=> parseFloat(a.price)-parseFloat(b.price));
    if(sort==='priceHigh') items = [...items].sort((a,b)=> parseFloat(b.price)-parseFloat(a.price));
    return items;
  },[q,category,location,sort]);

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-white'>
      <Navbar />
      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6'>
        {/* Search & Quick Filters */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col md:flex-row gap-3'>
            <div className='flex-1'>
              <Input placeholder='Search products…' value={q} onChange={e=> setQ(e.target.value)} />
            </div>
            <div className='flex gap-2'>
              <Select value={location} onChange={e=> setLocation(e.target.value)} className='w-40'>
                {LOCATIONS.map(l=> <option key={l} value={l}>{l==='All'? 'All Locations': l}</option>)}
              </Select>
              <Select value={sort} onChange={e=> setSort(e.target.value)} className='w-40'>
                <option value='relevance'>Relevance</option>
                <option value='priceLow'>Price: Low → High</option>
                <option value='priceHigh'>Price: High → Low</option>
              </Select>
              <button type='button' onClick={()=> setShowFilters(true)} className='md:hidden inline-flex items-center gap-1 px-4 rounded-md border border-gray-300 bg-white text-xs font-medium'>
                <FunnelIcon className='h-4 w-4'/> Filters
              </button>
            </div>
          </div>
          <div className='flex gap-2 overflow-x-auto no-scrollbar pb-1'>
            {CATEGORIES.map(c=> {
              const active = c===category;
              return <button key={c} onClick={()=> setCategory(c)} className={`px-4 py-1.5 rounded-full text-xs font-medium border flex-shrink-0 transition ${active? 'bg-indigo-600 border-indigo-600 text-white shadow':'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{c}</button>;
            })}
          </div>
        </div>

        {/* Results summary */}
        <div className='flex items-center justify-between text-xs text-gray-600'>
          <span>{filtered.length} result{filtered.length!==1 && 's'} found</span>
          <div className='hidden md:inline-flex rounded-md border border-gray-300 overflow-hidden'>
            {['grid','list'].map(v=> <button key={v} onClick={()=> setView(v)} className={`px-3 py-1 text-[11px] font-medium ${view===v? 'bg-indigo-600 text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}>{v==='grid'? 'Grid':'List'}</button>)}
          </div>
        </div>

        <div className='flex gap-8'>
          {/* Desktop Sidebar Filters */}
            <aside className='hidden lg:block w-64 flex-shrink-0 space-y-6'>
              <div className='p-4 rounded-lg bg-white border space-y-4'>
                <h3 className='text-sm font-semibold text-gray-800'>Refine</h3>
                <div className='space-y-2'>
                  <label className='text-[11px] font-medium text-gray-500 uppercase'>Category</label>
                  <Select value={category} onChange={e=> setCategory(e.target.value)} size='sm'>
                    {CATEGORIES.map(c=> <option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div className='space-y-2'>
                  <label className='text-[11px] font-medium text-gray-500 uppercase'>Location</label>
                  <Select value={location} onChange={e=> setLocation(e.target.value)} size='sm'>
                    {LOCATIONS.map(l=> <option key={l}>{l}</option>)}
                  </Select>
                </div>
                <div className='space-y-2'>
                  <label className='text-[11px] font-medium text-gray-500 uppercase'>Sort</label>
                  <Select value={sort} onChange={e=> setSort(e.target.value)} size='sm'>
                    <option value='relevance'>Relevance</option>
                    <option value='priceLow'>Price: Low → High</option>
                    <option value='priceHigh'>Price: High → Low</option>
                  </Select>
                </div>
                <Button size='sm' variant='outline' onClick={()=> { setCategory('All'); setLocation('All'); setSort('relevance'); setQ(''); }}>Reset</Button>
              </div>
            </aside>

          {/* Main Results */}
          <main className='flex-1 min-w-0'>
            {filtered.length===0 && (
              <div className='p-12 text-center text-sm text-gray-500 rounded-lg border bg-white'>No products match your filters.</div>
            )}
            {view==='grid' ? (
              <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'>
                {filtered.map(p=> <ProductCard key={p.id} id={p.id} />)}
              </div>
            ) : (
              <div className='flex flex-col divide-y rounded-lg border bg-white'>
                {filtered.map(p=> (
                  <div key={p.id} className='p-4 flex flex-col sm:flex-row gap-4'>
                    <div className='w-full sm:w-56 h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs'>Image</div>
                    <div className='flex-1 min-w-0 space-y-2'>
                      <h3 className='font-medium text-gray-800 text-sm truncate'>{p.title}</h3>
                      <div className='flex flex-wrap gap-2 text-[11px] text-gray-600'>
                        <span className='px-2 py-1 rounded bg-gray-100'>{p.category}</span>
                        <span className='px-2 py-1 rounded bg-gray-100'>{p.location}</span>
                      </div>
                      <p className='text-sm font-semibold text-indigo-600'>${p.price}</p>
                    </div>
                    <div className='flex items-start gap-2'>
                      <Button size='sm'>Details</Button>
                      <Button size='sm' variant='outline'>Contact</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className='lg:hidden fixed inset-0 z-40 flex'>
          <div className='absolute inset-0 bg-black/40' onClick={()=> setShowFilters(false)} />
          <div className='ml-auto h-full w-80 max-w-[85%] bg-white shadow-xl flex flex-col'>
            <div className='px-4 py-3 border-b flex items-center justify-between'>
              <h2 className='text-sm font-medium text-gray-800'>Filters</h2>
              <button type='button' onClick={()=> setShowFilters(false)} className='p-1 rounded hover:bg-gray-100'>
                <XMarkIcon className='h-5 w-5 text-gray-500'/>
              </button>
            </div>
            <div className='p-4 flex-1 space-y-5 overflow-auto'>
              <div className='space-y-2'>
                <label className='text-[11px] font-medium text-gray-500 uppercase'>Search</label>
                <Input value={q} onChange={e=> setQ(e.target.value)} placeholder='Search…' size='sm'/>
              </div>
              <div className='space-y-2'>
                <label className='text-[11px] font-medium text-gray-500 uppercase'>Category</label>
                <Select value={category} onChange={e=> setCategory(e.target.value)} size='sm'>
                  {CATEGORIES.map(c=> <option key={c}>{c}</option>)}
                </Select>
              </div>
              <div className='space-y-2'>
                <label className='text-[11px] font-medium text-gray-500 uppercase'>Location</label>
                <Select value={location} onChange={e=> setLocation(e.target.value)} size='sm'>
                  {LOCATIONS.map(l=> <option key={l}>{l}</option>)}
                </Select>
              </div>
              <div className='space-y-2'>
                <label className='text-[11px] font-medium text-gray-500 uppercase'>Sort</label>
                <Select value={sort} onChange={e=> setSort(e.target.value)} size='sm'>
                  <option value='relevance'>Relevance</option>
                  <option value='priceLow'>Price: Low → High</option>
                  <option value='priceHigh'>Price: High → Low</option>
                </Select>
              </div>
            </div>
            <div className='p-4 border-t flex gap-3'>
              <Button className='flex-1' onClick={()=> setShowFilters(false)}>Apply</Button>
              <Button className='flex-1' variant='outline' onClick={()=> { setQ(''); setCategory('All'); setLocation('All'); setSort('relevance'); }}>Reset</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
