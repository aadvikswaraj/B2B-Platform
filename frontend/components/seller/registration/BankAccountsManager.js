'use client';
import { useState } from 'react';

export default function BankAccountsManager({ data, updateData, onBack, onNext }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    bankName: '',
    accountNumber: '',
    ifsc: '',
    accountHolder: '',
    cancelledCheque: null
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if(!form.bankName.trim()) e.bankName = 'Bank name required';
    if(!/^\d{6,18}$/.test(form.accountNumber)) e.accountNumber = 'Invalid account number';
    if(!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc)) e.ifsc = 'Invalid IFSC';
    if(!form.accountHolder.trim()) e.accountHolder = 'Account holder required';
    if(!form.cancelledCheque) e.cancelledCheque = 'Upload cheque image';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addAccount = () => {
    if(!validate()) return;
    const newAcc = { id: crypto.randomUUID(), ...form };
    const bankAccounts = [...data.bankAccounts, newAcc];
    updateData({ bankAccounts, primaryBankId: data.primaryBankId || newAcc.id });
    setForm({ bankName: '', accountNumber: '', ifsc: '', accountHolder: '', cancelledCheque: null });
    setShowModal(false);
  };

  const removeAccount = (id) => {
    const bankAccounts = data.bankAccounts.filter(a => a.id !== id);
    const primaryBankId = id === data.primaryBankId ? (bankAccounts[0]?.id || null) : data.primaryBankId;
    updateData({ bankAccounts, primaryBankId });
  };

  const selectPrimary = (id) => updateData({ primaryBankId: id });

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if(file){
      const reader = new FileReader();
      reader.onload = () => setForm(prev => ({ ...prev, cancelledCheque: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Bank Accounts</h2>
        <div className="flex gap-2">
          <button type="button" onClick={onBack} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
          <button type="button" onClick={() => setShowModal(true)} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700">Add Account</button>
        </div>
      </div>

      <p className="text-sm text-gray-600">Add one or more payout accounts. Mark one as primary for settlements.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.bankAccounts.map(acc => (
          <div key={acc.id} className={`relative rounded-lg border p-4 text-sm shadow-sm transition ${acc.id === data.primaryBankId ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{acc.bankName}</p>
                <p className="mt-1 text-gray-600 leading-snug">A/C: ••••{acc.accountNumber.slice(-4)}<br />IFSC: {acc.ifsc}</p>
                <button type="button" onClick={() => selectPrimary(acc.id)} className="mt-2 inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-default disabled:opacity-60" disabled={acc.id === data.primaryBankId}>{acc.id === data.primaryBankId ? 'Primary Account' : 'Set Primary'}</button>
                {acc.cancelledCheque && (
                  <div className="mt-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Cancelled Cheque</p>
                    <img src={acc.cancelledCheque} alt="Cancelled Cheque" className="h-20 w-auto rounded border object-cover" />
                  </div>
                )}
              </div>
              <button type="button" onClick={() => removeAccount(acc.id)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600" title="Remove">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l8 8M6 14L14 6" strokeLinecap="round" /></svg>
              </button>
            </div>
          </div>
        ))}
        {data.bankAccounts.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
            No bank accounts yet. Add your first payout account.
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onNext} disabled={!data.primaryBankId} className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Continue</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-bank-title">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 id="add-bank-title" className="text-base font-semibold text-gray-900">Add Bank Account</h3>
                <p className="mt-0.5 text-xs text-gray-500">Enter payout account details.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100" aria-label="Close modal"><svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l8 8M6 14L14 6" strokeLinecap="round" /></svg></button>
            </div>
            <form onSubmit={(e)=>{e.preventDefault(); addAccount();}} className="grid gap-4">
              {['bankName','accountHolder','accountNumber','ifsc'].map(f => (
                <div key={f} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 capitalize">{f === 'ifsc' ? 'IFSC Code' : f === 'accountHolder' ? 'Account Holder' : f === 'bankName' ? 'Bank Name' : f === 'accountNumber' ? 'Account Number' : f}</label>
                  <input
                    value={form[f]}
                    onChange={e => setForm(prev => ({ ...prev, [f]: f==='ifsc' ? e.target.value.toUpperCase() : e.target.value }))}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[f] ? 'border-red-300' : 'border-gray-300'}`}
                    required
                  />
                  {errors[f] && <span className="text-xs text-red-600">{errors[f]}</span>}
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Cancelled Cheque (Image)</label>
                <input type="file" accept="image/*" onChange={handleFile} className="text-xs" />
                {errors.cancelledCheque && <span className="text-xs text-red-600">{errors.cancelledCheque}</span>}
                {form.cancelledCheque && <img src={form.cancelledCheque} alt="Cheque" className="mt-2 h-24 w-auto rounded border object-cover" />}
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} type="button" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
