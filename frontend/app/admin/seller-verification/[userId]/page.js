"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getSellerVerification, approveSeller, rejectSeller, SellerVerificationAPI } from '@/utils/api/admin/sellerVerification';
import PageHeader from '@/components/ui/PageHeader';
import ReviewPage, { ReviewSection, ReviewField } from '@/components/ui/review/ReviewPage';
import { useAlert } from '@/components/ui/AlertManager';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function SellerVerificationDetailPage() {
  const params = useParams();
  const userId = params?.userId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const pushAlert = useAlert();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  const makeAbsolute = useMemo(() => (url) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return `http:${url}`;
    if (url.startsWith('/')) return `${API_BASE}${url}`;
    return url;
  }, [API_BASE]);

  const load = async () => {
    try { setLoading(true); setError(null); const d = await getSellerVerification(userId); setData(d); }
    catch(e){ setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ if(userId) load(); }, [userId]);

  const handleGlobalDecision = async (decision, { reason } = {}) => {
    setSaving(true);
    try {
      if (decision === 'verified') {
        await approveSeller(userId);
      } else {
        await rejectSeller(userId, reason);
      }
      pushAlert('success', `Seller ${decision}`);
      await load();
    } catch (e) {
      pushAlert('error', e.message || 'Failed to update seller');
    } finally {
      setSaving(false);
    }
  };

  const handleSectionDecision = async (section, decision, reason) => {
    setSaving(true);
    try {
      await SellerVerificationAPI.verifySection(userId, { section, decision, reason });
      pushAlert('success', `${section} ${decision}`);
      await load();
    } catch (e) {
      pushAlert('error', e.message || 'Failed to update section');
    } finally {
      setSaving(false);
    }
  };

  const getSectionActions = (section, status) => [
    {
      label: 'Verify',
      onClick: () => handleSectionDecision(section, 'verified'),
      variant: 'success',
      icon: CheckCircleIcon,
      disabled: status === 'verified' || saving,
    },
    {
      label: 'Reject',
      onClick: () => {
        const reason = prompt("Reason for rejection:");
        if (reason) handleSectionDecision(section, 'rejected', reason);
      },
      variant: 'danger',
      icon: XCircleIcon,
      disabled: status === 'rejected' || saving,
    }
  ];

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return null;

  const { user, profile, kyc, verificationStatus } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/seller-verification"
        title="Verify Seller"
        subtitle={`${user?.name || ''} • ${user?.email || ''}`}
      />

      <ReviewPage 
        status={verificationStatus} 
        onDecision={handleGlobalDecision} 
        isSubmitting={saving}
        title="Seller Actions"
        labels={{ verify: "Approve Seller", reject: "Reject Seller", verified: "Approved", rejected: "Rejected" }}
      >
        <ReviewSection title="Seller Profile" columns={2}>
          <ReviewField label="Name" value={user?.name} />
          <ReviewField label="Email" value={user?.email} />
          <ReviewField label="Phone" value={user?.phone} />
          <ReviewField label="Company" value={profile?.companyName} />
          <ReviewField label="Contact Person" value={profile?.contactPersonName} />
          <ReviewField label="Category" value={profile?.businessCategory} />
        </ReviewSection>

        <ReviewSection title="PAN" actions={getSectionActions('pan', kyc?.pan?.status)}>
          <ReviewField label="PAN Number" value={kyc?.pan?.pan} />
          <ReviewField label="Name on PAN" value={kyc?.pan?.name} />
          <ReviewField label="Document" value={
            kyc?.pan?.fileUrl ? (
              <a href={makeAbsolute(kyc.pan.fileUrl)} target="_blank" className="text-blue-600 underline">View File</a>
            ) : "No file"
          } />
          {kyc?.pan?.rejectedReason && <ReviewField label="Rejection Reason" value={kyc.pan.rejectedReason} span={2} />}
        </ReviewSection>

        <ReviewSection title="GSTIN" actions={getSectionActions('gstin', kyc?.gstin?.status)}>
          <ReviewField label="GSTIN Number" value={kyc?.gstin?.gstin} />
          <ReviewField label="Document" value={
            kyc?.gstin?.fileUrl ? (
              <a href={makeAbsolute(kyc.gstin.fileUrl)} target="_blank" className="text-blue-600 underline">View File</a>
            ) : "No file"
          } />
          {kyc?.gstin?.rejectedReason && <ReviewField label="Rejection Reason" value={kyc.gstin.rejectedReason} span={2} />}
        </ReviewSection>

        <ReviewSection title="Signature" actions={getSectionActions('signature', kyc?.signature?.status)}>
          <ReviewField label="Signature" value={
            kyc?.signature?.fileUrl ? (
              <div className="relative h-40 w-full overflow-hidden rounded border">
                <Image src={makeAbsolute(kyc.signature.fileUrl)} alt="Signature" fill className="object-contain" />
              </div>
            ) : "No file"
          } span={2} />
          {kyc?.signature?.rejectedReason && <ReviewField label="Rejection Reason" value={kyc.signature.rejectedReason} span={2} />}
        </ReviewSection>

        <ReviewSection title="Bank Account" actions={getSectionActions('bankAccount', kyc?.bankAccount?.status)}>
          <ReviewField label="Account Holder" value={kyc?.bankAccount?.accountHolder} />
          <ReviewField label="Account Number" value={kyc?.bankAccount?.accountNumber} />
          <ReviewField label="IFSC" value={kyc?.bankAccount?.ifsc} />
          <ReviewField label="Cancelled Cheque" value={
            kyc?.bankAccount?.cancelledChequeUrl ? (
              <a href={makeAbsolute(kyc.bankAccount.cancelledChequeUrl)} target="_blank" className="text-blue-600 underline">View File</a>
            ) : "No file"
          } />
          {kyc?.bankAccount?.rejectedReason && <ReviewField label="Rejection Reason" value={kyc.bankAccount.rejectedReason} span={2} />}
        </ReviewSection>
      </ReviewPage>
    </div>
  );
}
