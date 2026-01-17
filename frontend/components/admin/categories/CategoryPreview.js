"use client";
/**
 * CategoryPreview
 * Reusable read-only view for a product category. Matches Roles preview layout.
 */
import React, { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import SpecsPreview from "@/components/admin/categories/editor/SpecsPreview";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import DeleteCategoryDialog from "./DeleteCategoryDialog";

function CommissionBadge({ commission }) {
  if (!commission) return <span className="text-[11px] text-gray-400">—</span>;
  if (commission.mode === "inherit")
    return (
      <span className="inline-flex items-center rounded bg-gray-100 text-gray-700 px-2 py-0.5 text-[10px] font-medium">
        Inherit
      </span>
    );
  if (commission.mode === "exact")
    return (
      <span className="inline-flex items-center rounded bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-medium">
        {commission.exact}%
      </span>
    );
  if (commission.mode === "slab")
    return (
      <span className="inline-flex items-center rounded bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-medium">
        {commission.slabs?.length || 0} slabs
      </span>
    );
  return <span className="text-[11px] text-gray-400">—</span>;
}

function LabelValue({ label, children }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-28 shrink-0 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}
      </span>
      <div className="text-gray-800">{children}</div>
    </div>
  );
}

export default function CategoryPreview({ category, parentPath = [], onEdit, onBack }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  const imageUrl = useMemo(() => {
    const src = category?.imageUrl || category?.image?.relativePath;
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("//")) return `http:${src}`;
    if (src.startsWith("/")) return `${API_BASE}${src}`;
    return src;
  }, [category, API_BASE]);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/categories"
        backLabel="Categories"
        title={category?.name || "Category"}
        subtitle={category?.createdAt ? `Created ${new Date(category.createdAt).toLocaleDateString()}` : ""}
        badge={category?.isActive === false ? "Inactive" : undefined}
        primaryLabel="Edit Category"
        primaryIcon={PencilSquareIcon}
        onPrimary={() => onEdit?.()}
        secondaryActions={[{ label: "Delete", variant: "danger", icon: TrashIcon, onClick: () => setShowDelete(true) }]}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-4">Overview</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium text-gray-900">{category?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Slug</dt>
                <dd className="font-medium text-gray-900">{category?.slug || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Parent</dt>
                <dd className="font-medium text-gray-900">
                  {category?.parentCategory ? (
                    <span className="inline-flex items-center gap-2">
                      <Link className="text-indigo-700 hover:underline" href={`/admin/categories/${category.parentCategory._id || category.parentCategory}`}>
                        {category.parentCategory.name || "View"}
                      </Link>
                      {parentPath?.length > 0 && (
                        <span className="text-[10px] text-gray-500">({parentPath.map((p) => p.name).join(" / ")})</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-500">Top Level</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Commission</dt>
                <dd className="font-medium text-gray-900"><CommissionBadge commission={category?.commission} /></dd>
              </div>
              {category?.createdAt && (
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="font-medium text-gray-900">{new Date(category.createdAt).toLocaleDateString()}</dd>
                </div>
              )}
              {category?.updatedAt && (
                <div>
                  <dt className="text-gray-500">Updated</dt>
                  <dd className="font-medium text-gray-900">{new Date(category.updatedAt).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
            {category?.description && (
              <div className="mt-4">
                <dt className="text-gray-500 text-sm">Description</dt>
                <dd className="text-sm text-gray-700 mt-1">{category.description}</dd>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-wide text-gray-700">Specifications</h2>
            </div>
            <SpecsPreview specs={category?.specifications || []} />
          </section>
        </div>
        <aside className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-4">Image</h2>
            {imageUrl ? (
              <img src={imageUrl} alt={category?.name || "Category image"} className="w-full max-h-56 object-contain rounded" />
            ) : (
              <div className="text-xs text-gray-400">No image</div>
            )}
          </section>
        </aside>
      </div>

      <DeleteCategoryDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        category={category}
        onDeleted={() => {
          // Redirect back to list after deletion
          window.location.href = "/admin/categories";
        }}
      />
    </div>
  );
}
