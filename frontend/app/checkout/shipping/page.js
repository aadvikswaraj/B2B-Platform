"use client";
import { useState } from 'react';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import AddressCard from '@/components/checkout/AddressCard';
import AddressForm from '@/components/checkout/AddressForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useCheckout } from '@/hooks/useCheckoutState';
import { useRouter } from 'next/navigation';

export default function ShippingPage() {
  const { state, dispatch, pricing } = useCheckout();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  return (
    <CheckoutLayout stepId="shipping" summary={<OrderSummary pricing={pricing} submitLabel="Next →" disabled={!state.selectedAddressId} onSubmit={() => router.push('/checkout/payment')} />}> 
      <div className="space-y-6">
        <div>
          <h1 id="checkout-step-heading" className="text-lg font-semibold mb-2">Shipping Address</h1>
          <p className="text-sm text-slate-600">Select a saved address or add a new one.</p>
        </div>
        <div role="radiogroup" className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {state.addresses.map(a => (
            <AddressCard key={a.id} address={a} selected={a.id === state.selectedAddressId} onSelect={id => dispatch({ type: 'SELECT_ADDRESS', id })} />
          ))}
          {!adding && (
            <button onClick={() => setAdding(true)} className="flex items-center justify-center border border-dashed rounded-lg p-4 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600 bg-white">+ Add New Address</button>
          )}
        </div>
        {adding && (
          <AddressForm onSave={addr => { dispatch({ type: 'ADD_ADDRESS', address: addr }); setAdding(false); }} onCancel={() => setAdding(false)} />
        )}
        <div className="flex justify-end pt-2">
          <button disabled={!state.selectedAddressId} onClick={() => router.push('/checkout/payment')} className="px-6 py-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50">Next →</button>
        </div>
      </div>
    </CheckoutLayout>
  );
}
