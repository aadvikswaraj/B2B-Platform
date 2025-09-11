"use client";
import ManagementPanel from '@/components/common/ManagementPanel';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CategoryAPI from '@/utils/api/categories';

export default function CategoriesPage(){
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState({ search:'', filters:{}, page:1, pageSize:10, sort:{ key:'name', direction:'asc' } });
  const [data, setData] = useState({ categories:[], totalCount:0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [treeMode, setTreeMode] = useState(false);
  const [parentMap, setParentMap] = useState({}); // id -> category (loaded or fetched parent)
  const commissionCache = useRef({}); // id -> resolved commission

  const load = useCallback(async ()=>{
    setLoading(true); setError(null);
    try {
      const params = { page: query.page, pageSize: query.pageSize, search: query.search };
      if(query.sort){ params.sort = `${query.sort.direction==='desc' ? '-' : ''}${query.sort.key}`; }
      if(query.filters.parent){ params.parent = query.filters.parent==='null' ? 'root' : query.filters.parent; }
      if(query.filters.depth){ params.depth = query.filters.depth; }
      const res = await CategoryAPI.list(params);
      setData(res);
      // Build parent map for quick lookup of names
      const map = {};
      res.categories.forEach(c=>{ map[c._id] = c; });
      setParentMap(m=>({ ...map, ...m }));
      // Fetch any missing parent categories (those referenced but not in current page or existing map)
      const missing = Array.from(new Set(res.categories.map(c=>c.parentCategory).filter(pid=> pid && !parentMap[pid] && !map[pid])));
      if(missing.length){
        await Promise.all(missing.map(id=>CategoryAPI.get(id).then(cat=>{ if(cat) setParentMap(m=>({ ...m, [id]: cat })); }).catch(()=>{})));
      }
      // Resolve commission for rows with inherit (client-side path fetch)
      const inheritTargets = res.categories.filter(c=> c.commission?.mode === 'inherit' && !commissionCache.current[c._id]);
      if(inheritTargets.length){
        await Promise.all(inheritTargets.map(async c => {
          try {
            const path = await CategoryAPI.path(c._id); // path includes ancestors + self
            // Walk from end backwards to find first non-inherit commission
            let resolved = c.commission;
            for(let i=path.length-1;i>=0;i--){
              const cc = path[i];
              if(cc.commission && cc.commission.mode !== 'inherit'){ resolved = cc.commission; break; }
            }
            commissionCache.current[c._id] = resolved;
          } catch(e){ /* ignore */ }
        }));
        // force re-render
        setData(d=>({ ...d }));
      }
    } catch(e){ setError(e.message); }
    setLoading(false);
  }, [query]);

  useEffect(()=>{ load(); }, [load]);

  const deleteCategory = async (id) => {
    if(!confirm('Delete category?')) return;
    try { await CategoryAPI.remove(id); load(); } catch(e){ alert(e.message); }
  };
  const optimisticMutate = (ids, updater) => {
    setData(d=>({ ...d, categories: d.categories.map(c=> ids.includes(c._id) ? updater(c) : c) }));
  };
  const bulkDelete = async (ids) => {
    if(!confirm('Delete selected categories?')) return;
    const prev = data.categories;
    optimisticMutate(ids, ()=>null);
    setData(d=>({ ...d, categories: d.categories.filter(c=> c) }));
    try { await Promise.all(ids.map(id=>CategoryAPI.remove(id))); setSelected([]); load(); } catch(e){ alert(e.message); setData(d=>({ ...d, categories: prev })); }
  };
  const bulkDisable = async (ids) => {
    if(!confirm('Deactivate selected categories?')) return;
    optimisticMutate(ids, c=>({ ...c, isActive:false }));
    try { await CategoryAPI.bulkStatus(ids, false); setSelected([]); } catch(e){ alert(e.message); load(); }
  };
  const bulkEnable = async (ids) => {
    if(!confirm('Activate selected categories?')) return;
    optimisticMutate(ids, c=>({ ...c, isActive:true }));
    try { await CategoryAPI.bulkStatus(ids, true); setSelected([]); } catch(e){ alert(e.message); load(); }
  };

  const rows = useMemo(()=>{
    if(!treeMode) return data.categories;
    // naive tree sort: depth ascending then name
    return [...data.categories].sort((a,b)=> a.depth - b.depth || a.name.localeCompare(b.name));
  }, [treeMode, data.categories]);

  return (
    <div className="space-y-6">
      {error && <div className="text-xs text-red-600">{error}</div>}
      <ManagementPanel
        title="Category Management"
  items={rows}
        totalCount={data.totalCount}
        loading={loading}
        search={query.search}
        onSearchChange={v=>setQuery(q=>({ ...q, search:v, page:1 }))}
        filters={[
          { key: 'parent', label: 'Parent', options: [{ value: 'null', label: 'Top Level' }] },
          { key: 'depth', label: 'Depth', options: [ { value:'0', label:'Root'}, { value:'1', label:'Sub'}, { value:'2', label:'Micro'} ] }
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
              <p className="font-medium flex items-center gap-2">
                {treeMode && <span className="text-gray-300" style={{ marginLeft: c.depth * 12 }}>{c.depth>0 && '└─'}</span>}
                <span className={c.isActive===false ? 'line-through text-gray-500' : ''}>{c.name}</span>
                <span className="text-[10px] text-gray-400 font-normal">d{c.depth}</span>
                {c.isActive===false && <span className="text-[9px] px-1 py-0.5 rounded bg-gray-200 text-gray-700">inactive</span>}
              </p>
              {c.description && <p className="text-[11px] text-gray-500 line-clamp-1">{c.description}</p>}
            </div>
          ) },
          { key: 'slug', header: 'Slug', sortable: true, className: 'hidden md:table-cell text-xs text-gray-500' },
          { key: 'parentCategory', header: 'Parent', sortable: false, render: c => (
            c.parentCategory ? <span className="text-xs text-gray-600">{parentMap[c.parentCategory]?.name || '…'}</span> : <span className="text-[11px] text-gray-400 italic">Top</span>
          ) },
          { key: 'specifications', header: 'Specs', render: c => (
            <div className="flex flex-wrap gap-1 max-w-[160px]">
              {c.specifications?.slice(0,4).map((s,i)=>(
                <span key={i} className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 font-medium">{s.name}</span>
              ))}
              {c.specifications?.length>4 && <span className="text-[10px] text-gray-500">+{c.specifications.length-4}</span>}
              {(!c.specifications || c.specifications.length===0) && <span className="text-[10px] italic text-gray-400">None</span>}
            </div>
          ) },
          { key: 'commission', header: 'Commission', render: c => {
            const eff = commissionCache.current[c._id] || c.commission;
            return (
              <span className="text-[10px] text-gray-600 flex flex-col">
                {c.commission?.mode==='inherit' && (
                  <span>inherit → {eff?.mode==='exact' ? eff.exact+'%' : eff?.mode==='slab' ? (eff.slabs?.length||0)+' slabs' : '—'}</span>
                )}
                {c.commission?.mode==='exact' && <span>{c.commission.exact}%</span>}
                {c.commission?.mode==='slab' && <span>{c.commission.slabs?.length||0} slabs</span>}
                {!c.commission && '—'}
              </span>
            );
          } }
        ]}
        rowActions={c => [
          { label: 'Edit', onClick: () => window.location.href = `/admin/categories/${c._id}/edit` },
          { label: 'Delete', onClick: () => deleteCategory(c._id) },
        ]}
        bulkActions={[
          { key: 'delete', label: 'Delete', onClick: ids => bulkDelete(ids) },
          { key: 'disable', label: 'Deactivate', onClick: ids => bulkDisable(ids) },
          { key: 'enable', label: 'Activate', onClick: ids => bulkEnable(ids) }
        ]}
        selectedIds={selected}
        onSelectionChange={setSelected}
        primaryActions={[
          { type:"link", label:'New Category', href:'/admin/categories/new', icon:PlusIcon },
          { label: treeMode ? 'Flat View' : 'Tree View', onClick: ()=> setTreeMode(t=>!t) }
        ]}
      />
    </div>
  );
}
