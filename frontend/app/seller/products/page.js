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
  });

  const columns = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-500">
            <ProductImage product={p} />
          </span>
          <div>
            <div className="font-medium">{p.title}</div>
            <div className="text-[11px] text-gray-500">{p._id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: false,
      className: "text-xs text-gray-500",
      render: (p) => p.category?.name || p.category,
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (p) =>
        `$${p.price.singlePrice || p.price.slabs?.[0]?.price || 0}`,
    },
    { key: "stock", header: "Stock", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (p) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
            p.status === "active"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      sortable: true,
      render: (p) => (
        <span className="text-xs text-gray-500">
          {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "—"}
        </span>
      ),
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
        /* Delete Logic using API */
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
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
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
