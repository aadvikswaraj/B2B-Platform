"use client";
import React, { useEffect, useState } from "react";
import ManagementPanel from "@/components/common/ManagementPanel";
import {
  PhotoIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { SellerProductsAPI } from "@/utils/api/seller/products";
import { useListQuery } from "@/utils/listQueryManager";
import { useRouter } from "next/navigation";
import Image from "next/image";
import fileApi from "@/utils/api/user/file";

function ProductImage({ product }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!product?.images?.[0]) return;
    fileApi
      .getUrl(product.images[0])
      .then((resp) => setUrl(resp.success ? resp.data.file.url : null));
  }, [product?.images?.[0]]);

  if (!product?.images?.[0]) return <PhotoIcon className="h-4 w-4" />;

  return url ? (
    <Image src={url} alt={product.title} width={32} height={32} />
  ) : (
    <div className="h-8 w-8 bg-gray-100 animate-pulse rounded" />
  );
}

export default function SellerManageProductsPage() {
  const router = useRouter();

  const { items, totalCount, loading, handlers } = useListQuery({
    apiFn: SellerProductsAPI.list,
    initialQuery: { filters: { status: "pending" } },
  });

  const columns = [
    {
      key: "title",
      header: "Product",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-50 border border-gray-100 text-gray-400 shrink-0">
            <ProductImage product={p} />
          </span>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900 line-clamp-1">
                {p.title}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide shrink-0 scale-90 origin-left">
                {p.salesMode || "ORDERS"}
              </span>
            </div>
            <div className="text-[11px] text-gray-500 line-clamp-1">
              {p.category?.name || "Uncategorized"}
            </div>
          </div>
        </div>
      ),
    },

    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (p) =>
        `$${p.price.singlePrice || p.price.slabs?.[0]?.price || 0}`,
    },

    {
      key: "isActive",
      header: "Active",
      sortable: true,
      render: (p) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full ${
            p.isActive !== false
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {p.isActive !== false ? "Yes" : "No"}
        </span>
      ),
    },
    { key: "stock", header: "Stock", sortable: true },

    {
      key: "moderation",
      header: "Status",
      sortable: false,
      render: (p) => {
        const status = p.moderation?.status || "pending";
        const hasPending = p.pendingUpdates?.status === "pending";

        return (
          <div className="flex flex-col gap-1 items-start">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full capitalization ${
                status === "approved"
                  ? "bg-blue-50 text-blue-700"
                  : status === "rejected"
                    ? "bg-red-50 text-red-700"
                    : "bg-orange-50 text-orange-700"
              }`}
            >
              {status}
            </span>
            {hasPending && (
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                Update Pending
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const rowActions = (p) => [
    {
      label: "Edit Details",
      icon: DocumentTextIcon,
      onClick: () => {
        router.push(`/seller/products/${p._id || p.id}/edit`);
      },
    },
    {
      label: "Edit Trade Info",
      icon: CurrencyDollarIcon,
      onClick: () => {
        router.push(`/seller/products/${p._id || p.id}/trade`);
      },
    },
    {
      label: "Delete",
      icon: TrashIcon,
      onClick: () => {
        // Delete Logic
      },
    },
  ];

  return (
    <div className="space-y-8">
      <ManagementPanel
        title={"Products"}
        items={items}
        totalCount={totalCount}
        columns={columns}
        loading={loading}
        {...handlers}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "pending", label: "Pending" },
              { value: "pending_update", label: "Pending Update (Approved)" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ],
          },
          {
            key: "isOrder",
            label: "Mode",
            options: [
              { value: "", label: "All" },
              { value: "true", label: "Orders" },
              { value: "false", label: "Inquiry" },
            ],
          },
          {
            key: "isActive",
            label: "Is Active",
            options: [
              { value: "", label: "All" },
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ],
          },
        ]}
        rowActions={rowActions}
        primaryActions={[
          {
            type: "link",
            label: "Add Product",
            href: "/seller/products/new",
            icon: PlusCircleIcon,
          },
        ]}
      />
    </div>
  );
}
