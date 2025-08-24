"use client";
import { useState, useMemo } from 'react';
import useSampleList from '@/hooks/useSampleList';
import ManagementPanel from '@/components/common/ManagementPanel';
import { PlusIcon } from '@heroicons/react/24/outline';

// Mock data with new/edit differentiation
const seedProducts = [
  { id: 'p1', name: 'Wireless Headphones', seller: 'ABC Electronics', category: 'Electronics', status: 'pending', changeType: 'new', price: 99.99, stock: 50, createdAt: '2025-08-08', submittedAt: '2025-08-14', proposed: null },
  { id: 'p2', name: 'Smart Watch Series 5', seller: 'Gizmo Corp', category: 'Electronics', status: 'active', changeType: 'new', price: 199.00, stock: 120, createdAt: '2025-07-20', submittedAt: '2025-07-18', proposed: null },
  { id: 'p3', name: 'Ergonomic Office Chair', seller: 'FurniPro', category: 'Home & Living', status: 'pending', changeType: 'edit', price: 149.99, stock: 30, createdAt: '2025-06-11', submittedAt: '2025-08-15', proposed: { price: 139.99, stock: 45, description: 'Updated cushioning & lumbar support' } },
  { id: 'p4', name: 'Running Shoes Elite', seller: 'Sportify', category: 'Sports & Outdoors', status: 'rejected', changeType: 'new', price: 89.50, stock: 80, createdAt: '2025-08-10', submittedAt: '2025-08-10', proposed: null, lastDecisionReason: 'Incomplete specs' },
];

