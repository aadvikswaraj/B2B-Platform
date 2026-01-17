"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  ArrowPathIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function statusMeta(status) {
  if (status === "verified") {
    return {
      label: "Verified",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (status === "rejected") {
    return {
      label: "Rejected",
      pill: "bg-red-50 text-red-700 border-red-200",
    };
  }
  return {
    label: "Pending",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  };
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-gray-500 text-sm">{label}</dt>
      <dd className="font-medium text-gray-900 mt-0.5 break-words">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function BrandPreview({ brand }) {
  const status = brand?.kyc?.status || "pending";
  const meta = statusMeta(status);

  const proofUrl = useMemo(() => {
    const f = brand?.kyc?.file;
    if (!f) return null;
    if (typeof f === "string") return null;
    return f?.url || null;
  }, [brand]);

  return (
    <div className="space-y-6 pb-20 mt-5 sm:pb-0">
      <PageHeader
        backHref="/seller/brands"
        backLabel="Brands"
        title={brand?.name || "Brand"}
        subtitle={brand?.createdAt ? `Created ${new Date(brand.createdAt).toLocaleDateString()}` : ""}
        badge={meta.label}
        primaryLabel="Manage"
        primaryIcon={PencilSquareIcon}
        primaryHref={brand?._id ? `/seller/brands/${brand._id}/edit` : "/seller/brands"}
        secondaryActions={
          status !== "verified" && brand?._id
            ? [
                {
                  label: "Resubmit Proof",
                  href: `/seller/brands/${brand._id}/edit`,
                  icon: ArrowPathIcon,
                  variant: "outline",
                },
              ]
            : []
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {status === "rejected" && brand?.kyc?.rejectedReason ? (
            <Card className="!border-red-200 !bg-red-50">
              <h2 className="text-sm font-semibold tracking-wide text-red-800">
                Rejection Reason
              </h2>
              <p className="text-sm text-red-700 mt-2">
                {brand.kyc.rejectedReason}
              </p>
            </Card>
          ) : null}

          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Overview
                </h2>
                <p className="text-sm text-gray-500">
                  Brand verification status and proof details.
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.pill}`}
              >
                {meta.label}
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-sm">
              <Field label="Brand Name" value={brand?.name} />
              <Field label="Status" value={meta.label} />
              <Field label="Created" value={formatDate(brand?.createdAt)} />
              <Field label="Updated" value={formatDate(brand?.updatedAt)} />
            </dl>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader title="Proof Document" />

            {proofUrl ? (
              <div className="space-y-3">
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-full rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                >
                  View Proof
                </a>
                <p className="text-xs text-gray-500 text-center">
                  Opens in a new tab
                </p>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No proof uploaded.</div>
            )}
          </Card>

          <Card>
            <CardHeader title="Quick Links" />
            {brand?._id ? (
              <div className="flex flex-col gap-2">
                <Link
                  href={`/seller/brands/${brand._id}/edit`}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Edit Brand Details
                </Link>
                <Link
                  href="/seller/brands"
                  className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                >
                  Back to List
                </Link>
              </div>
            ) : (
              <div className="text-sm text-gray-500">—</div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
