"use client";
import TrackingTimeline from '@/components/checkout/TrackingTimeline';
import { useParams } from 'next/navigation';

export default function TrackingPage() {
  const params = useParams();
  const { orderId } = params;
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-semibold">Order Tracking</h1>
          <p className="text-sm text-slate-600 mt-1 font-mono">Order ID: {orderId}</p>
        </div>
        <TrackingTimeline current="processing" />
        <div className="rounded-lg border bg-white p-6 text-sm space-y-2">
          <p className="font-medium">Shipment Details</p>
          <p className="text-slate-600">Carrier: TBD • Tracking #: TBD</p>
          <p className="text-slate-600">Need help? <a href="/support" className="text-blue-600 hover:text-blue-500">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
}