const categoryOptions = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Home & Living', label: 'Home & Living' },
  { value: 'Sports & Outdoors', label: 'Sports & Outdoors' },
];
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminProductsPage(){
  const [products, setProducts] = useState(seedProducts);
  const [tab, setTab] = useState('review'); // 'review' | 'search'
  const [selected, setSelected] = useState([]);
  const [viewing, setViewing] = useState(null); // product object for side panel modal
  const [decisionModal, setDecisionModal] = useState(null); // { product, action }
  const [decisionReason, setDecisionReason] = useState('');
  const [reviewQuery, setReviewQuery] = useState({ search:'', filters:{ status:'pending' }, page:1, pageSize:10, sort:null });
  const [searchQuery, setSearchQuery] = useState({ search:'', filters:{}, page:1, pageSize:10, sort:null });

  const { items: pendingItems, totalCount: pendingTotal } = useSampleList(products.filter(p=>p.status==='pending'), reviewQuery, { searchableKeys:['name','seller','category'] });
  const { items: catalogItems, totalCount: catalogTotal } = useSampleList(products, searchQuery, { searchableKeys:['name','seller','category','status'] });

  const pendingProducts = pendingItems; // after hook

  const applyDecision = (productId, action, reason) => {
    setProducts(prev => prev.map(p => p.id === productId ? {
      ...p,
      status: action === 'approve' ? 'active' : 'rejected',
      lastDecisionReason: action === 'reject' ? reason : undefined,
      decidedAt: new Date().toISOString().slice(0,10),
    } : p));
    setDecisionModal(null);
    setDecisionReason('');
    setViewing(null);
  };

  const productColumns = [
    { key: 'product', header: 'Product', render: p => (
      <div className="flex items-center gap-3 max-w-[220px]">
        <img src={`https://placehold.co/80x80?text=${encodeURIComponent(p.name.split(' ').slice(0,2).join('+'))}`} alt="" className="h-10 w-10 rounded-md object-cover bg-gray-100"/>
        <div className="flex flex-col">
          <span className="font-medium leading-tight line-clamp-1" title={p.name}>{p.name}</span>
          <span className="text-[11px] text-gray-500">{p.id}</span>
        </div>
      </div>
    )},
    { key: 'seller', header: 'Seller', className: 'hidden md:table-cell' },
    { key: 'category', header: 'Category', className: 'hidden lg:table-cell' },
    { key: 'price', header: 'Price', render: p => `$${p.price.toFixed(2)}` },
    { key: 'status', header: 'Status', render: p => (
      <span className={`px-2 inline-flex text-xs font-semibold rounded-full capitalize ${p.status==='active'?'bg-green-100 text-green-700':p.status==='pending'?'bg-yellow-100 text-yellow-700': 'bg-red-100 text-red-600'}`}>{p.status}</span>
    )},
    { key: 'changeType', header: 'Type', className:'hidden md:table-cell', render: p => (
      <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{p.changeType}</span>
    )},
  ];

  const reviewPanel = (
    <ManagementPanel
      title="Product Review Queue"
      items={pendingProducts}
      totalCount={pendingTotal}
      search={reviewQuery.search}
      onSearchChange={v=>setReviewQuery(q=>({ ...q, search:v, page:1 }))}
      columns={productColumns}
      rowActions={p => [
        { label: 'View', onClick: () => setViewing(p) },
        { label: 'Approve', onClick: () => setDecisionModal({ product: p, action: 'approve' }) },
        { label: 'Reject', onClick: () => setDecisionModal({ product: p, action: 'reject' }) },
      ]}
      bulkActions={[
        { key: 'approve', label: 'Approve', onClick: ids => ids.forEach(id => applyDecision(id,'approve')) },
        { key: 'reject', label: 'Reject', onClick: ids => setDecisionModal({ product: { id: ids }, action: 'reject-bulk' }) },
      ]}
      selectedIds={selected}
      onSelectionChange={setSelected}
      page={reviewQuery.page}
      pageSize={reviewQuery.pageSize}
      onPageChange={p=>setReviewQuery(q=>({ ...q, page:p }))}
      onPageSizeChange={ps=>setReviewQuery(q=>({ ...q, pageSize:ps, page:1 }))}
      emptyState={<p className="text-xs text-gray-500">No pending products 🎉</p>}
    />
  );

  const searchPanel = (
    <ManagementPanel
      title="Product Catalog"
      items={catalogItems}
      totalCount={catalogTotal}
      search={searchQuery.search}
      onSearchChange={v=>setSearchQuery(q=>({ ...q, search:v, page:1 }))}
      filters={[
        { key: 'category', label: 'Category', options: categoryOptions },
        { key: 'status', label: 'Status', options: statusOptions },
      ]}
      activeFilters={searchQuery.filters}
      onFilterChange={f=>setSearchQuery(q=>({ ...q, filters:f, page:1 }))}
      columns={productColumns}
      rowActions={p => [
        { label: 'View', onClick: () => setViewing(p) },
        ...(p.status==='pending' ? [
          { label: 'Approve', onClick: () => setDecisionModal({ product: p, action:'approve' }) },
          { label: 'Reject', onClick: () => setDecisionModal({ product: p, action:'reject' }) },
        ] : [])
      ]}
      onSelectionChange={() => {}}
      page={searchQuery.page}
      pageSize={searchQuery.pageSize}
      onPageChange={p=>setSearchQuery(q=>({ ...q, page:p }))}
      onPageSizeChange={ps=>setSearchQuery(q=>({ ...q, pageSize:ps, page:1 }))}
      primaryActions={[
          { type:"link", label:'New Product', href:'/admin/products/new', icon:PlusIcon }
        ]}
    />
  );

  const renderDiff = (p) => {
    if(!p.proposed) return <p className="text-xs text-gray-500 italic">No proposed changes.</p>;
    const diffs = Object.entries(p.proposed).map(([k,v]) => {
      const oldVal = p[k];
      return (
        <div key={k} className="flex items-start justify-between gap-3 text-xs bg-white rounded border border-gray-200 p-2">
          <div className="font-medium text-gray-600 w-24 capitalize">{k}</div>
          <div className="flex-1 flex flex-col gap-1">
            <div className="line-through text-[11px] text-red-500/70 break-all">{String(oldVal)}</div>
            <div className="text-green-600 font-semibold break-all">{String(v)}</div>
          </div>
        </div>
      );
    });
    return <div className="space-y-2">{diffs}</div>;
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4 overflow-x-auto">
          {['review','search'].map(t => (
            <button key={t} onClick={()=>setTab(t)} className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab===t?'bg-blue-600 text-white shadow':'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>{t==='review'?'Review Queue':'Search & Catalog'}{tab===t && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded"/>}</button>
          ))}
        </div>
      </div>

      {tab==='review' ? reviewPanel : searchPanel}

      {/* Side Panel / Modal for viewing product */}
      {viewing && (
        <div className="fixed inset-0 z-40 flex">
          <div className="hidden md:block flex-1 bg-black/30" onClick={()=>setViewing(null)} />
          <div className="ml-auto h-full w-full max-w-md bg-white shadow-xl flex flex-col animate-slide-in border-l border-gray-200">
            <div className="p-4 flex items-start justify-between border-b">
              <div>
                <h2 className="font-semibold text-lg leading-tight">{viewing.name}</h2>
                <p className="text-[11px] text-gray-500">{viewing.id} • {viewing.seller}</p>
              </div>
              <button onClick={()=>setViewing(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Overview</h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="font-medium text-gray-600">Status:</span> {viewing.status}</div>
                  <div><span className="font-medium text-gray-600">Type:</span> {viewing.changeType}</div>
                  <div><span className="font-medium text-gray-600">Price:</span> ${viewing.price}</div>
                  <div><span className="font-medium text-gray-600">Stock:</span> {viewing.stock}</div>
                  {viewing.lastDecisionReason && <div className="col-span-2"><span className="font-medium text-gray-600">Last Reason:</span> {viewing.lastDecisionReason}</div>}
                </div>
              </section>
              {viewing.changeType==='edit' && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Proposed Changes</h3>
                  {renderDiff(viewing)}
                </section>
              )}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {viewing.status==='pending' && <>
                    <button onClick={()=>setDecisionModal({ product: viewing, action:'approve' })} className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700">Approve</button>
                    <button onClick={()=>setDecisionModal({ product: viewing, action:'reject' })} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700">Reject</button>
                  </>}
                  <button onClick={()=>setViewing(null)} className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50">Close</button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl flex flex-col">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-sm">{decisionModal.action.startsWith('approve')?'Approve Product':'Reject Product'}{Array.isArray(decisionModal.product.id)?` (${decisionModal.product.id.length} selected)`:''}</h2>
              <button onClick={()=>{setDecisionModal(null); setDecisionReason('');}} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <div className="p-5 space-y-4 text-sm max-h-[60vh] overflow-y-auto">
              {decisionModal.action.startsWith('approve') ? (
                <p className="text-xs text-gray-600">You are approving {Array.isArray(decisionModal.product.id)? decisionModal.product.id.length : 1} product(s). This will make them visible in the marketplace.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">Provide a clear rejection reason. Sellers will see this explanation and can resubmit after addressing it.</p>
                  <textarea value={decisionReason} onChange={e=>setDecisionReason(e.target.value)} rows={4} placeholder="Reason (required)" className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"/>
                  {decisionReason.trim()==='' && <p className="text-[11px] text-red-500">Reason is required.</p>}
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t flex flex-col sm:flex-row gap-3 sm:justify-end bg-gray-50 rounded-b-lg">
              <button onClick={()=>{setDecisionModal(null); setDecisionReason('');}} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-xs font-medium hover:bg-gray-100">Cancel</button>
              <button
                disabled={decisionModal.action.startsWith('reject') && decisionReason.trim()===''}
                onClick={()=>{
                  const ids = Array.isArray(decisionModal.product.id) ? decisionModal.product.id : [decisionModal.product.id];
                  ids.forEach(id=>applyDecision(id, decisionModal.action.startsWith('approve')?'approve':'reject', decisionReason.trim()));
                }}
                className={`px-5 py-2 rounded-md text-xs font-semibold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed ${decisionModal.action.startsWith('approve')?'bg-green-600 hover:bg-green-700':'bg-red-600 hover:bg-red-700'}`}
              >{decisionModal.action.startsWith('approve')?'Confirm Approve':'Confirm Reject'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple CSS animation (Tailwind utility extension can be added globally if desired)
// .animate-slide-in could be added via global styles but inline style fallback is used.
