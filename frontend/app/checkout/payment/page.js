"use client";
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import { useCheckout } from '@/hooks/useCheckoutState';
import PaymentMethods from '@/components/checkout/PaymentMethods';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const { state, dispatch, pricing } = useCheckout();
  const router = useRouter();
  return (
    <CheckoutLayout stepId="payment" summary={<OrderSummary pricing={pricing} submitLabel="Next →" disabled={!state.paymentMethod} onSubmit={() => router.push('/checkout/review')} />}> 
      <div className="space-y-6">
        <div>
          <h1 id="checkout-step-heading" className="text-lg font-semibold mb-2">Payment Method</h1>
          <p className="text-sm text-slate-600">Choose a payment option.</p>
        </div>
        <PaymentMethods value={state.paymentMethod} onChange={method => dispatch({ type: 'SET_PAYMENT_METHOD', method })} />
        <div className="flex justify-between pt-4">
          <button onClick={() => router.push('/checkout/shipping')} className="text-sm text-slate-600 hover:text-slate-800">← Back</button>
          <button disabled={!state.paymentMethod} onClick={() => router.push('/checkout/review')} className="px-6 py-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50">Next →</button>
        </div>
      </div>
    </CheckoutLayout>
  );
}
