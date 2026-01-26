"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  CreditCardIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import VerificationPageBuilder from "@/components/admin/verification/VerificationPage";
import { useAlert } from "@/components/ui/AlertManager";
import {
  getSellerVerification,
  approveSeller,
  rejectSeller,
  SellerVerificationAPI,
} from "@/utils/api/admin/sellerVerification";

export default function SellerVerificationDetailPage() {
  const params = useParams();
  const userId = params?.userId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const pushAlert = useAlert();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const d = await getSellerVerification(userId);
      setData(d);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) load(); /* eslint-disable-next-line */
  }, [userId]);

  const handleGlobalDecision = async (decision, { reason } = {}) => {
    setSaving(true);
    try {
      if (decision === "verified") {
        await approveSeller(userId);
      } else {
        await rejectSeller(userId, reason);
      }
      pushAlert("success", `Seller ${decision}`);
      await load();
    } catch (e) {
      pushAlert("error", e.message || "Failed to update seller");
    } finally {
      setSaving(false);
    }
  };

  const handleSectionDecision = async (section, decision, reason) => {
    setSaving(true);
    try {
      await SellerVerificationAPI.verifySection(userId, {
        section,
        decision,
        reason,
      });
      pushAlert("success", `${section} ${decision}`);
      await load();
    } catch (e) {
      pushAlert("error", e.message || "Failed to update section");
    } finally {
      setSaving(false);
    }
  };

  const getSectionActions = (section, status) => [
    {
      label: "Verify",
      onClick: () => handleSectionDecision(section, "verified"),
      variant: "success",
      icon: CheckCircleIcon,
      disabled: status === "verified" || saving,
    },
    {
      label: "Reject",
      onClick: () => {
        const reason = prompt("Reason for rejection:");
        if (reason) handleSectionDecision(section, "rejected", reason);
      },
      variant: "danger",
      icon: XCircleIcon,
      disabled: status === "rejected" || saving,
    },
  ];

  if (error)
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded main-error">
        {error}
      </div>
    );

  const { user, profile, kyc, verificationStatus } = data || {};

  const sections = [
    {
      title: "Seller Profile",
      icon: UserCircleIcon,
      columns: 2,
      fields: [
        { label: "Name", value: user?.name },
        { label: "Email", value: user?.email },
        { label: "Phone", value: user?.phone },
        { label: "Company", value: profile?.companyName },
        { label: "Contact Person", value: profile?.contactPersonName },
        { label: "Category", value: profile?.businessCategory },
      ],
    },
    {
      title: "PAN Details",
      icon: IdentificationIcon,
      actions: getSectionActions("pan", kyc?.pan?.status),
      fields: [
        { label: "PAN Number", value: kyc?.pan?.pan },
        { label: "Name on PAN", value: kyc?.pan?.name },
        {
          label: "Document",
          type: "document",
          url: kyc?.pan?.fileUrl,
          fileName: "pan_card",
          icon: IdentificationIcon,
          span: 2,
        },
      ],
      children: kyc?.pan?.rejectedReason && (
        <div className="col-span-full mt-2 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
          <strong>Rejection Reason:</strong> {kyc.pan.rejectedReason}
        </div>
      ),
    },
    {
      title: "GSTIN Details",
      icon: BuildingOfficeIcon,
      actions: getSectionActions("gstin", kyc?.gstin?.status),
      fields: [
        { label: "GSTIN Number", value: kyc?.gstin?.gstin },
        {
          label: "Document",
          type: "document",
          url: kyc?.gstin?.fileUrl,
          fileName: "gstin_certificate",
          icon: DocumentTextIcon,
          span: 2,
        },
      ],
      children: kyc?.gstin?.rejectedReason && (
        <div className="col-span-full mt-2 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
          <strong>Rejection Reason:</strong> {kyc.gstin.rejectedReason}
        </div>
      ),
    },
    {
      title: "Signature",
      icon: DocumentTextIcon,
      actions: getSectionActions("signature", kyc?.signature?.status),
      fields: [
        {
          label: "Signature",
          type: "document",
          url: kyc?.signature?.fileUrl,
          fileName: "signature",
          icon: DocumentTextIcon,
          span: 2,
        },
      ],
      children: kyc?.signature?.rejectedReason && (
        <div className="col-span-full mt-2 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
          <strong>Rejection Reason:</strong> {kyc.signature.rejectedReason}
        </div>
      ),
    },
    {
      title: "Bank Account",
      icon: CreditCardIcon,
      actions: getSectionActions("bankAccount", kyc?.bankAccount?.status),
      fields: [
        { label: "Account Holder", value: kyc?.bankAccount?.accountHolder },
        { label: "Account Number", value: kyc?.bankAccount?.accountNumber },
        { label: "IFSC", value: kyc?.bankAccount?.ifsc },
        {
          label: "Cancelled Cheque",
          type: "document",
          url: kyc?.bankAccount?.cancelledChequeUrl,
          fileName: "cancelled_cheque",
          icon: CreditCardIcon,
          span: 2, // Assuming we want it full width or as fit
        },
      ],
      children: kyc?.bankAccount?.rejectedReason && (
        <div className="col-span-full mt-2 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
          <strong>Rejection Reason:</strong> {kyc.bankAccount.rejectedReason}
        </div>
      ),
    },
  ];

  return (
    <VerificationPageBuilder
      loading={loading}
      title={user?.name || "Loading..."}
      status={verificationStatus}
      onDecision={handleGlobalDecision}
      isSubmitting={saving}
      backHref="/admin/seller-verification"
      meta={[
        { label: "Email", value: user?.email, icon: UserCircleIcon },
        {
          label: "Company",
          value: profile?.companyName || "—",
          icon: BuildingOfficeIcon,
        },
      ]}
      sections={sections}
      skeletonConfig={{ sections: 4, fieldsPerSection: 4 }}
      verifyVariant="success"
    />
  );
}
