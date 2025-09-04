"use client";
const OPTIONS = [
  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, MasterCard, Amex' },
  { id: 'upi', label: 'UPI', desc: 'Pay instantly with UPI apps' },
  { id: 'bank', label: 'Bank Transfer', desc: '1-2 business days' },
  { id: 'escrow', label: 'Escrow Payment', desc: 'Funds released after delivery' }
];
export default function PaymentMethods({ value, onChange }) {
  return (
    <div className="space-y-3">
      {OPTIONS.map(opt => {
        const active = value === opt.id;
        return (
          <label key={opt.id} className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 hover:border-blue-400 ${active ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 bg-white'}`}>
            <input type="radio" name="payment" value={opt.id} checked={active} onChange={() => onChange(opt.id)} className="mt-1 h-4 w-4 accent-blue-600" />
            <div>
              <p className="font-medium text-sm">{opt.label}</p>
              <p className="text-xs text-slate-500">{opt.desc}</p>
              {active && opt.id === 'escrow' && <p className="mt-2 text-xs text-amber-600">Escrow protects both parties. Funds released after confirmation.</p>}
            </div>
          </label>
        );
      })}
      <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white text-[10px] font-semibold">SSL</span>
        256-bit encrypted & PCI compliant
      </div>
    </div>
  );
}
