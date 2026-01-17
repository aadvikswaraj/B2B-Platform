import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  EllipsisHorizontalIcon,
  QueueListIcon,
  Squares2X2Icon as GridIcon,
  ArrowsUpDownIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import clsx from "clsx";

function DotMenu({ actions = [], onOpenDrawer }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handlePointer = (e) => {
      if (!open) return;
      const node = containerRef.current;
      if (!node) return;
      if (!node.contains(e.target)) setOpen(false);
    };
    const handleKey = e => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer, { passive: true });
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
  <div ref={containerRef} className="relative inline-block text-left" data-stop-row-nav="true">
      <button
        type="button"
    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="true"
        aria-expanded={open}
    onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <circle cx="10" cy="4" r="1.5" fill="#6B7280" />
          <circle cx="10" cy="10" r="1.5" fill="#6B7280" />
          <circle cx="10" cy="16" r="1.5" fill="#6B7280" />
        </svg>
      </button>
      <div
        className={`absolute top-full right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 ${
          open ? "block" : "hidden"
        }`}
        role="menu"
        tabIndex={-1}
    onClick={(e) => e.stopPropagation()}
      >
        {actions.map((a, i) => (
          <button
            key={a.label || i}
            onClick={() => {
              a.onClick?.();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            {a.icon && <a.icon className="h-4 w-4" />}
            {a.label}
          </button>
        ))}
        {actions.length === 0 && (
          <div className="px-4 py-2 text-xs text-gray-400">No actions</div>
        )}
      </div>
    </div>
  );
}

