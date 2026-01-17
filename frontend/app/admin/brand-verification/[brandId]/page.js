"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import ReviewPage, { ReviewSection, ReviewField } from '@/components/ui/review/ReviewPage';
import { useAlert } from '@/components/ui/AlertManager';
import { BrandVerificationAPI } from '@/utils/api/admin/brandVerification';

export default function BrandVerificationDetailPage(){
  const params = useParams();
  const brandId = params?.brandId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const pushAlert = useAlert();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  const abs = useMemo(() => (url) => {
    if (!url) return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${API_BASE}${url}`;
    return url;
  }, [API_BASE]);

  const load = async () => {
    try { 
      setLoading(true); 
      setError(null); 
      const res = await BrandVerificationAPI.get(brandId);
      if (!res.success) throw new Error(res.message || 'Failed to load');
      setData(res.data);
    }
    catch(e){ setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ if(brandId) load(); /* eslint-disable-next-line */ }, [brandId]);

  const handleDecision = async (decision, { reason } = {}) => {
    setSaving(true);
    try {
      await BrandVerificationAPI.verifyDecision(brandId, { decision, reason });
      pushAlert('success', `Brand ${decision}`);
      await load();
    } catch (e) {
      pushAlert('error', e.message || 'Failed to update decision');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data?.brand) return null;

  const { brand } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/brand-verification"
        backLabel="Back to list"
        title={`Verify Brand: ${brand?.name || ''}`}
        subtitle={brand?.seller ? `${brand.seller.name} • ${brand.seller.email} • ${brand.seller.phone || ''}` : 'Submitted brand'}
      />

      <ReviewPage 
        status={brand?.kyc?.status} 
        onDecision={handleDecision} 
        isSubmitting={saving}
        title="Brand Actions"
      >
        <ReviewSection title="Brand Details" columns={2}>
          <ReviewField label="Brand Name" value={brand?.name} />
          <ReviewField label="Seller Name" value={brand?.seller?.name} />
          <ReviewField label="Seller Email" value={brand?.seller?.email} />
          <ReviewField label="Seller Phone" value={brand?.seller?.phone} />
        </ReviewSection>

        <ReviewSection title="Documents">
          <ReviewField label="Proof Document" value={
            brand?.kyc?.file?.url ? (
              <a href={abs(brand.kyc.file.url)} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-800">
                View Uploaded Proof
              </a>
            ) : "No proof uploaded"
          } />
          {brand?.kyc?.rejectedReason && (
            <ReviewField label="Rejection Reason" value={brand.kyc.rejectedReason} span={2} />
          )}
        </ReviewSection>
      </ReviewPage>
    </div>
  );
}
