'use client';
import { useState } from 'react';

export default function AddressesInline({ value=[], onChange }){
  const [form, setForm] = useState({ label:'', line1:'', line2:'', city:'', state:'', pinCode:'' });
  const [errors, setErrors] = useState({});

  function validate(){
    const e={};
    if(!form.label.trim()) e.label='Label';
    if(!form.line1.trim()) e.line1='Line1';
    if(!form.city.trim()) e.city='City';
    if(!form.state.trim()) e.state='State';
    if(!/^\d{6}$/.test(form.pinCode)) e.pinCode='PIN';
    setErrors(e); return Object.keys(e).length===0;
  }
  function add(){
    if(!validate()) return;
    onChange([ ...value, { id:crypto.randomUUID(), ...form }]);
    setForm({ label:'', line1:'', line2:'', city:'', state:'', pinCode:'' });
  }
  function remove(id){ onChange(value.filter(a=>a.id!==id)); }
  function setPrimary(id){ onChange(value.map(a=>({...a, primary: a.id===id }))); }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {value.length===0 && <div className="text-[11px] text-gray-500">No addresses yet.</div>}
        {value.map(a => (
          <div key={a.id} className={`relative rounded-lg border p-3 text-xs shadow-sm bg-white/60 ${a.primary ? 'border-indigo-500 ring-1 ring-indigo-300' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="leading-snug">
                <p className="font-medium text-gray-800">{a.label} {a.primary && <span className="ml-1 text-[10px] text-indigo-600 font-semibold">(Primary)</span>}</p>
                <p className="mt-1 text-gray-600">{a.line1}{a.line2 && ', '+a.line2}<br />{a.city}, {a.state} - {a.pinCode}</p>
                <div className="mt-2 flex gap-2">
                  {!a.primary && <button type="button" onClick={()=>setPrimary(a.id)} className="rounded-md border px-2 py-0.5 text-[10px] font-medium hover:bg-indigo-50 hover:text-indigo-700">Set Primary</button>}
                  <button type="button" onClick={()=>remove(a.id)} className="rounded-md border px-2 py-0.5 text-[10px] font-medium hover:bg-rose-50 hover:text-rose-600">Remove</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {['label','line1','line2','city','state','pinCode'].map(f => (
          <div key={f} className="col-span-2 sm:col-span-1 flex flex-col gap-1">
            <input value={form[f]} onChange={e=>setForm(prev=>({...prev, [f]: e.target.value }))} maxLength={f==='pinCode'?6:undefined} placeholder={f==='pinCode'?'PIN Code': f.charAt(0).toUpperCase()+f.slice(1)} className={`rounded-md border px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors[f]?'border-rose-400':'border-gray-300'}`} />
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="w-full rounded-md bg-indigo-600 text-white text-xs font-medium py-2.5 hover:bg-indigo-500">Add Address</button>
    </div>
  );
}
