'use client';
import { useState } from 'react';

export default function BanksInline({ value=[], onChange }){
  const [form, setForm] = useState({ bankName:'', accountNumber:'', ifsc:'', accountHolder:'' });
  const [errors, setErrors] = useState({});

  function validate(){
    const e={};
    if(!form.bankName.trim()) e.bankName='Bank';
    if(!/^[0-9]{6,18}$/.test(form.accountNumber)) e.accountNumber='Acct';
    if(!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc)) e.ifsc='IFSC';
    if(!form.accountHolder.trim()) e.accountHolder='Holder';
    setErrors(e); return Object.keys(e).length===0;
  }
  function add(){ if(!validate()) return; onChange([ ...value, { id:crypto.randomUUID(), primary: value.length===0, ...form }]); setForm({ bankName:'', accountNumber:'', ifsc:'', accountHolder:'' }); }
  function remove(id){ onChange(value.filter(a=>a.id!==id)); }
  function setPrimary(id){ onChange(value.map(a=>({...a, primary: a.id===id }))); }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {value.length===0 && <div className="text-[11px] text-gray-500">No bank accounts yet.</div>}
        {value.map(b => (
          <div key={b.id} className={`relative rounded-lg border p-3 text-xs shadow-sm bg-white/60 ${b.primary ? 'border-indigo-500 ring-1 ring-indigo-300' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="leading-snug">
                <p className="font-medium text-gray-800">{b.bankName} {b.primary && <span className="ml-1 text-[10px] text-indigo-600 font-semibold">(Primary)</span>}</p>
                <p className="mt-1 text-gray-600">Acct: ••••{b.accountNumber.slice(-4)}<br />IFSC: {b.ifsc}</p>
                <div className="mt-2 flex gap-2">
                  {!b.primary && <button type="button" onClick={()=>setPrimary(b.id)} className="rounded-md border px-2 py-0.5 text-[10px] font-medium hover:bg-indigo-50 hover:text-indigo-700">Set Primary</button>}
                  <button type="button" onClick={()=>remove(b.id)} className="rounded-md border px-2 py-0.5 text-[10px] font-medium hover:bg-rose-50 hover:text-rose-600">Remove</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {['bankName','accountNumber','ifsc','accountHolder'].map(f => (
          <div key={f} className="col-span-2 sm:col-span-1 flex flex-col gap-1">
            <input value={form[f]} onChange={e=>setForm(prev=>({...prev, [f]: f==='ifsc'? e.target.value.toUpperCase(): e.target.value }))} placeholder={f==='ifsc'?'IFSC Code': f==='accountHolder'?'Account Holder': f==='bankName'?'Bank Name':'Account Number'} className={`rounded-md border px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors[f]?'border-rose-400':'border-gray-300'}`} />
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="w-full rounded-md bg-indigo-600 text-white text-xs font-medium py-2.5 hover:bg-indigo-500">Add Account</button>
    </div>
  );
}
