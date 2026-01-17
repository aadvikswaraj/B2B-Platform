"use client";
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import { useCheckout } from '@/hooks/useCheckoutState';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ReviewPage() {
  const { state, pricing, dispatch } = useCheckout();
  const router = useRouter();

  useEffect(() => {
    if (!state.selectedAddressId) router.replace('/checkout/shipping');
    else if (!state.paymentMethod) router.replace('/checkout/payment');
  }, [state.selectedAddressId, state.paymentMethod, router]);

  const grouped = state.cartItems.reduce((acc, item) => {
    acc[item.supplierName] = acc[item.supplierName] || [];
    acc[item.supplierName].push(item);
    return acc;
  }, {});

  return (
    <CheckoutLayout stepId="review" summary={<OrderSummary pricing={pricing} submitLabel="Place Order" onSubmit={() => { const oid = 'ORD-' + Date.now(); dispatch({ type: 'SET_ORDER_ID', orderId: oid }); router.push('/checkout/success'); }} />}> 
      <div className="space-y-6">
        <div>
          <h1 id="checkout-step-heading" className="text-lg font-semibold mb-2">Review Order</h1>
          <p className="text-sm text-slate-600">Verify items and totals before placing your order.</p>
        </div>
        <div className="space-y-4">
          {Object.entries(grouped).map(([supplier, items]) => (
            <div key={supplier} className="rounded-lg border bg-white p-4">
              <h3 className="font-medium text-sm mb-3">{supplier}</h3>
              <ul className="divide-y">
                {items.map(item => (
                  <li key={item.id} className="py-3 flex items-center gap-4 text-sm">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded" />
                    <div className="flex-grow">
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Unit</p>
                      <p className="font-medium">${item.unitPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right w-20">
                      <p className="text-xs text-slate-500">Subtotal</p>
                      <p className="font-semibold">${(item.unitPrice * item.qty).toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-4">
          <button onClick={() => router.push('/checkout/payment')} className="text-sm text-slate-600 hover:text-slate-800">← Back</button>
          <button onClick={() => { const oid = 'ORD-' + Date.now(); dispatch({ type: 'SET_ORDER_ID', orderId: oid }); router.push('/checkout/success'); }} className="px-6 py-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500">Place Order</button>
        </div>
      </div>
    </CheckoutLayout>
  );
}
