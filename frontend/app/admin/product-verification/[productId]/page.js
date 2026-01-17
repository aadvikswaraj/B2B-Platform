'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useAlert } from '@/components/ui/AlertManager';
import { getProductVerification, approveProduct, rejectProduct } from '@/utils/api/admin/productVerification';

export default function ProductVerificationDetailPage(){
  const params = useParams();
  const productId = params?.productId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open:false });
  const [rejectReason, setRejectReason] = useState('');
  const pushAlert = useAlert();

  const load = async () => {
    try { setLoading(true); setError(null); const d = await getProductVerification(productId); setData(d?.product || null); }
    catch(e){ setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ if(productId) load(); /* eslint-disable-next-line */ }, [productId]);

  const approve = async () => {
    setSaving(true);
    try { await approveProduct(productId); pushAlert?.('success','Product approved'); await load(); }
    catch(e){ pushAlert?.('error', e.message || 'Failed to approve'); }
    finally { setSaving(false); }
  };

  const confirmReject = async () => {
    setSaving(true);
    try { await rejectProduct(productId, rejectReason); pushAlert?.('success','Product rejected'); setRejectModal({ open:false }); setRejectReason(''); await load(); }
    catch(e){ pushAlert?.('error', e.message || 'Failed to reject'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return null;

  const statusBadge = (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${data?.moderation?.status==='approved'?'bg-emerald-100 text-emerald-700':data?.moderation?.status==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>
      {data?.moderation?.status || 'pending'}
    </span>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/product-verification"
        backLabel="Back to list"
        title="Verify Product"
        subtitle={`${data?.title || ''} • ${data?.category?.name || ''}`}
        badge={statusBadge}
        secondaryActions={[ { label:'Reject', onClick: ()=>setRejectModal({ open:true }), variant:'danger', disabled:saving } ]}
        primaryLabel="Approve Product"
        onPrimary={approve}
        primaryDisabled={saving}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Images</h3>
            {data?.images?.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {data.images.map((img, idx)=>(
                  <div key={idx} className="relative h-32 w-full overflow-hidden rounded border">
                    <Image src={img.url} alt={`Image ${idx+1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : <div className="text-sm text-gray-500">No images uploaded</div>}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Details</h3>
            <div className="space-y-2 text-sm text-gray-800">
              <div>Title: <span className="font-medium">{data.title}</span></div>
              <div>Category: <span className="font-medium">{data.category?.name || '—'}</span></div>
              <div>Brand: <span className="font-medium">{data.brand?.name || (data.isGeneric ? 'Generic' : '—')}</span></div>
              <div>Price: <span className="font-medium">{data.price} {data.currency}</span></div>
              <div>Min Order Qty: <span className="font-medium">{data.minOrderQuantity}</span></div>
              <div>Status: <span className="font-medium">{data.status}</span></div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Specifications</h3>
            {data?.specifications?.length ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {data.specifications.map((s, idx)=>(
                  <div key={idx} className="rounded border border-gray-200 p-2 text-sm">
                    <div className="text-[11px] text-gray-500">{s.specification}</div>
                    <div className="font-medium text-gray-900">{s.value}</div>
                  </div>
                ))}
              </div>
            ) : <div className="text-sm text-gray-500">No specifications provided</div>}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Description</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-800">{data.description || '—'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Seller</h3>
            <div className="text-sm text-gray-700">Name: <span className="font-medium">{data.seller?.name || '—'}</span></div>
            <div className="text-sm text-gray-700">Email: <span className="font-medium">{data.seller?.email || '—'}</span></div>
            <div className="text-sm text-gray-700">Phone: <span className="font-medium">{data.seller?.phone || '—'}</span></div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Brand</h3>
            <div className="text-sm text-gray-700">Name: <span className="font-medium">{data.brand?.name || (data.isGeneric ? 'Generic' : '—')}</span></div>
            {data?.brand?.kyc ? (
              <div className="mt-2 text-xs text-gray-500">Brand KYC: <span className="font-medium">{data.brand.kyc.status}</span></div>
            ) : <div className="mt-2 text-xs text-gray-500">No brand KYC info</div>}
          </div>

          {data?.moderation?.status === 'rejected' && data?.moderation?.rejectedReason ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-red-700">Rejection Reason</h3>
              <p className="whitespace-pre-wrap text-sm text-red-800">{data.moderation.rejectedReason}</p>
            </div>
          ) : null}

          <Link href="/admin/product-verification" className="inline-block text-sm text-blue-600 hover:underline">Back to list</Link>
        </div>
      </div>

      <RejectModal open={rejectModal.open} onClose={()=>setRejectModal({ open:false })} reason={rejectReason} onChange={setRejectReason} onConfirm={confirmReject} saving={saving} />
    </div>
  );
}

function RejectModal({ open, onClose, reason, onChange, onConfirm, saving }){
  return (
    <Modal open={open} onClose={onClose} title="Reject Product">
      <div className="space-y-2 text-sm">
        <p>Please provide a reason for rejection. The seller will see this and can re-submit corrections.</p>
        <textarea value={reason} onChange={(e)=>onChange(e.target.value)} placeholder="Missing/invalid images, incomplete details, etc." className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500" rows={4} />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} disabled={saving || !reason.trim()}>Reject</Button>
      </div>
    </Modal>
  );
}
