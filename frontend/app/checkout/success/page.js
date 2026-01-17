"use client";
import { useCheckout } from '@/hooks/useCheckoutState';
import SuccessCard from '@/components/checkout/SuccessCard';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const { state } = useCheckout();
  const router = useRouter();
  useEffect(() => { if (!state.orderId) router.replace('/checkout/review'); }, [state.orderId, router]);
  return (
    <CheckoutLayout stepId="success" summary={null}>
      <div className="pt-10">
        <SuccessCard orderId={state.orderId || '...'} />
      </div>
    </CheckoutLayout>
  );
}
