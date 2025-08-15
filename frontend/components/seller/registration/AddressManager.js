'use client';
import { useState, useEffect } from 'react';

export default function AddressManager({ data, updateData, onBack, onNext }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pinCode: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if(!form.label.trim()) e.label = 'Label required';
    if(!form.line1.trim()) e.line1 = 'Address line required';
    if(!form.city.trim()) e.city = 'City required';
    if(!form.state.trim()) e.state = 'State required';
    if(!/^\d{6}$/.test(form.pinCode)) e.pinCode = '6 digit PIN';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addAddress = () => {
    if(!validate()) return;
    const newAddr = { id: crypto.randomUUID(), ...form };
    const addresses = [...data.addresses, newAddr];
    updateData({ addresses, pickupAddressId: data.pickupAddressId || newAddr.id });
    setForm({ label: '', line1: '', line2: '', city: '', state: '', pinCode: '' });
    setShowModal(false);
  };

  const removeAddress = (id) => {
    const addresses = data.addresses.filter(a => a.id !== id);
    const pickupAddressId = id === data.pickupAddressId ? (addresses[0]?.id || null) : data.pickupAddressId;
    updateData({ addresses, pickupAddressId });
  };

  const selectPickup = (id) => updateData({ pickupAddressId: id });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Pickup Addresses</h2>
        <div className="flex gap-2">
          <button type="button" onClick={onBack} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
          <button type="button" onClick={() => setShowModal(true)} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700">Add Address</button>
        </div>
      </div>

      <p className="text-sm text-gray-600">Select a default pickup address and add more if needed.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.addresses.map(addr => (
          <div key={addr.id} className={`relative rounded-lg border p-4 text-sm shadow-sm transition ${addr.id === data.pickupAddressId ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-200'}`}> 
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{addr.label}</p>
                <p className="mt-1 text-gray-600 leading-snug">{addr.line1}{addr.line2 && (<> , {addr.line2}</>)}<br />{addr.city}, {addr.state} - {addr.pinCode}</p>
                <button type="button" onClick={() => selectPickup(addr.id)} className="mt-2 inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-default disabled:opacity-60" disabled={addr.id === data.pickupAddressId}>{addr.id === data.pickupAddressId ? 'Default Pickup' : 'Set as Pickup'}</button>
              </div>
              <button type="button" onClick={() => removeAddress(addr.id)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600" title="Remove">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l8 8M6 14L14 6" strokeLinecap="round" /></svg>
              </button>
            </div>
          </div>
        ))}
        {data.addresses.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
            No addresses yet. Add your first pickup location.
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onNext} disabled={!data.pickupAddressId} className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Continue</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-address-title">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 id="add-address-title" className="text-base font-semibold text-gray-900">Add Address</h3>
                <p className="mt-0.5 text-xs text-gray-500">Provide pickup location details.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100" aria-label="Close modal"><svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l8 8M6 14L14 6" strokeLinecap="round" /></svg></button>
            </div>
            <form onSubmit={(e)=>{e.preventDefault(); addAddress();}} className="grid gap-4">
              {['label','line1','line2','city','state','pinCode'].map(f => (
                <div key={f} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 capitalize">{f === 'line1' ? 'Address Line 1' : f === 'line2' ? 'Address Line 2' : f === 'pinCode' ? 'PIN Code' : f}</label>
                  <input
                    value={form[f]}
                    onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))}
                    maxLength={f === 'pinCode' ? 6 : undefined}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[f] ? 'border-red-300' : 'border-gray-300'}`}
                    required={['label','line1','city','state','pinCode'].includes(f)}
                  />
                  {errors[f] && <span className="text-xs text-red-600">{errors[f]}</span>}
                </div>
              ))}
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
