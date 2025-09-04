"use client";
import { useState } from 'react';

export default function AddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', phone: '', line1: '', city: '', postalCode: '', country: '' });
  const [errors, setErrors] = useState({});
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Required';
    if (!/^[0-9\- +]{6,}$/.test(form.phone)) e.phone = 'Invalid phone';
    if (!form.line1) e.line1 = 'Required';
    if (!form.city) e.city = 'Required';
    if (!form.postalCode) e.postalCode = 'Required';
    if (!form.country) e.country = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  return (
    <form onSubmit={e => { e.preventDefault(); if (validate()) onSave({ id: crypto.randomUUID(), ...form }); }} className="rounded-lg border border-dashed p-4 bg-white">
      <div className="grid sm:grid-cols-2 gap-4">
        {[['name','Full Name'],['phone','Phone'],['line1','Address Line'],['city','City'],['postalCode','Postal Code'],['country','Country']].map(([k,label]) => (
          <div key={k} className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
            <input value={form[k]} onChange={e => update(k, e.target.value)} className={`w-full rounded border px-3 py-2 text-sm ${errors[k] ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'}`} />
            {errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500">Save Address</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-slate-50">Cancel</button>
      </div>
    </form>
  );
}
