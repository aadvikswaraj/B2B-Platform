"use client";
import { PlusIcon } from "@heroicons/react/24/outline";
import ManagementPanel from "@/components/common/ManagementPanel";
import { useAlert } from "@/components/ui/AlertManager";
import { useRouter } from "next/navigation";
import CategoryAPI from "@/utils/api/admin/categories";
import { useListQuery } from "@/utils/listQueryManager";

export default function CategoriesPage() {
  const router = useRouter();
  const pushAlert = useAlert();
  
  // Single hook - all state managed internally
  const { items: categories, setItems: setCategories, totalCount, setTotalCount, loading, handlers } = useListQuery({
    apiFn: CategoryAPI.list,
    initialQuery: { sort: { key: "name", direction: "asc" } },
  });

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      const serverResponse = await CategoryAPI.remove(id);
      if (serverResponse.success) {
        pushAlert("success", "Category deleted successfully");
        setCategories((prev) => prev.filter((c) => c._id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
      } else {
        pushAlert("error", serverResponse.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      pushAlert("error", "Failed to delete category");
    }
  };

  const bulkDelete = async (ids) => {
    if (!confirm(`Delete ${ids.length} selected categories?`)) return;
    try {
      await Promise.all(ids.map((id) => CategoryAPI.remove(id)));
      pushAlert("success", `${ids.length} categories deleted`);
      setCategories((prev) => prev.filter((c) => !ids.includes(c._id)));
      setTotalCount((prev) => Math.max(0, prev - ids.length));
    } catch (error) {
      console.error("Error bulk deleting:", error);
      pushAlert("error", "Failed to delete some categories");
    }
  };

  const bulkDisable = async (ids) => {
    if (!confirm(`Deactivate ${ids.length} selected categories?`)) return;
    try {
      const serverResponse = await CategoryAPI.bulkStatus(ids, false);
      if (serverResponse.success) {
        pushAlert("success", "Categories deactivated");
        setCategories((prev) =>
          prev.map((c) => (ids.includes(c._id) ? { ...c, isActive: false } : c))
        );
      } else {
        pushAlert("error", serverResponse.message || "Failed to deactivate");
      }
    } catch (error) {
      console.error("Error deactivating:", error);
      pushAlert("error", "Failed to deactivate categories");
    }
  };

  const bulkEnable = async (ids) => {
    if (!confirm(`Activate ${ids.length} selected categories?`)) return;
    try {
      const serverResponse = await CategoryAPI.bulkStatus(ids, true);
      if (serverResponse.success) {
        pushAlert("success", "Categories activated");
        setCategories((prev) =>
          prev.map((c) => (ids.includes(c._id) ? { ...c, isActive: true } : c))
        );
      } else {
        pushAlert("error", serverResponse.message || "Failed to activate");
      }
    } catch (error) {
      console.error("Error activating:", error);
      pushAlert("error", "Failed to activate categories");
    }
  };

  const rows = categories;

  const columns = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (c) => (
        <div>
          <p className="font-medium flex items-center gap-2">
            <span className={c.isActive === false ? "line-through text-gray-500" : ""}>
              {c.name}
            </span>
            {c.isActive === false && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-gray-200 text-gray-700">inactive</span>
            )}
          </p>
          {c.description && (
            <p className="text-[11px] text-gray-500 line-clamp-1">{c.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      sortable: true,
      className: "hidden md:table-cell text-xs text-gray-500",
    },
    {
      key: "parentCategory",
      header: "Parent",
      sortable: false,
      render: (c) =>
        c.parentCategory ? (
          <span className="text-xs text-gray-600">{c.parentCategory.name || "…"}</span>
        ) : (
          <span className="text-[11px] text-gray-400 italic">Top</span>
        ),
    },
    {
      key: "specifications",
      header: "Specs",
      render: (c) => (
        <div className="flex flex-wrap gap-1 max-w-[160px]">
          {c.specifications?.slice(0, 4).map((s, i) => (
            <span key={i} className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 font-medium">
              {s.name}
            </span>
          ))}
          {c.specifications?.length > 4 && <span className="text-[10px] text-gray-500">+{c.specifications.length - 4}</span>}
          {(!c.specifications || c.specifications.length === 0) && <span className="text-[10px] italic text-gray-400">None</span>}
        </div>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      render: (c) => {
        const comm = c.commission;
        return (
          <span className="text-[10px] text-gray-600">
            {comm?.mode === "inherit" && "inherit"}
            {comm?.mode === "exact" && `${comm.exact}%`}
            {comm?.mode === "slab" && `${comm.slabs?.length || 0} slabs`}
            {!comm && "—"}
          </span>
        );
      },
    },
  ];

  const rowActions = (c) => [
    { label: "Preview", onClick: () => router.push(`/admin/categories/${c._id}`) },
    { label: "Edit", onClick: () => router.push(`/admin/categories/${c._id}/edit`) },
    { label: "Delete", onClick: () => deleteCategory(c._id) },
  ];

  return (
    <div className="mt-5">
      <ManagementPanel
        title="Categories"
        items={rows}
        itemLink={(cat) => `/admin/categories/${cat._id}`}
        totalCount={totalCount}
        loading={loading}
        {...handlers}
        filters={[
          {key: "isActive", label: "Status", options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] },
          { key: "depth", label: "Depth", options: [{ value: "0", label: "Root" }, { value: "1", label: "Sub" }, { value: "2", label: "Micro" }] },
        ]}
        columns={columns}
        rowActions={rowActions}
        bulkActions={[
          { key: "delete", label: "Delete", onClick: (ids) => bulkDelete(ids) },
          { key: "disable", label: "Deactivate", onClick: (ids) => bulkDisable(ids) },
          { key: "enable", label: "Activate", onClick: (ids) => bulkEnable(ids) },
        ]}
        primaryActions={[
          { type: "link", label: "New Category", href: "/admin/categories/new", icon: PlusIcon },
        ]}
      />
    </div>
  );
}
