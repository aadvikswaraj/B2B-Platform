"use client";
import { useState, useMemo, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FunnelIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FormField } from '@/components/ui/FormField';

// Configuration
const MAX_QUOTES = 8;

// Mock data (replace with fetch)
const SAMPLE_LEADS = Array.from({length:12}).map((_,i)=>{
  const quotesCount = (i * 2) % (MAX_QUOTES); // pseudo variety
  return {
    id:i+1,
    title:["Industrial Water Pump","Steel Pipes 2" ,"Electric Motor 5HP","Hydraulic Hose Set","Aluminum Sheet","Solar Inverter","Gearbox Assembly","PVC Granules","Bearing Housing","Control Panel","Stainless Bolts","Packaging Film"][i%12],
    buyer:`Buyer Co ${ (i%5)+1 }`,
    qty: [50,200,25,400,120,75][i%6],
    unit:"units",
    targetPrice: [999.99,79.5,549,14.2,3.6,120][i%6],
    deadline:"2025-09-3" + (i%10),
    status:["New","Quoted","Negotiating","Won","Lost"][i%5],
    tags:["Urgent","Cert:ISO","Recurring"].slice(0,(i%3)+1),
    notes:"Need warranty & compliance docs",
    quotesCount,
    purchased:false,
  };
});

const statusStyles = {
  New:"bg-indigo-50 text-indigo-700 border border-indigo-200",
  Quoted:"bg-blue-50 text-blue-700 border border-blue-200",
  Negotiating:"bg-amber-50 text-amber-700 border border-amber-200",
  Won:"bg-emerald-50 text-emerald-700 border border-emerald-200",
  Lost:"bg-red-50 text-red-600 border border-red-200"
};

