"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ManagementPanel from "@/components/common/ManagementPanel";
import { BrandVerificationAPI } from "@/utils/api/admin/brandVerification";
import { useAlert } from "@/components/ui/AlertManager";
import { useListQuery } from "@/utils/listQueryManager";

// Brand Verification list using the shared ManagementPanel for consistent admin UX
export default function BrandVerificationListPage() {
  const router = useRouter();
  const pushAlert = useAlert();

  // Single hook - all state managed internally
  const {
    items: docs,
    totalCount,
    loading,
    handlers,
  } = useListQuery({
    apiFn: BrandVerificationAPI.list,
    initialQuery: { filters: { status: "pending" } },
  });

  // Columns definition for ManagementPanel
  const columns = [
    {
      key: "name",
      header: "Brand",
      sortable: true,
      render: (row) => <span>{row.name}</span>,
    },
    {
      key: "seller",
      header: "Seller",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900 font-medium">
            {row.user?.name || "—"}
          </span>
          <span className="text-xs text-gray-500">{row.user?.email}</span>
        </div>
      ),
    },
    {
      key: "kycStatus",
      header: "Status",
      sortable: true,
      render: (row) => {
        const statusMap = {
          verified: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
          rejected: "bg-red-50 text-red-700 ring-red-600/20",
          pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
          suspended: "bg-gray-50 text-gray-600 ring-gray-600/20",
        };
        const style = statusMap[row.kyc?.status] || statusMap["pending"];

        return (
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${style} capitalize`}
          >
            {row.kyc?.status || "pending"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Submitted",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(row.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    // Replace action dropdown with a simple Review button
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Link
          href={`/admin/brand-verification/${row._id}`}
          className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all active:scale-95"
          onClick={(e) => e.stopPropagation()}
          aria-label="Review brand verification"
        >
          Review Application
        </Link>
      ),
    },
  ];

  // Filters config for ManagementPanel (mobile + desktop)
  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "verified", label: "Verified" },
        { value: "rejected", label: "Rejected" },
      ],
    },
  ];

  return (
    <div className="mt-5">
      <ManagementPanel
        title="Brand Verification"
        items={docs}
        itemLink={(item) => `/admin/brand-verification/${item._id}`}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        {...handlers}
        searchPlaceholder="Search brand name"
        filters={filters}
      />
    </div>
  );
}
