"use client";
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/** Quick Post Requirement (Buy Lead) Form
 * Minimal inline form to capture a buyer requirement quickly from homepage.
 * On submit it currently just logs the payload; integrate API later.
 */
export default function PostRequirementForm(){
  const [title,setTitle] = useState("");
  const [qty,setQty] = useState("");
  const [details,setDetails] = useState("");
  const [submitting,setSubmitting] = useState(false);
  const disabled = !title || !qty || !details || submitting;

  const submit = async (e)=>{
    e.preventDefault();
    if(disabled) return;
    setSubmitting(true);
    try{
      const payload = { title, qty, details };
      console.log('POST REQUIREMENT', payload);
      // TODO: call API endpoint e.g. fetch('/api/buyleads',{method:'POST', body:JSON.stringify(payload)})
      setTitle(""); setQty(""); setDetails("");
    }finally{ setSubmitting(false); }
  };

  return (
    <form onSubmit={submit} className='w-full space-y-3'>
      <div className='grid gap-3 sm:grid-cols-5'>
        <div className='sm:col-span-2'>
          <Input value={title} onChange={e=> setTitle(e.target.value)} placeholder='What do you need?' />
        </div>
        <div>
          <Input value={qty} onChange={e=> setQty(e.target.value)} placeholder='Quantity' />
        </div>
        <div className='sm:col-span-2'>
          <Input value={details} onChange={e=> setDetails(e.target.value)} placeholder='Key specs / details' />
        </div>
      </div>
      <div className='flex justify-end'>
        <Button type='submit' disabled={disabled}>{submitting? 'Posting…':'Post Requirement'}</Button>
      </div>
    </form>
  );
}
