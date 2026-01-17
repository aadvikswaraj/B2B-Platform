"use client";

import { useMemo, useState } from "react";
import ManagementPanel from "@/components/common/ManagementPanel";
import { SellerVerificationAPI } from "@/utils/api/admin/sellerVerification";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/ui/AlertManager";
import { useListQuery } from "@/utils/listQueryManager";

export default function SellerVerificationListPage() {
  const router = useRouter();
  const pushAlert = useAlert();
  const [reminder, setReminder] = useState({ open: false, row: null });
  
  // Single hook - all state managed internally
  const { items, totalCount, loading, handlers } = useListQuery({
    apiFn: SellerVerificationAPI.list,
    initialQuery: { filters: { status: 'pending' } },
  });

  const columns = useMemo(
    () => [
      {
        key: "user",
        header: "User",
        sortable: false,
        render: (row) => (
          <div>
            <div className="font-medium text-gray-900">
              {row.user?.name || "—"}
            </div>
            <div className="text-gray-500">{row.user?.email}</div>
            <div className="text-gray-500">{row.user?.phone}</div>
          </div>
        ),
      },
      {
        key: "business",
        header: "Business",
        sortable: false,
        render: (row) => (
          <div>
            <div className="text-gray-900">
              {row.profile?.businessCategory || "—"}
            </div>
            <div className="text-gray-500">
              Emp: {row.profile?.employeeCount || "—"}, Turnover:{" "}
              {row.profile?.annualTurnover || "—"}
            </div>
          </div>
        ),
      },
      {
        key: "step",
        header: "Step",
        sortable: false,
        render: (row) => (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {row.step}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: false,
        render: (row) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.verificationStatus === "verified"
                ? "bg-emerald-100 text-emerald-700"
                : row.verificationStatus === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}
          >
            {row.verificationStatus}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        render: (row) => (
          <div className="flex gap-2">
            {row.step === 'completed' ? (
              <Button size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/admin/seller-verification/${row.user?._id}`); }}>Review</Button>
            ) : (
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setReminder({ open: true, row }); }}>Reminder</Button>
            )}
          </div>
        ),
      }
    ],
    [router, setReminder]
  );

  return (
    <div className="mt-5">
      <ManagementPanel
        title="Seller Verification"
        items={items}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        getRowId={(r) => r.user?._id}
        itemLink={(r) =>
          r.user?._id ? `/admin/seller-verification/${r.user._id}` : null
        }
        {...handlers}
        searchPlaceholder="Search name, email, phone"
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "pending", label: "Pending" },
              { value: "verified", label: "Verified" },
              { value: "rejected", label: "Rejected" },
            ],
          },
          {
            key: "step",
            label: "Step",
            options: [
              { value: "anyIncomplete", label: "Any Incomplete" },
              { value: "businessKYC", label: "Business KYC" },
              { value: "bankAccount", label: "Bank Account" },
              { value: "additionalBusinessDetails", label: "Additional Business Details" },
              { value: "pickupAddress", label: "Pickup Address" },
              { value: "completed", label: "Completed" }
            ]
          }
        ]}
        primaryActions={[]}
        enableSorting={false}
      />
      <ReminderModal state={reminder} onClose={() => setReminder({ open: false, row: null })} />
    </div>
  );
}

function ReminderModal({ state, onClose }) {
  const open = !!state?.open;
  const row = state?.row;
  const contact = row?.user || {};
  const step = row?.step;
  const template = `Hi ${contact.name || 'there'},\n\nPlease complete your seller registration. Current step: ${step}.\n\nThanks!`;
  return (
    <Modal open={open} onClose={onClose} title="Send Reminder" size="md">
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] text-gray-500">Name</div>
            <div className="font-medium text-gray-900">{contact.name || '—'}</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-500">Phone</div>
            <div className="font-medium text-gray-900">{contact.phone || '—'}</div>
          </div>
          <div className="col-span-2">
            <div className="text-[11px] text-gray-500">Email</div>
            <div className="font-medium text-gray-900">{contact.email || '—'}</div>
          </div>
        </div>
        <div>
          <div className="text-[11px] text-gray-500 mb-1">Message</div>
          <textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={4} defaultValue={template} />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button onClick={onClose}>Send Reminder</Button>
      </div>
    </Modal>
  );
}