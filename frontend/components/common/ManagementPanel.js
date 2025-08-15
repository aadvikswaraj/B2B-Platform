'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
// Simple dot menu for row actions (self-contained, no external deps)
function DotMenu({ actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  // Close menu on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  return (
    <div className="relative inline-block text-left" ref={ref}>
  <button type="button" className="p-1 rounded-full hover:bg-gray-100" onClick={() => setOpen(o => !o)} aria-label="Actions">
        <span className="sr-only">Open actions</span>
        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
      </button>
      {open && (
  <div className="absolute top-full right-0 z-20 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1 flex flex-col">
            {actions.map((a, i) => (
              <button key={i} onClick={() => { setOpen(false); a.onClick(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                {a.icon && <span className="inline-block mr-2 align-middle">{a.icon}</span>}{a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
import { FunnelIcon, MagnifyingGlassIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

/*
Reusable management panel for list CRUD pages.
Props:
  title: string
  items: any[]
  columns: [{ key, header, render?, className? }]
  getRowId?: fn(item) -> id
  searchableKeys?: string[] (fields to search in, lowercased join)
  searchPlaceholder?: string
  filters?: [{ key, label, options:[{value,label}], type? }]
  onFilterChange?: (filtersObj) => void (optional override)
  bulkActions?: [{ key, label, onClick(selectedIds) }]
  primaryAction?: { label, onClick, icon? }
  toolbarExtra?: ReactNode
  rowActionsHeader?: string (header label for actions column)
  stickyHeader?: boolean
  pageSizes?: number[]
  initialPageSize?: number
  dense?: boolean
  rowActions?: (item) => ReactNode
  selectable?: boolean (default true)
  onSelectionChange?: (ids) => void
  emptyState?: ReactNode
Responsive behaviour:
  - On mobile, filters collapse behind a toggle panel
*/

export default function ManagementPanel({
  title,
  items = [],
  columns = [],
  getRowId = (i) => i.id || i._id,
  searchableKeys = [],
  searchPlaceholder = 'Search...',
  filters = [],
  onFilterChange,
  bulkActions = [],
  primaryAction,
  toolbarExtra,
  rowActionsHeader = 'Actions',
  stickyHeader = false,
  pageSizes = [10,25,50],
  initialPageSize = 10,
  dense = false,
  rowActions,
  selectable = true,
  onSelectionChange,
  emptyState,
  enableSorting = true,
  initialSort,
  // Optional custom renderer for mobile card view. If not provided a generic one is used.
  renderCard,
}) {
  // --- Local UI state ---
  const [search, setSearch] = useState('');              // search query
  const [activeFilters, setActiveFilters] = useState(() => Object.fromEntries(filters.map(f => [f.key, ''])));
  const [selectedIds, setSelectedIds] = useState([]);    // currently selected row IDs
  const [page, setPage] = useState(1);                   // current page
  const [pageSize, setPageSize] = useState(initialPageSize); // rows per page
  const [showFiltersMobile, setShowFiltersMobile] = useState(false); // toggle filter panel on small screens
  const [sort, setSort] = useState(() => initialSort || null); // active sort { key, direction } or null

  // Update an individual filter and reset pagination
  const handleFilter = (key, value) => {
    setPage(1);
    setActiveFilters(prev => { const next = { ...prev, [key]: value }; onFilterChange?.(next); return next; });
  };

  // Derive filtered + sorted array (memoized for performance)
  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    const base = items.filter(item => {
      const matchesSearch = !s || (searchableKeys.length ? searchableKeys.some(k => String(item[k]||'').toLowerCase().includes(s)) : JSON.stringify(item).toLowerCase().includes(s));
      const matchesFilters = Object.entries(activeFilters).every(([k,v]) => !v || String(item[k] || '').toLowerCase() === String(v).toLowerCase());
      return matchesSearch && matchesFilters;
    });
    if (enableSorting && sort?.key) {
      const col = columns.find(c => c.key === sort.key);
      if (col) {
        return [...base].sort((a,b) => {
          const av = col.sortValue ? col.sortValue(a) : a[sort.key];
          const bv = col.sortValue ? col.sortValue(b) : b[sort.key];
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (av < bv) return sort.direction === 'asc' ? -1 : 1;
          if (av > bv) return sort.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    return base;
  }, [items, search, searchableKeys, activeFilters, enableSorting, sort, columns]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page-1)*pageSize, page*pageSize);

  // Select / deselect all visible rows
  // DEV: Warn if onSelectionChange is called during render (anti-pattern)
  const safeCallOnSelectionChange = (ids) => {
    if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const stack = new Error().stack;
      if (stack && /at render/.test(stack)) {
        // eslint-disable-next-line no-console
        console.warn('[ManagementPanel] onSelectionChange called during render. This will cause React errors. Only call setState in event handlers.');
      }
    }
    onSelectionChange?.(ids);
  };
  const toggleSelectAll = (checked) => {
    if (!selectable) return;
    if (checked) {
      const all = filtered.map(getRowId);
      setSelectedIds(all);
      safeCallOnSelectionChange(all);
    } else {
      setSelectedIds([]);
      safeCallOnSelectionChange([]);
    }
  };
  // Toggle a single row selection
  const toggleSelect = (id) => {
    if (!selectable) return;
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id];
      safeCallOnSelectionChange(next);
      return next;
    });
  };

  // Utility CSS class strings
  const headerClasses = 'px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600';
  const cellClasses = 'px-4 py-2 whitespace-nowrap text-sm text-gray-800';

  // Cycle sort: none -> asc -> desc -> none
  const toggleSort = (col) => {
    if (!enableSorting || !col.sortable) return;
    setSort(prev => {
      if (!prev || prev.key !== col.key) return { key: col.key, direction: 'asc' };
      if (prev.direction === 'asc') return { key: col.key, direction: 'desc' };
      return null; // third click clears sort
    });
  };

  // --- Mobile card rendering (fallback generic) ---
  const defaultRenderCard = (item) => {
    return (
  <div key={getRowId(item)} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          {selectable && (
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300"
              checked={selectedIds.includes(getRowId(item))}
              onChange={()=>toggleSelect(getRowId(item))}
              aria-label="Select row"
            />
          )}
          <div className="flex-1 space-y-1">
            {columns.slice(0,1).map(col => (
              <div key={col.key} className="font-medium text-gray-900">{col.render ? col.render(item) : item[col.key]}</div>
            ))}
            {columns.slice(1,4).map(col => (
              <div key={col.key} className="text-xs text-gray-600 flex gap-1">
                <span className="font-semibold">{col.header}:</span>
                <span>{col.render ? col.render(item) : String(item[col.key] ?? '')}</span>
              </div>
            ))}
          </div>
          {rowActions && (
            <div className="ml-2 self-start">
              <DotMenu actions={rowActions} />
            </div>
          )}
        </div>
        {columns.length > 4 && (
          <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
            {columns.slice(4).map(col => (
              <span key={col.key} className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5">
                {col.header}: {col.render ? col.render(item) : String(item[col.key] ?? '')}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
          <p className="mt-1 text-xs text-gray-500">{filtered.length} result{filtered.length!==1 && 's'}{filtered.length !== items.length && ` (filtered from ${items.length})`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {primaryAction && (
            <button onClick={primaryAction.onClick} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700">
              {primaryAction.icon && <primaryAction.icon className="h-4 w-4"/>}
              {primaryAction.label}
            </button>
          )}
          <button onClick={()=>setShowFiltersMobile(s=>!s)} className="sm:hidden inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"><FunnelIcon className="h-4 w-4"/> Filters</button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
            <input value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} placeholder={searchPlaceholder} className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {bulkActions.length>0 && selectedIds.length>0 && (
            <div className="flex flex-wrap gap-2">
              {bulkActions.map(a => (
                <button key={a.key} onClick={()=>a.onClick(selectedIds)} className="rounded-md bg-gray-800 text-white px-3 py-2 text-xs font-medium hover:bg-gray-700">{a.label}</button>
              ))}
            </div>
          )}
          {toolbarExtra}
        </div>
        <div className="hidden md:flex gap-3">
          {filters.map(f => (
            <select key={f.key} value={activeFilters[f.key]} onChange={e=>handleFilter(f.key, e.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 min-w-[140px]">
              <option value="">{f.label}: All</option>
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
        </div>
      </div>

      {showFiltersMobile && (
  <div className="sm:hidden rounded-lg border border-gray-200 p-3 flex flex-wrap gap-3">
          {filters.map(f => (
            <select key={f.key} value={activeFilters[f.key]} onChange={e=>handleFilter(f.key, e.target.value)} className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
              <option value="">{f.label}: All</option>
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
        </div>
      )}

      {/* Mobile Card List (hidden on md and up) */}
      <div className="md:hidden space-y-3">
        {paginated.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">{emptyState || 'No results.'}</div>
        )}
        {paginated.map(item => (renderCard ? renderCard({ item, columns, selected: selectedIds.includes(getRowId(item)), toggleSelect, rowActions }) : defaultRenderCard(item)))}
      </div>

      {/* Table view (desktop) */}
  <div className="rounded-lg border border-gray-200 overflow-hidden bg-white hidden md:block">
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y divide-gray-200 ${dense?'text-sm':''}`}>
            <thead className={`bg-gray-50 ${stickyHeader?'sticky top-0 z-10':''}`}>
              <tr>
                {selectable && (
                  <th className={headerClasses + ' w-8'}>
                    <input type="checkbox" className="rounded border-gray-300" onChange={e=>toggleSelectAll(e.target.checked)} checked={selectedIds.length>0 && selectedIds.length===filtered.length} aria-label="Select all" />
                  </th>
                )}
                {columns.map(col => {
                  const isSorted = sort?.key === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={()=>toggleSort(col)}
                      className={`${headerClasses} ${col.className||''} ${col.sortable && enableSorting ? 'cursor-pointer select-none' : ''}`}
                      aria-sort={isSorted ? (sort.direction==='asc'?'ascending':'descending') : 'none'}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.header}
                        {col.sortable && enableSorting && (
                          <span className="text-[10px] opacity-70">
                            {isSorted ? (sort.direction==='asc'?'▲':'▼') : '⇅'}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
                {rowActions && <th className={headerClasses + ' text-right'}>{rowActionsHeader}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginated.map(item => {
                const id = getRowId(item);
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    {selectable && (
                      <td className={cellClasses + ' w-8'}>
                        <input type="checkbox" className="rounded border-gray-300" checked={selectedIds.includes(id)} onChange={()=>toggleSelect(id)} aria-label="Select row" />
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key} className={`${cellClasses} ${col.className||''}`}>{col.render ? col.render(item) : item[col.key]}</td>
                    ))}
                    {rowActions && <td className={cellClasses + ' text-right'}><DotMenu actions={rowActions} /></td>}
                  </tr>
                );
              })}
              {paginated.length===0 && (
                <tr>
                  <td colSpan={columns.length + (rowActions?1:0) + (selectable?1:0)} className="px-4 py-12 text-center text-sm text-gray-500">
                    {emptyState || 'No results.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-3 bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Squares2X2Icon className="h-4 w-4"/>
            <span>Rows: </span>
            <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value)); setPage(1);}} className="rounded-md border border-gray-300 bg-white px-2 py-1 pr-7 text-xs">
              {pageSizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="hidden sm:inline">| Page {page} of {totalPages}</span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="disabled:opacity-40 disabled:cursor-not-allowed rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium">Prev</button>
            <span className="text-xs text-gray-600 px-2">{page}/{totalPages}</span>
            <button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="disabled:opacity-40 disabled:cursor-not-allowed rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
