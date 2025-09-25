"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSellerVerification, updateSellerStatuses, approveSeller, rejectSeller } from '@/utils/api/admin/sellerVerification';
import PageHeader from '@/components/ui/PageHeader';

export default function SellerVerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Define API base and makeAbsolute early so hooks run consistently every render
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  const makeAbsolute = useMemo(() => (url) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return `http:${url}`; // fallback
    if (url.startsWith('/')) return `${API_BASE}${url}`;
    return url;
  }, [API_BASE]);

  const load = async () => {
    try { setLoading(true); setError(null); const d = await getSellerVerification(userId); setData(d); }
    catch(e){ setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ if(userId) load(); /* eslint-disable-next-line */ }, [userId]);

  const setStatus = async (section, status) => {
    setSaving(true);
    try {
      const payload = { [section]: { status } };
      await updateSellerStatuses(userId, payload);
      await load();
    } catch (e) { alert(e.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const approve = async () => {
    setSaving(true);
    try { await approveSeller(userId); await load(); }
    catch(e){ alert(e.message || 'Failed to approve'); }
    finally { setSaving(false); }
  };

  const reject = async () => {
    setSaving(true);
    try { await rejectSeller(userId, rejectReason); await load(); }
    catch(e){ alert(e.message || 'Failed to reject'); }
    finally { setSaving(false); }
  };

  const SectionCard = ({ title, children, status, onVerify, onReject }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status==='verified'?'bg-emerald-100 text-emerald-700':status==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{status || 'pending'}</span>
          <button disabled={saving} onClick={onVerify} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">Mark Verified</button>
          <button disabled={saving} onClick={onReject} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">Reject</button>
        </div>
      </div>
      {children}
    </div>
  );

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return null;

  const { user, profile, kyc, step, verificationStatus } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/seller-verification"
        backLabel="Back to list"
        title="Verify Seller"
        subtitle={`${user?.name || ''} • ${user?.email || ''} • ${user?.phone || ''}`}
        badge={<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${verificationStatus==='verified'?'bg-emerald-100 text-emerald-700':verificationStatus==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{verificationStatus}</span>}
        secondaryActions={[
          { label: 'Reject', onClick: reject, variant: 'danger', disabled: saving },
        ]}
        primaryLabel="Approve Seller"
        onPrimary={approve}
        primaryDisabled={saving}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="PAN" status={kyc?.pan?.status} onVerify={()=>setStatus('pan','verified')} onReject={()=>setStatus('pan','rejected')}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <div className="text-sm">Number: <span className="font-medium">{kyc?.pan?.pan}</span></div>
              </div>
              <div className="">
                {kyc?.pan?.fileUrl ? <a href={makeAbsolute(kyc.pan.fileUrl)} target="_blank" className="text-blue-600 underline">View File</a> : <span className="text-gray-500 text-sm">No file</span>}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="GSTIN" status={kyc?.gstin?.status} onVerify={()=>setStatus('gstin','verified')} onReject={()=>setStatus('gstin','rejected')}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <div className="text-sm">Number: <span className="font-medium">{kyc?.gstin?.gstin}</span></div>
              </div>
              <div className="">
                {kyc?.gstin?.fileUrl ? <a href={makeAbsolute(kyc.gstin.fileUrl)} target="_blank" className="text-blue-600 underline">View File</a> : <span className="text-gray-500 text-sm">No file</span>}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Signature" status={kyc?.signature?.status} onVerify={()=>setStatus('signature','verified')} onReject={()=>setStatus('signature','rejected')}>
            <div>
              {kyc?.signature?.fileUrl ? (
                <div className="relative h-40 w-full overflow-hidden rounded border">
                  <Image src={makeAbsolute(kyc.signature.fileUrl)} alt="Signature" fill className="object-contain" />
                </div>
              ) : <span className="text-gray-500 text-sm">No file</span>}
            </div>
          </SectionCard>

          <SectionCard title="Bank Account" status={kyc?.bankAccount?.status} onVerify={()=>setStatus('bankAccount','verified')} onReject={()=>setStatus('bankAccount','rejected')}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <div className="text-sm">Holder: <span className="font-medium">{kyc?.bankAccount?.accountHolder}</span></div>
                <div className="text-sm">Account: <span className="font-medium">{kyc?.bankAccount?.accountNumber}</span></div>
                <div className="text-sm">IFSC: <span className="font-medium">{kyc?.bankAccount?.ifsc}</span></div>
              </div>
              <div className="sm:col-span-2">
                {kyc?.bankAccount?.cancelledChequeUrl ? <a href={makeAbsolute(kyc.bankAccount.cancelledChequeUrl)} target="_blank" className="text-blue-600 underline">View Cancelled Cheque</a> : <span className="text-gray-500 text-sm">No file</span>}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Business Profile</h3>
            <div className="text-sm text-gray-700">Contact Person: <span className="font-medium">{profile?.contactPersonName || '—'}</span></div>
            <div className="text-sm text-gray-700">Category: <span className="font-medium">{profile?.businessCategory || '—'}</span></div>
            <div className="text-sm text-gray-700">Employee Count: <span className="font-medium">{profile?.employeeCount || '—'}</span></div>
            <div className="text-sm text-gray-700">Turnover: <span className="font-medium">{profile?.annualTurnover || '—'}</span></div>
            <div className="text-sm text-gray-700">Desc: <span className="font-medium">{profile?.description || '—'}</span></div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${profile?.verification?.status==='verified'?'bg-emerald-100 text-emerald-700':profile?.verification?.status==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{profile?.verification?.status || 'pending'}</span>
              <div className="flex items-center gap-2">
                <button disabled={saving} onClick={()=>updateSellerStatuses(userId,{ profile: { status: 'verified' } }).then(load)} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">Mark Profile Verified</button>
                <button disabled={saving} onClick={()=>updateSellerStatuses(userId,{ profile: { status: 'rejected' } }).then(load)} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">Reject</button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Decision</h3>
            <div className="mb-2 text-xs text-gray-500">Use quick approve to verify all sections and mark the user as a seller, or reject with a reason.</div>
            <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="Rejection reason (optional)" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500" />
            <div className="mt-2 flex items-center gap-2">
              <button disabled={saving} onClick={approve} className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Approve Seller</button>
              <button disabled={saving} onClick={reject} className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Reject</button>
            </div>
            <div className="mt-2 text-xs text-gray-500">Current step: <span className="font-medium">{step}</span></div>
          </div>

          <Link href="/admin/seller-verification" className="inline-block text-sm text-blue-600 hover:underline">Back to list</Link>
        </div>
      </div>
    </div>
  );
}
