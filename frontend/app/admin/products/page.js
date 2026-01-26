"use client";
import { useState } from "react";
import ManagementPanel from "@/components/common/ManagementPanel";
import { ProductVerificationAPI } from "@/utils/api/admin/productVerification";
import { useListQuery } from "@/utils/listQueryManager";
import { useAlert } from "@/components/ui/AlertManager";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { EyeIcon } from "@heroicons/react/24/outline";

export default function AdminProductsPage() {
  const [tab, setTab] = useState("review"); // 'review' | 'search'
  const [decisionModal, setDecisionModal] = useState(null); // { product, action }
  const [decisionReason, setDecisionReason] = useState("");
  const pushAlert = useAlert();

  const {
    items: pendingItems,
    totalCount: pendingTotal,
    loading: pendingLoading,
    handlers: pendingHandlers,
    refetch: refetchPending,
  } = useListQuery({
    apiFn: ProductVerificationAPI.list,
    initialQuery: { filters: { status: "pending" } },
  });

  const {
    items: catalogItems,
    totalCount: catalogTotal,
    loading: catalogLoading,
    handlers: catalogHandlers,
    refetch: refetchCatalog,
  } = useListQuery({
    apiFn: ProductVerificationAPI.list,
    initialQuery: {},
  });

  const handleDecision = async () => {
    if (!decisionModal) return;
    const { product, action } = decisionModal;

    try {
      let res;
      if (action === "approve") {
        res = await ProductVerificationAPI.verifyDecision(product._id, {
          decision: "approved",
        });
      } else if (action === "reject") {
        res = await ProductVerificationAPI.verifyDecision(product._id, {
          decision: "rejected",
          reason: decisionReason,
        });
      }

      if (res && res.success) {
        pushAlert("success", `Product ${action}d successfully`);
        setDecisionModal(null);
        setDecisionReason("");
        refetchPending();
        refetchCatalog();
      } else {
        pushAlert("error", res?.message || "Action failed");
      }
    } catch (error) {
      console.error(error);
      pushAlert("error", "Action failed");
    }
  };

  const productColumns = [
    {
      key: "product",
      header: "Product",
      render: (p) => (
        <div className="flex items-center gap-3 max-w-[220px]">
          {/* Use fallback image logic if needed */}
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500">
            Img
          </div>
          <div className="flex flex-col">
            <span
              className="font-medium leading-tight line-clamp-1"
              title={p.title || p.name}
            >
              {p.title || p.name}
            </span>
            <span className="text-[11px] text-gray-500">{p._id}</span>
          </div>
        </div>
      ),
    },
    {
      key: "seller",
      header: "Seller",
      className: "hidden md:table-cell",
      render: (p) => (
        <div>
          <div className="text-sm text-gray-900">
            {p.seller?.name || p.user?.name}
          </div>
          <div className="text-xs text-gray-500">
            {p.seller?.email || p.user?.email}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      className: "hidden lg:table-cell",
      render: (p) => p.category?.name || "—",
    },
    {
      key: "price",
      header: "Price",
      render: (p) => `${p.price} ${p.currency || "USD"}`,
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <span
          className={`px-2 inline-flex text-xs font-semibold rounded-full capitalize ${
            (p.moderationStatus || p.status) === "approved" ||
            (p.moderationStatus || p.status) === "active"
              ? "bg-emerald-100 text-emerald-700"
              : (p.moderationStatus || p.status) === "pending"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-600"
          }`}
        >
          {p.moderationStatus || p.status || "unknown"}
        </span>
      ),
    },
  ];

  const reviewActions = (row) => [
    {
      label: "Approve",
      onClick: () => setDecisionModal({ product: row, action: "approve" }),
    },
    {
      label: "Reject",
      onClick: () => setDecisionModal({ product: row, action: "reject" }),
    },
  ];

  const categoryOptions = [
    { value: "Electronics", label: "Electronics" },
    { value: "Home & Living", label: "Home & Living" },
    // Ideally these load from API too
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="mt-5 space-y-6">
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`pb-2 px-1 ${tab === "review" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setTab("review")}
        >
          Review Queue ({pendingTotal})
        </button>
        <button
          className={`pb-2 px-1 ${tab === "search" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setTab("search")}
        >
          Product Catalog
        </button>
      </div>

      {tab === "review" && (
        <ManagementPanel
          title="Product Review Queue"
          items={pendingItems}
          totalCount={pendingTotal}
          loading={pendingLoading}
          columns={productColumns}
          getRowId={(r) => r._id}
          rowActions={reviewActions}
          {...pendingHandlers}
          searchPlaceholder="Search products..."
          emptyState={
            <p className="text-xs text-gray-500">No pending products 🎉</p>
          }
        />
      )}

      {tab === "search" && (
        <ManagementPanel
          title="Product Catalog"
          items={catalogItems}
          totalCount={catalogTotal}
          loading={catalogLoading}
          columns={productColumns}
          getRowId={(r) => r._id}
          {...catalogHandlers}
          searchPlaceholder="Search catalog..."
          filters={[
            // { key: 'category', label: 'Category', options: categoryOptions },
            { key: "status", label: "Status", options: statusOptions },
          ]}
        />
      )}

      {decisionModal && (
        <Modal
          isOpen={!!decisionModal}
          onClose={() => setDecisionModal(null)}
          title={`${decisionModal.action === "approve" ? "Approve" : "Reject"} Product`}
        >
          <div className="space-y-4">
            <p>
              Are you sure you want to {decisionModal.action}{" "}
              <b>{decisionModal.product.title || decisionModal.product.name}</b>
              ?
            </p>
            {decisionModal.action === "reject" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  className="w-full border rounded-md p-2"
                  rows={3}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                />
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDecisionModal(null)}>
                Cancel
              </Button>
              <Button
                variant={
                  decisionModal.action === "approve" ? "primary" : "danger"
                }
                onClick={handleDecision}
                disabled={
                  decisionModal.action === "reject" && !decisionReason.trim()
                }
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
