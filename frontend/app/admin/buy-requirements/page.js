"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BuyRequirementAPI from "@/utils/api/admin/buyRequirements";
import ManagementPanel from "@/components/common/ManagementPanel";
import { useAlert } from "@/components/ui/AlertManager";
import { useListQuery } from "@/utils/listQueryManager";
import BuyRequirementPreview from "@/components/admin/buyRequirements/BuyRequirementPreview";

export default function BuyRequirementsPage() {
  const router = useRouter();
  const pushAlert = useAlert();

  // Single hook - all state managed internally
  const {
    items: docs,
    totalCount,
    loading,
    handlers,
  } = useListQuery({
    apiFn: BuyRequirementAPI.list,
    initialQuery: { filters: { verificationStatus: "pending" }, pageSize: 20 },
  });

  const columns = [
    {
      key: "product",
      header: "Product",
      sortable: true,
      render: (row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.productName}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-xs">
            {row.description}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Qty: {row.quantity} {row.unit}
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "Buyer",
      render: (row) => (
        <div>
          <div className="text-sm text-gray-900">{row.user?.name}</div>
          <div className="text-xs text-gray-500">{row.user?.email}</div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-gray-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <div>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium 
            ${
              row.verification?.status === "verified"
                ? "bg-emerald-100 text-emerald-700"
                : row.verification?.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {row.verification?.status || "pending"}
          </span>
          {row.verification?.category && (
            <div className="text-xs text-indigo-600 mt-1">
              {row.verification.category.name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Link
          href={`/admin/buy-requirements/${row._id}`}
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
          aria-label="Review buy requirement"
        >
          Review
        </Link>
      ),
    },
  ];

  const filters = [
    {
      key: "verificationStatus",
      label: "Verification Status",
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
        title="Buy Requirements"
        items={docs}
        itemLink={(item) => `/admin/buy-requirements/${item._id}`}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        {...handlers}
        searchPlaceholder="Search product name"
        filters={filters}        renderItem={(props) => <BuyRequirementPreview {...props} />}      />
    </div>
  );
}
