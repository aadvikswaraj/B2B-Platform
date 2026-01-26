"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import VerificationPage from "@/components/admin/verification/VerificationPage";
import { useAlert } from "@/components/ui/AlertManager";
import { BrandVerificationAPI } from "@/utils/api/admin/brandVerification";
import {
  BuildingStorefrontIcon,
  UserCircleIcon,
  DocumentCheckIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
export default function BrandVerificationDetailPage() {
  const params = useParams();
  const brandId = params?.brandId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const pushAlert = useAlert();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await BrandVerificationAPI.get(brandId);
      if (!res.success) throw new Error(res.message || "Failed to load");
      // Assuming res.data is the brand object itself based on backend service
      setData(res.data);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brandId) load(); /* eslint-disable-next-line */
  }, [brandId]);

  const handleDecision = async (decision, { reason } = {}) => {
    setSaving(true);
    try {
      await BrandVerificationAPI.verifyDecision(brandId, { decision, reason });
      pushAlert("success", `Brand ${decision}`);
      await load();
    } catch (e) {
      pushAlert("error", e.message || "Failed to update decision");
    } finally {
      setSaving(false);
    }
  };

  if (error)
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded-lg m-4">{error}</div>
    );

  // Configuration for the Page Builder
  const sections = [
    {
      title: "Brand Information",
      icon: BuildingStorefrontIcon,
      columns: 2,
      fields: [{ label: "Brand Name", value: data?.name }],
    },
    {
      title: "Verification Documents",
      icon: DocumentCheckIcon,
      fields: [
        {
          label: "Proof of Authorization",
          type: "document",
          url: data?.kyc?.file?.url,
          fileName: "verification_document",
          span: 2,
          icon: DocumentCheckIcon,
        },
      ],
      children: data?.kyc?.rejectedReason ? (
        <div className="col-span-full mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-1">
            Rejection Reason
          </p>
          <p className="text-sm text-red-700">{data.kyc.rejectedReason}</p>
        </div>
      ) : null,
    },
  ];

  return (
    <VerificationPage
      loading={loading}
      title={data?.name || "Loading..."}
      logo={data?.logo}
      status={data?.kyc?.status}
      onDecision={handleDecision}
      isSubmitting={saving}
      backHref="/admin/brand-verification"
      meta={[
        {
          label: "Submitted by",
          value: data?.seller?.name || data?.user?.name || "Unknown",
          icon: UserCircleIcon,
        },
        {
          label: "Created on",
          value: new Date(data?.createdAt || Date.now()).toLocaleDateString(),
          icon: DocumentCheckIcon,
        },
      ]}
      sections={sections}
      skeletonConfig={{ sections: 3, fieldsPerSection: 4 }}
    />
  );
}
