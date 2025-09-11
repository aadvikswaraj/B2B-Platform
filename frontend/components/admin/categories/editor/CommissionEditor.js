"use client";
import { useEffect, useMemo, useState } from 'react';
import CategoryAPI from '@/utils/api/categories';
import clsx from 'clsx';

export default function CommissionEditor({ parentCategory, value, onChange }){
  const [mode, setMode] = useState(value?.mode || 'inherit');
  const [exact, setExact] = useState(value?.exact || '');
  const [slabs, setSlabs] = useState(value?.slabs || []);
  const [effective, setEffective] = useState(null);
  const [loadingEff, setLoadingEff] = useState(false);

  const pushChange = () => {
    onChange?.({ mode, exact: mode==='exact'? Number(exact): undefined, slabs: mode==='slab'? slabs: undefined });
  };
  useEffect(()=>{ pushChange(); /* eslint-disable-next-line */ }, [mode, exact, slabs]);

  useEffect(()=>{
    const payload = { parentCategory, commission: { mode, exact: mode==='exact'? Number(exact): undefined, slabs: mode==='slab'? slabs: undefined } };
    setLoadingEff(true);
    CategoryAPI.resolveCommission(payload).then(eff=> setEffective(eff)).catch(()=>{}).finally(()=> setLoadingEff(false));
  }, [mode, exact, slabs, parentCategory]);

  const addSlab = () => setSlabs(s => [...s, { min:0, max:0, percent:0 }]);
  const updateSlab = (i, field, v) => setSlabs(s => s.map((sl, idx)=> idx===i ? { ...sl, [field]: Number(v) } : sl));
  const removeSlab = (i) => setSlabs(s => s.filter((_,idx)=>idx!==i));

  const slabIssues = useMemo(()=>{
    if(mode !== 'slab') return [];
    const issues = [];
    const sorted = [...slabs].sort((a,b)=> a.min - b.min);
    sorted.forEach((s,i)=>{
      if(s.max < s.min) issues.push(`Slab ${i+1}: max < min`);
      if(i>0){
        const prev = sorted[i-1];
        if(s.min <= prev.max) issues.push(`Slab ${i} & ${i+1} overlap`);
      }
    });
    return issues;
  }, [slabs, mode]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        {['inherit','exact','slab'].map(m => (
          <label key={m} className="flex items-center gap-1">
            <input type="radio" name="commissionMode" value={m} checked={mode===m} onChange={()=>setMode(m)} />
            <span className="capitalize">{m}</span>
          </label>
        ))}
      </div>
      {mode==='exact' && (
        <div className="flex items-center gap-2">
          <input type="number" min={0} step={0.01} value={exact} onChange={e=>setExact(e.target.value)} className="w-32 rounded border border-gray-300 px-2 py-1 text-sm" placeholder="%" />
          <span className="text-xs text-gray-500">Percent</span>
        </div>
      )}
      {mode==='slab' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">Slabs</span>
            <button type="button" onClick={addSlab} className="text-xs text-indigo-600 hover:underline">Add slab</button>
          </div>
          <div className="space-y-2">
            {slabs.map((sl, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="number" value={sl.min} onChange={e=>updateSlab(i,'min',e.target.value)} placeholder="Min" className="w-20 rounded border border-gray-300 px-2 py-1 text-xs" />
                <input type="number" value={sl.max} onChange={e=>updateSlab(i,'max',e.target.value)} placeholder="Max" className="w-20 rounded border border-gray-300 px-2 py-1 text-xs" />
                <input type="number" value={sl.percent} onChange={e=>updateSlab(i,'percent',e.target.value)} placeholder="%" className="w-16 rounded border border-gray-300 px-2 py-1 text-xs" />
                <button type="button" onClick={()=>removeSlab(i)} className="text-[10px] text-red-600 hover:underline">Remove</button>
              </div>
            ))}
            {slabs.length===0 && <div className="text-[11px] text-gray-400 italic">No slabs</div>}
            {slabIssues.length>0 && (
              <ul className="text-[10px] text-red-600 list-disc pl-4 space-y-0.5">
                {slabIssues.map((m,i)=>(<li key={i}>{m}</li>))}
              </ul>
            )}
          </div>
        </div>
      )}
      <div className="rounded border border-gray-200 p-3 bg-gray-50 text-xs">
        <div className="font-medium mb-1">Effective Commission Preview</div>
        {loadingEff && <div className="text-gray-500">Computing...</div>}
        {!loadingEff && (
          <pre className="text-[10px] whitespace-pre-wrap leading-tight bg-white rounded p-2 border border-gray-200 max-h-40 overflow-auto">{JSON.stringify(effective, null, 2) || 'None'}</pre>
        )}
      </div>
    </div>
  );
}