export default function BuyLeadsPage(){
  const [leads, setLeads] = useState(SAMPLE_LEADS);
  const [q,setQ] = useState("");
  const [status,setStatus] = useState("all");
  const [view,setView] = useState("cards");
  const [sort, setSort] = useState("deadlineAsc");
  const [showFilters, setShowFilters] = useState(false);
  // RFQ credits (limits)
  const [creditsTotal] = useState(50);
  const [creditsUsed, setCreditsUsed] = useState(11);
  const creditsRemaining = creditsTotal - creditsUsed;
  const creditsPct = Math.min(100, (creditsUsed/creditsTotal)*100);
  const filtered = useMemo(()=> leads.filter(l=>{
    const textMatch = !q || l.title.toLowerCase().includes(q.toLowerCase()) || l.buyer.toLowerCase().includes(q.toLowerCase());
    const statusMatch = (status==='all' || l.status===status);
    return textMatch && statusMatch;
  }).sort((a,b)=>{
    if(sort==='deadlineAsc') return a.deadline.localeCompare(b.deadline);
    if(sort==='deadlineDesc') return b.deadline.localeCompare(a.deadline);
    if(sort==='status') return a.status.localeCompare(b.status);
    return 0;
  }),[leads,q,status,sort]);

  const respondToLead = (leadId)=>{
    // legacy respond (kept for table view) consumes no extra slot beyond a buy
    setLeads(prev=> prev.map(l=> l.id===leadId ? { ...l, status: l.status==='New'? 'Quoted': l.status } : l));
  };

  const buyLead = (leadId)=>{
    setLeads(prev=> prev.map(l=>{
      if(l.id!==leadId) return l;
      if(l.purchased || l.quotesCount>=MAX_QUOTES || creditsRemaining<=0) return l;
      const newQuotesCount = l.quotesCount + 1;
      return {
        ...l,
        purchased:true,
        quotesCount:newQuotesCount,
        status: l.status==='New'? 'Quoted': l.status,
        // auto close if filled
        closed: newQuotesCount>=MAX_QUOTES
      };
    }));
    setCreditsUsed(u=> creditsRemaining<=0 ? u : u+1);
  };

  const statusTabs = ['all','New','Quoted','Negotiating','Won','Lost'];

  return (
    <div className='space-y-6 max-w-7xl mx-auto px-3 sm:px-6 pb-20'>
      <PageHeader
        backHref='/seller'
        backLabel='Dashboard'
        title='Buy Leads'
        subtitle='Qualified purchase requests from buyers. Respond quickly to improve win rate.'
        primaryLabel='Refresh'
        primaryIcon={ArrowPathIcon}
        onPrimary={()=>{/* future refetch */}}
      />

      {/* Quota / RFQ Credits */}
      <div className='grid gap-4 md:grid-cols-3'>
        <div className='p-4 rounded-md border bg-white flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium tracking-wide text-gray-500 uppercase'>RFQ Credits</span>
            <span className='text-[11px] text-gray-500'>{creditsRemaining} left</span>
          </div>
            <div className='h-2 w-full bg-gray-100 rounded-full overflow-hidden'>
              <div className='h-full bg-gradient-to-r from-indigo-500 to-indigo-600' style={{width:`${creditsPct}%`}} />
            </div>
            <div className='flex items-center justify-between text-xs text-gray-600'>
              <span>Used {creditsUsed}</span>
              <span>Total {creditsTotal}</span>
            </div>
            {creditsRemaining<=5 && <p className='text-[11px] text-amber-600'>Low credits – consider upgrading plan.</p>}
            <div className='flex gap-2'>
              <Button size='xs' variant='outline'>Buy More</Button>
              <Button size='xs' variant='outline'>Plans</Button>
            </div>
        </div>
        <div className='p-4 rounded-md border bg-white flex flex-col gap-1'>
          <span className='text-[11px] font-medium tracking-wide text-gray-500 uppercase'>Conversion</span>
          <span className='text-xl font-semibold text-gray-800'>{Math.round((leads.filter(l=>l.status==='Won').length / leads.length)*100)}%</span>
          <p className='text-[11px] text-gray-500'>Won vs total leads.</p>
        </div>
        <div className='p-4 rounded-md border bg-white flex flex-col gap-1'>
          <span className='text-[11px] font-medium tracking-wide text-gray-500 uppercase'>Open Leads</span>
          <span className='text-xl font-semibold text-gray-800'>{leads.filter(l=>['New','Negotiating','Quoted'].includes(l.status)).length}</span>
          <p className='text-[11px] text-gray-500'>Act promptly to increase wins.</p>
        </div>
      </div>

      {/* Status Pills */}
      <div className='flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1'>
        {statusTabs.map(s=>{
          const active = status===s;
          const label = s==='all'? 'All' : s;
          return <button key={s} type='button' onClick={()=> setStatus(s)} className={`px-4 py-1.5 rounded-full text-xs font-medium border flex-shrink-0 transition ${active? 'bg-indigo-600 border-indigo-600 text-white shadow-sm':'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{label}</button>;
        })}
      </div>

      {/* Filters / Controls */}
      <div className='flex flex-col xl:flex-row gap-4 xl:items-end'>
        <div className='flex-1 flex flex-col sm:flex-row gap-3'>
          <div className='flex-1'>
            <Input placeholder='Search leads…' value={q} onChange={e=> setQ(e.target.value)} />
          </div>
          <select value={sort} onChange={e=> setSort(e.target.value)} className='h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'>
            <option value='deadlineAsc'>Deadline ↑</option>
            <option value='deadlineDesc'>Deadline ↓</option>
            <option value='status'>Status</option>
          </select>
          <div className='inline-flex rounded-md border border-gray-300 overflow-hidden'>
            {['cards','table'].map(v=> <button key={v} type='button' onClick={()=> setView(v)} className={`px-3 h-10 text-xs font-medium ${view===v? 'bg-indigo-600 text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}>{v==='cards'? 'Cards':'Table'}</button>)}
          </div>
          <button type='button' onClick={()=> setShowFilters(true)} className='sm:hidden h-10 px-4 rounded-md border border-gray-300 bg-white text-xs font-medium flex items-center gap-1'><FunnelIcon className='h-4 w-4'/> Filters</button>
        </div>
        <div className='hidden sm:flex gap-2'>
          <Button variant='outline' size='sm' icon={FunnelIcon}>Filters</Button>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[
          { label:'Leads', value: leads.length },
          { label:'New', value: leads.filter(l=>l.status==='New').length },
          { label:'Quoted', value: leads.filter(l=>l.status==='Quoted').length },
          { label:'Won', value: leads.filter(l=>l.status==='Won').length }
        ].map(s=>(
          <div key={s.label} className='p-4 rounded-md bg-white border flex flex-col gap-1'>
            <span className='text-[11px] font-medium tracking-wide text-gray-500 uppercase'>{s.label}</span>
            <span className='text-xl font-semibold text-gray-800'>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      {view==='cards' ? (
        <div className='flex flex-col gap-4'>
          {filtered.map(l=> {
            const quotesLeft = Math.max(0, MAX_QUOTES - l.quotesCount);
            const quotesPct = (l.quotesCount / MAX_QUOTES) * 100;
            const canBuy = quotesLeft>0 && creditsRemaining>0 && !l.purchased;
            const closed = quotesLeft===0;
            return (
              <div key={l.id} className='group relative rounded-lg border bg-white p-5 flex flex-col gap-4 hover:shadow-md transition w-full'>
                {/* Header */}
                <div className='flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 justify-between'>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-gray-900 text-base'>{l.title}</h3>
                    <div className='mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500'>
                      <span className='font-medium text-gray-700'>{l.buyer}</span>
                      <span className='hidden sm:inline text-gray-300'>•</span>
                      <span>Deadline {l.deadline}</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${statusStyles[l.status]}`}>{closed? 'Closed': l.status}</span>
                    <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${quotesLeft===0? 'bg-gray-100 text-gray-600 border border-gray-200':'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>{quotesLeft} slot{quotesLeft!==1?'s':''} left</span>
                  </div>
                </div>

                {/* Key Info */}
                <div className='flex flex-wrap gap-3 text-[11px]'>
                  <span className='inline-flex items-center gap-1 rounded bg-gray-100 px-3 py-1 font-medium text-gray-700'>{l.qty} {l.unit}</span>
                  <span className='inline-flex items-center gap-1 rounded bg-gray-100 px-3 py-1 font-medium text-gray-700'>Target ${l.targetPrice}</span>
                  <span className='inline-flex items-center gap-1 rounded bg-gray-100 px-3 py-1 font-medium text-gray-700'>Status {l.status}</span>
                  {l.tags.map(t=> <span key={t} className='inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700 border border-indigo-100'>{t}</span>)}
                </div>

                {/* Notes / Description */}
                <p className='text-sm text-gray-600 leading-relaxed'>{l.notes}</p>

                {/* Quotes Progress */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-[11px] font-medium text-gray-600'>
                    <span>Quotes Usage</span>
                    <span>{l.quotesCount}/{MAX_QUOTES}</span>
                  </div>
                  <div className='h-2 w-full bg-gray-100 rounded-full overflow-hidden'>
                    <div className={`h-full ${closed? 'bg-gray-400':'bg-gradient-to-r from-indigo-500 to-indigo-600'}`} style={{width: `${quotesPct}%`}} />
                  </div>
                </div>

                {/* Actions */}
                <div className='flex flex-col sm:flex-row gap-3 pt-2'>
                  <Button className='flex-1' disabled={!canBuy} onClick={()=> buyLead(l.id)}>{closed? 'Closed' : l.purchased ? 'Purchased' : creditsRemaining<=0 ? 'No Credits' : 'Buy Lead'}</Button>
                  <Button className='flex-1' variant='outline' disabled={!l.purchased && !closed} onClick={()=> respondToLead(l.id)}>Respond</Button>
                  <Button className='flex-1' variant='outline'>Details</Button>
                </div>
              </div>
            );
          })}
          {filtered.length===0 && <div className='text-center text-sm text-gray-500 py-12'>No leads match your filters.</div>}
        </div>
      ) : (
        <div className='overflow-auto rounded border bg-white'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='text-left px-3 py-2'>Lead</th>
                <th className='text-left px-3 py-2'>Buyer</th>
                <th className='text-left px-3 py-2'>Qty</th>
                <th className='text-left px-3 py-2'>Target</th>
                <th className='text-left px-3 py-2'>Deadline</th>
                <th className='text-left px-3 py-2'>Quotes</th>
                <th className='text-left px-3 py-2'>Status</th>
                <th className='text-right px-3 py-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l=> (
                <tr key={l.id} className='border-t hover:bg-gray-50'>
                  <td className='px-3 py-2 font-medium text-gray-800'>{l.title}</td>
                  <td className='px-3 py-2 text-gray-600'>{l.buyer}</td>
                  <td className='px-3 py-2 text-gray-600'>{l.qty} {l.unit}</td>
                  <td className='px-3 py-2 text-gray-600'>${l.targetPrice}</td>
                  <td className='px-3 py-2 text-gray-600'>{l.deadline}</td>
                  <td className='px-3 py-2 text-gray-600'>{l.quotesCount}/{MAX_QUOTES}</td>
                  <td className='px-3 py-2'><span className={`text-[10px] px-2 py-1 rounded-full font-medium ${statusStyles[l.status]}`}>{l.status}</span></td>
                  <td className='px-3 py-2 text-right'>
                    <div className='inline-flex gap-2'>
                      <Button size='xs' disabled={l.quotesCount>=MAX_QUOTES || creditsRemaining<=0 || l.purchased} onClick={()=> buyLead(l.id)}>
                        {l.quotesCount>=MAX_QUOTES? 'Closed' : l.purchased? 'Purchased': creditsRemaining<=0? 'No Credits':'Buy'}
                      </Button>
                      <Button size='xs' variant='outline' disabled={!l.purchased}>Respond</Button>
                      <Button size='xs' variant='outline'>Details</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && (
                <tr>
                  <td colSpan={7} className='px-3 py-10 text-center text-sm text-gray-500'>No leads match your filters.</td>
                </tr>) }
            </tbody>
          </table>
        </div>
      )}
      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className='sm:hidden fixed inset-0 z-40 flex'>
          <div className='absolute inset-0 bg-black/30' onClick={()=> setShowFilters(false)} />
          <div className='ml-auto h-full w-80 max-w-[80%] bg-white shadow-xl flex flex-col'>
            <div className='px-4 py-3 border-b flex items-center justify-between'>
              <h2 className='text-sm font-medium text-gray-800'>Filters</h2>
              <button type='button' onClick={()=> setShowFilters(false)} className='p-1 rounded hover:bg-gray-100'>
                <XMarkIcon className='h-5 w-5 text-gray-500'/>
              </button>
            </div>
            <div className='p-4 flex-1 space-y-4 overflow-auto'>
              <div className='space-y-2'>
                <label className='text-xs font-medium text-gray-600'>Search</label>
                <Input value={q} onChange={e=> setQ(e.target.value)} placeholder='Search…'/>
              </div>
              <div className='space-y-2'>
                <label className='text-xs font-medium text-gray-600'>Sort By</label>
                <select value={sort} onChange={e=> setSort(e.target.value)} className='h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'>
                  <option value='deadlineAsc'>Deadline ↑</option>
                  <option value='deadlineDesc'>Deadline ↓</option>
                  <option value='status'>Status</option>
                </select>
              </div>
              <div className='space-y-2'>
                <label className='text-xs font-medium text-gray-600'>Status</label>
                <div className='flex flex-wrap gap-2'>
                  {statusTabs.map(s=>{
                    const active = status===s;
                    return <button key={s} type='button' onClick={()=> setStatus(s)} className={`px-3 py-1.5 rounded-full text-[11px] font-medium border ${active? 'bg-indigo-600 border-indigo-600 text-white':'bg-white border-gray-300 text-gray-600'}`}>{s==='all'? 'All': s}</button>;
                  })}
                </div>
              </div>
            </div>
            <div className='p-4 border-t flex gap-3'>
              <Button className='flex-1' onClick={()=> setShowFilters(false)}>Apply</Button>
              <Button className='flex-1' variant='outline' onClick={()=> { setQ(''); setStatus('all'); setSort('deadlineAsc'); }}>Reset</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
