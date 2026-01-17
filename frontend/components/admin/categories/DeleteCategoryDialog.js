"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import CategoryAPI from "@/utils/api/admin/categories";

export default function DeleteCategoryDialog({ open, onClose, category, onDeleted }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const categoryId = category?._id || category?.id;

  useEffect(() => setMounted(true), []);

  if (!mounted || !open) return null;

  async function handleConfirm() {
    if (!categoryId) return;
    setLoading(true);
    try {
      const res = await CategoryAPI.remove(categoryId);
      if (res?.success) {
        onDeleted?.(categoryId);
        onClose?.();
      } else {
        // Basic alert fallback; project uses AlertManager in pages typically
        alert(res?.message || "Delete failed");
      }
    } catch (e) {
      alert(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30" onClick={loading ? undefined : onClose} />
      <div className="absolute inset-0 flex items-end sm:items-center sm:justify-center p-3 sm:p-6">
        <div className="w-full sm:max-w-lg rounded-2xl sm:rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">Delete category: {category?.name}</h3>
                <p className="mt-1 text-xs text-gray-600">
                  This will permanently remove the category. Products or children referencing this category may need manual cleanup.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleConfirm} icon={loading ? ArrowPathIcon : undefined}>
                {loading ? "Deleting..." : "Delete Category"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
