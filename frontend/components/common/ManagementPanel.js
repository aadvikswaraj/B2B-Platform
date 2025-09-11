import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "../ui/Button";
import clsx from "clsx";

function DotMenu({ actions = [] }) {
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
  skeletonCount, // optional: override how many skeleton rows/cards to show while loading
}) {
  const router = useRouter();
  const headerClasses = "px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600";
  const cellClasses = "px-4 py-2 whitespace-nowrap text-sm text-gray-800";
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

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
    return (
      <div
        key={getRowId(item)}
        className={clsx("rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-3", href && "cursor-pointer hover:bg-gray-50")}
        onClick={(e) => { if (href && !shouldIgnoreRowNav(e)) goTo(href); }}
        onKeyDown={(e) => { if (href && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); goTo(href); } }}
        role={href ? "link" : undefined}
        tabIndex={href ? 0 : undefined}
      >
      <div className="flex items-start justify-between gap-3">
        {selectable && (
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300"
            checked={selectedIds.includes(getRowId(item))}
            onChange={() => toggleSelect(getRowId(item))}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        )}
        <div className="flex-1 space-y-1">
          {columns.slice(0, 1).map((col) => (
            <div key={col.key} className="font-medium text-gray-900">
              {col.render ? col.render(item) : item[col.key]}
            </div>
          ))}
          {columns.slice(1).map((col) => (
            <div key={col.key} className="text-xs text-gray-600 flex gap-1">
              <span className="font-semibold">{col.header}:</span>
              <span>
                {col.render ? col.render(item) : item[col.key]}
              </span>
            </div>
          ))}
        </div>
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
        {selectable && <div className="h-4 w-4 rounded border border-gray-300 bg-gray-100" />}
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
      {selectable && (
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <button
            onClick={() => setShowFiltersMobile((s) => !s)}
            className="sm:hidden inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
          >
            <FunnelIcon className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
      {showFiltersMobile && (
        <div className="sm:hidden rounded-lg border border-gray-200 p-3 flex flex-wrap gap-3">
          {filters.map((f) => (
            <select
              key={f.key}
              value={activeFilters[f.key] || ""}
              onChange={(e) =>
                onFilterChange?.({ ...activeFilters, [f.key]: e.target.value })
              }
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
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
      )}
      <div className="md:hidden space-y-3">
        {loading && skeletonItems.map((_, i) => SkeletonCard(i))}
        {!loading && items.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            {loading ? "Loading…" : "No results."}
          </div>
        )}
        {!loading && items.map((item) =>
          defaultRenderCard(item)
        )}
      </div>
      <div className="rounded-lg border border-gray-200 bg-white hidden md:block">
        <div className="">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
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
                      {selectable && (
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
                      (selectable ? 1 : 0)
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
    </div>
  );
}