export default function ManagementPanel({
  title,
  items = [],
  itemLink,
  totalCount = 0,
  columns = [],
  getRowId = (r) => r.id || r._id,
  search = "",
  onSearchChange,
  searchPlaceholder = "Search…",
  filters = [],
  activeFilters = {},
  onFilterChange,
  sort = null,
  onSortChange,
  enableSorting = true,
  page = 1,
  pageSize = 10,
  pageSizes = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  selectable = true,
  bulkActions = [],
  rowActions,
  rowActionsHeader = "Actions",
  primaryActions,
  loading = false,
  skeletonCount,
  viewMode: initialViewMode = "table", // "table" | "grid"
  useDrawer = false, // If true, actions open in a drawer
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState(initialViewMode);
  // Ensure we stick to initial view mode preference unless changed
  useEffect(() => { setViewMode(initialViewMode) }, [initialViewMode]);

  const headerClasses = "px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600";
  const cellClasses = "px-4 py-2 whitespace-nowrap text-sm text-gray-800";
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const showCheckboxes = selectable && bulkActions.length > 0;

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [showSortMobile, setShowSortMobile] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionDrawerItem, setActionDrawerItem] = useState(null);

  const toggleSelectAll = (checked) => setSelectedIds(checked ? items.map(getRowId) : []);

  const toggleSelect = 
  (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleSort = (col) => {
    if (!enableSorting || !col.sortable) return;
    const next = (!sort || sort.key !== col.key) ? { key: col.key, direction: "asc" }
                : (sort.direction === "asc" ? { key: col.key, direction: "desc" } : null);
    onSortChange?.(next);
  };

  const resolveItemHref = (item) => {
    if (!itemLink) return null;
    return typeof itemLink === 'function' ? itemLink(item) : itemLink;
  };

  const shouldIgnoreRowNav = (event) => {
    const target = event.target;
    if (!target) return false;
    const interactiveSelector = 'a, button, input, select, textarea, label, [role="menu"], [role="menuitem"], [data-stop-row-nav]';
    return !!target.closest(interactiveSelector);
  };

  const goTo = (href) => {
    if (!href) return;
    try { router.push(href); }
    catch { window.location.href = href; }
  };

  const defaultRenderCard = (item) => {
    const href = resolveItemHref(item);
    // Universal Card Actions: Use passed rowActions or none
    const allActions = rowActions ? rowActions(item) : [];

    return (
      <div
        key={getRowId(item)}
        className={clsx(
            "group relative flex flex-col rounded-xl border border-gray-200 bg-white py-4 px-2.5 shadow-sm transition-all",
            href && "cursor-pointer active:scale-[0.98] active:opacity-90 active:shadow-sm"
        )}
        onClick={(e) => { if (href && !shouldIgnoreRowNav(e)) goTo(href); }}
        onKeyDown={(e) => { if (href && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); goTo(href); } }}
        role={href ? "link" : undefined}
        tabIndex={href ? 0 : undefined}
      >
        <div className="flex justify-between items-start gap-4">
            <div className="flex gap-3 min-w-0 flex-1">
                {/* Checkbox (Top Left) */}
                {showCheckboxes && (
                    <div onClick={(e) => e.stopPropagation()} className="pt-1">
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={selectedIds.includes(getRowId(item))}
                            onChange={() => toggleSelect(getRowId(item))}
                            aria-label="Select row"
                        />
                    </div>
                )}
                
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Header: First Column/Main Title */}
                    <div>
                        {columns.slice(0, 1).map((col) => (
                            <div key={col.key} className="font-bold text-gray-900 text-sm leading-tight break-words">
                            {col.render ? col.render(item) : (item[col.key] || "-")}
                            </div>
                        ))}
                    </div>

                    {/* Body: Other Columns */}
                    <div className="flex flex-col gap-1">
                        {columns.slice(1).map((col) => (
                             <div key={col.key} className="flex gap-2.5 items-center">
                                <span className="text-[11px] font-semibold text-gray-500 uppercase">
                                    {col.header}
                                </span>
                                <div className="text-sm font-normal text-gray-700 text-ellipsis overflow-hidden whitespace-nowrap">
                                    {col.render ? col.render(item) : (item[col.key] || "-")}
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions (Top Right) */}
            {allActions.length > 0 && (
                <button
                    type="button"
                    onClick={(e) => { 
                       e.stopPropagation();
                       setActionDrawerItem(item); 
                    }}
                    className="p-2 -mr-2 -mt-2 text-gray-400 hover:text-gray-600 rounded-full active:bg-gray-100 transition-colors"
                    data-stop-row-nav="true"
                    aria-label="Actions"
                >
                   <EllipsisHorizontalIcon className="h-6 w-6" />
                </button>
            )}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Skeleton helpers (outside JSX return)
  // ---------------------------------------------------------------------------
  const skeletonItems = Array.from({ length: skeletonCount || Math.min(pageSize, 8) || 5 });
  const SkeletonBar = ({ className = "" }) => <div className={clsx("animate-pulse rounded bg-gray-200", className)} />;
  const SkeletonCard = (i) => (
    <div key={`skeleton-card-${i}`} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-3 animate-pulse" aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        {showCheckboxes && <div className="h-4 w-4 rounded border border-gray-300 bg-gray-100" />}
        <div className="flex-1 space-y-2">
          <SkeletonBar className="h-3 w-40" />
          <SkeletonBar className="h-2 w-24" />
        </div>
        <SkeletonBar className="h-5 w-10" />
      </div>
      <div className="flex gap-3">
        <SkeletonBar className="h-2 w-20" />
        <SkeletonBar className="h-2 w-24" />
      </div>
    </div>
  );
  const SkeletonRow = (i) => (
    <tr key={`skeleton-row-${i}`} className="animate-pulse" aria-hidden="true">
      {showCheckboxes && (
        <td className={cellClasses + " w-8"}>
          <div className="h-4 w-4 rounded border border-gray-300 bg-gray-100" />
        </td>
      )}
      {columns.map((col, idx) => (
        <td key={col.key} className={cellClasses}>
          <div className={clsx("rounded bg-gray-200", idx === 0 ? "h-3 w-40" : idx % 3 === 0 ? "h-3 w-24" : "h-3 w-16", 'animate-pulse')} />
        </td>
      ))}
      {rowActions && (
        <td className={cellClasses + " text-right"}>
          <div className="h-4 w-8 ml-auto rounded bg-gray-200 animate-pulse" />
        </td>
      )}
    </tr>
  );

  return (
    <div className="space-y-4">
      <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-3">
        <div>
          {title && (
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {loading
              ? "Loading…"
              : `${totalCount} result${totalCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {primaryActions &&
            primaryActions.map(
              (a) =>
                a &&
                (a.type === "link" ? (
                  <Button as={Link} key={a.label} href={a.href} icon={a.icon}>
                    {a.label}
                  </Button>
                ) : (
                  <Button key={a.label} onClick={a.onClick} icon={a.icon}>
                    {a.label}
                  </Button>
                ))
            )}

        </div>
      </div>
      
      {/* Mobile Toolbar */}
      <div className="md:hidden">
         <div className="flex gap-2 items-center">
            <div className="relative flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
            <button 
                onClick={() => setShowSortMobile(true)}
                className="flex items-center justify-center p-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm active:bg-gray-50 relative"
            >
                <ArrowsUpDownIcon className="h-5 w-5 text-gray-400"/>
                {sort && <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"></span>}
            </button>
            <button 
                onClick={() => setShowFiltersMobile(true)}
                className="flex items-center justify-center p-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm active:bg-gray-50 relative"
            >
                <FunnelIcon className="h-5 w-5 text-gray-400"/>
                {Object.values(activeFilters || {}).filter(Boolean).length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white border border-white shadow-sm">
                    {Object.values(activeFilters || {}).filter(Boolean).length}
                    </span>
                )}
            </button>
         </div>
         {bulkActions.length > 0 && selectedIds.length > 0 && (
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
             {bulkActions.map((bulkAction) => (
                <button
                  key={bulkAction.label}
                  onClick={() => bulkAction.onClick(selectedIds)}
                  className="whitespace-nowrap rounded-full bg-gray-900 text-white px-4 py-1.5 text-xs font-medium shadow-sm hover:bg-gray-800"
                >
                  {bulkAction.label} ({selectedIds.length})
                </button>
             ))}
           </div>
         )}
      </div>

      <div className="hidden md:flex flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {bulkActions.length > 0 && selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {bulkActions.map((bulkAction) => (
                <button
                  key={bulkAction.label}
                  onClick={() => bulkAction.onClick(selectedIds)}
                  className="rounded-md bg-gray-800 text-white px-3 py-2 text-xs font-medium hover:bg-gray-700"
                >
                  {bulkAction.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="hidden md:flex gap-3">
          {filters.map((f) => (
            <select
              key={f.key}
              value={activeFilters[f.key] || ""}
              onChange={(e) =>
                onFilterChange?.({ ...activeFilters, [f.key]: e.target.value })
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 min-w-[140px]"
            >
              <option value="">{f.label}: All</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>
      <Modal
        open={showFiltersMobile}
        onClose={() => setShowFiltersMobile(false)}
        title="Filter Results"
        mobileMode="drawer"
      >
        <div className="space-y-5 pb-6">
          {filters.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No filters available.</p>
          ) : (
            filters.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  {f.label}
                </label>
                <select
                  value={activeFilters[f.key] || ""}
                  onChange={(e) =>
                    onFilterChange?.({ ...activeFilters, [f.key]: e.target.value })
                  }
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 text-sm"
                >
                  <option value="">All {f.label}s</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))
          )}
          
          <div className="pt-4 mt-2">
            <button
              type="button"
              onClick={() => setShowFiltersMobile(false)}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-700"
            >
              Show Results
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showSortMobile}
        onClose={() => setShowSortMobile(false)}
        title="Sort By"
        mobileMode="drawer"
      >
        <div className="space-y-1 pb-6">
           {columns.filter(c => c.sortable).length === 0 ? (
               <p className="text-sm text-gray-500 text-center py-4">No sortable columns.</p>
           ) : (
               columns.filter(c => c.sortable).map(col => (
                  <button 
                    key={col.key} 
                    onClick={() => { toggleSort(col); setShowSortMobile(false); }} 
                    className={clsx(
                        "flex w-full items-center justify-between px-4 py-3.5 text-left rounded-lg transition-colors border-b border-gray-50 last:border-0",
                        sort?.key === col.key ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50" 
                    )}
                  >
                     <span>{col.header}</span>
                     {sort?.key === col.key && (
                        sort.direction === 'asc' 
                            ? <BarsArrowUpIcon className="h-5 w-5 text-blue-600"/> 
                            : <BarsArrowDownIcon className="h-5 w-5 text-blue-600"/>
                     )}
                  </button>
               ))
           )}
        </div>
      </Modal>

      {/* Drawer/Modal for actions/details */}
      <Modal
        open={!!actionDrawerItem}
        onClose={() => setActionDrawerItem(null)}
        title="Actions"
        mobileMode="drawer"
      >
        <div className="flex flex-col gap-2 pb-4">
          {actionDrawerItem && (
            (rowActions ? rowActions(actionDrawerItem) : []).map((action, i) => (
                <button
                    key={i}
                    onClick={() => {
                    action.onClick?.();
                    setActionDrawerItem(null);
                    }}
                    className={clsx(
                    "flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm font-medium transition-colors border-b border-gray-50 last:border-0",
                    action.danger 
                        ? "text-red-600 hover:bg-red-50" 
                        : "text-gray-700 hover:bg-gray-50 bg-white"
                    )}
                >
                    {action.icon && <action.icon className={clsx("h-5 w-5", action.danger ? "text-red-500" : "text-gray-400")} />}
                    <span>{action.label}</span>
                </button>
            ))
          )}
        </div>
      </Modal>

      <div className={clsx(
        viewMode === "table" 
            ? "md:hidden flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3" // Changed mobile from list to cards
            : "space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0"
      )}>
        {loading && skeletonItems.map((_, i) => SkeletonCard(i))}
        {!loading && items.map((item) =>
          defaultRenderCard(item)
        )}
      </div>
      <div className={clsx("rounded-lg border border-gray-200 bg-white", viewMode === "grid" ? "hidden" : "hidden md:block")}>
        <div className="">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {showCheckboxes && (
                  <th className={headerClasses + " w-8"}>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      checked={
                        selectedIds.length > 0 &&
                        selectedIds.length === items.length
                      }
                      aria-label="Select all"
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const isSorted = sort?.key === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col)}
                      className={clsx(headerClasses, col.className, {
                        "cursor-pointer select-none": col.sortable && enableSorting,
                      })}
                      aria-sort={isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.header}
                        {col.sortable && enableSorting && (
                          <span className="text-[10px] opacity-70">
                            {isSorted ? (sort.direction === "asc" ? "▲" : "▼") : "⇅"}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
                {rowActions && (
                  <th className={headerClasses + " text-right"}>
                    {rowActionsHeader}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? skeletonItems.map((_, i) => SkeletonRow(i)) : items.map((item) => {
                const id = getRowId(item);
                const href = resolveItemHref(item);
                return (
                  <tr
                    key={id}
                    className={clsx("hover:bg-gray-50", href && "cursor-pointer")}
                    onClick={(e) => { if (href && !shouldIgnoreRowNav(e)) goTo(href); }}
                    onKeyDown={(e) => { if (href && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); goTo(href); } }}
                    tabIndex={href ? 0 : undefined}
                    aria-label={href ? "Open details" : undefined}
                  >
                      {showCheckboxes && (
                        <td className={cellClasses + " w-8"}>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedIds.includes(id)}
                            onChange={() => toggleSelect(id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Select row"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`${cellClasses} ${col.className || ""}`}
                        >
                          {col.render ? col.render(item) : item[col.key]}
                        </td>
                      ))}
                      {rowActions && (
                        <td className={cellClasses + " text-right"}>
                          <DotMenu actions={rowActions(item)} />
                        </td>
                      )}
                  </tr>
                );
              })}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (rowActions ? 1 : 0) +
                      (showCheckboxes ? 1 : 0)
                    }
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    {loading ? "Loading…" : "No results."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-3 bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Squares2X2Icon className="h-4 w-4" />
            <span>Rows: </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 pr-7 text-xs"
            >
              {pageSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="hidden sm:inline">
              | Page {page} of {totalPages}
            </span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <button
              disabled={page === 1}
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              className="disabled:opacity-40 disabled:cursor-not-allowed rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium"
            >
              Prev
            </button>
            <span className="text-xs text-gray-600 px-2">
              {page}/{totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
              className="disabled:opacity-40 disabled:cursor-not-allowed rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Actions */}
      <div className="md:hidden fixed bottom-20 right-3 z-50 flex flex-col gap-3">
        {primaryActions && primaryActions.map((a, i) => {
            if (!a) return null;
            const content = (
                <>
                   {a.icon && <a.icon className="h-6 w-6" />}
                   {!a.icon && <span className="text-xs font-bold">{a.label && a.label.substring(0, 2).toUpperCase()}</span>}
                </>
            );
            const className = "flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-transform";
            
            if (a.type === "link") {
                return (
                    <Link key={a.label || i} href={a.href} className={className} aria-label={a.label}>
                        {content}
                    </Link>
                );
            }
            return (
                <button key={a.label || i} onClick={a.onClick} className={className} aria-label={a.label}>
                    {content}
                </button>
            );
        })}
      </div>
    </div>
  );
}