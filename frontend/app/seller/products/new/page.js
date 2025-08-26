"use client";
import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Link from 'next/link';
import { StepTabs } from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import FormSection from '@/components/ui/FormSection';
import { PhotoIcon, XMarkIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';

// Mock categories (replace via API). Demonstrates hierarchical selection.
const CATEGORY_TREE = [
  { id:'electronics', name:'Electronics', children:[
    { id:'phones', name:'Mobile Phones', children:[{ id:'smartphones', name:'Smartphones' }, { id:'featurephones', name:'Feature Phones'}]},
    { id:'audio', name:'Audio', children:[{ id:'headphones', name:'Headphones' }, { id:'speakers', name:'Speakers'}]}
  ]},
  { id:'machinery', name:'Machinery', children:[
    { id:'pumps', name:'Pumps' }, { id:'motors', name:'Motors' }
  ]}
];

function CategorySelector({ value, onChange }) {
  // Simpler: single column drill-down + global search results list
  const [path, setPath] = useState([]); // array of category objects
  const [query, setQuery] = useState('');
  const currentLevelItems = path.length === 0 ? CATEGORY_TREE : (path[path.length - 1].children || []);

  // Build flat list for global search
  const flat = useMemo(()=>{
    const out = [];
    const walk = (nodes, trail=[])=>{
      nodes.forEach(n=>{
        const newTrail = [...trail, n];
        out.push({ node:n, trail:newTrail });
        if(n.children) walk(n.children, newTrail);
      });
    };
    walk(CATEGORY_TREE);
    return out;
  }, []);

  const searchResults = useMemo(()=>{
    if(query.trim().length < 2) return [];
    return flat.filter(r=> r.node.name.toLowerCase().includes(query.toLowerCase())).slice(0,30);
  }, [query, flat]);

  const enter = (cat)=>{
    if(cat.children){
      setPath(prev=> [...prev, cat]);
    } else {
      onChange?.(cat);
    }
  };
  const back = ()=> setPath(prev=> prev.slice(0,-1));
  const reset = ()=> { setPath([]); onChange?.(null); };
  const selectFromSearch = (r)=>{ onChange?.(r.node); setPath(r.trail.filter(n=> n.children)); };

  return (
    <div className='space-y-4 relative'>
      {/* Path / Controls */}
      <div className='flex flex-wrap items-center gap-2 text-[11px] sm:text-xs'>
        <button
          type='button'
          onClick={reset}
          className='inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 active:scale-[.97] shadow-sm'
        >Root</button>
        {path.map(p=> <span key={p.id} className='inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700'>{p.name}</span>)}
        {value && !path.find(p=>p.id===value.id) && (
          <span className='inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700'>{value.name}</span>
        )}
        <div className='ml-auto hidden sm:flex gap-2'>
          {path.length>0 && (
            <button type='button' onClick={back} className='inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-100 border border-gray-200'>
              <ArrowLeftIcon className='h-3.5 w-3.5' /> Back
            </button>
          )}
          {(path.length>0 || value) && (
            <button type='button' onClick={reset} className='inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-100 border border-gray-200'>
              <XMarkIcon className='h-3.5 w-3.5' /> Clear
            </button>
          )}
        </div>
      </div>
      {/* Search */}
      <div className='relative'>
        <Input placeholder='Search categories (min 2 chars)...' value={query} onChange={e=> setQuery(e.target.value)} />
        {query && <button type='button' onClick={()=> setQuery('')} className='absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-500 hover:text-gray-700'>Clear</button>}
      </div>
      {query.trim().length >= 2 ? (
        <div className='space-y-3'>
          <ul className='divide-y rounded border border-gray-200 bg-white max-h-72 overflow-auto text-sm'>
            {searchResults.map(r=>{
              const leaf = !r.node.children;
              return (
                <li key={r.node.id}>
                  <button type='button' onClick={()=> selectFromSearch(r)} className='w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'>
                    <span className='flex-1'>
                      <span className='font-medium text-gray-800'>{r.node.name}</span>
                      <span className='block text-[10px] text-gray-500 truncate'>{r.trail.map(t=>t.name).join(' / ')}</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${leaf? 'bg-emerald-100 text-emerald-700 border-emerald-200':'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>{leaf? 'Select' : 'Open'}</span>
                  </button>
                </li>
              );
            })}
            {searchResults.length===0 && <li className='px-3 py-6 text-center text-[11px] text-gray-500'>No matches</li>}
          </ul>
          <p className='text-[11px] text-gray-500'>Showing {searchResults.length} result(s).</p>
        </div>
      ) : (
        <ul className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-auto pb-2'>
          {currentLevelItems.map(cat=>{
            const leaf = !cat.children;
            const selected = value?.id === cat.id;
            return (
              <li key={cat.id}>
                <button type='button' onClick={()=> enter(cat)} className={`w-full h-full rounded-md border p-3 text-left text-xs sm:text-[13px] flex flex-col gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${selected? 'border-emerald-500 bg-emerald-50':'border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50'}`}>
                  <span className='font-medium text-gray-800'>{cat.name}</span>
                  <span className={`inline-flex items-center w-fit gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${leaf? 'bg-emerald-100 text-emerald-700 border-emerald-200':'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>{leaf? (selected? 'Selected' : 'Select') : 'Open'}</span>
                </button>
              </li>
            );
          })}
          {currentLevelItems.length===0 && <li className='col-span-full text-center text-[11px] text-gray-500 py-6'>No subcategories</li>}
        </ul>
      )}
      {value && <div className='text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 inline-flex items-center gap-2 px-3 py-1 rounded'>Chosen: {value.name}</div>}
      <p className='text-[11px] text-gray-500'>Search globally or drill down. A leaf node (no subcategories) can be selected.</p>
      {/* Mobile sticky controls */}
      {(path.length>0 || value) && (
        <div className='sm:hidden sticky bottom-0 inset-x-0 pt-3 bg-gradient-to-t from-white via-white/95 to-white/30'>
          <div className='flex gap-3'>
            {path.length>0 && (
              <button type='button' onClick={back} className='flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-gray-100 text-gray-700 py-2.5 text-xs font-medium active:scale-[.97]'>
                <ArrowLeftIcon className='h-4 w-4' /> Back
              </button>
            )}
            <button type='button' onClick={reset} className='flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-white border border-gray-300 text-gray-700 py-2.5 text-xs font-medium active:scale-[.97]'>
              <XMarkIcon className='h-4 w-4' /> Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddProduct(){
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [images, setImages] = useState([]);
  // react-hook-form integration
  const { register, control, watch, handleSubmit, getValues, formState: { errors, isValid } } = useForm({
    mode:'onChange',
    criteriaMode:'all',
    defaultValues: {
      productName:'',
      modelSku:'',
      shortDesc:'',
      detailedDesc:'',
      keywords:'',
      specs:[],
      price:'',
      moq:'',
      leadTime:'',
      supplyAbility:'',
      paymentTerms:'',
      weight:'',
      length:'',
      width:'',
      height:'',
      shippingMethods:'',
      originCountry:''
    }
  });
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ name:'specs', control });
  const [imagePreviews, setImagePreviews] = useState([]);
  useEffect(()=>{
    imagePreviews.forEach(u=> URL.revokeObjectURL(u));
    const next = images.map(f=> URL.createObjectURL(f));
    setImagePreviews(next);
    return ()=> next.forEach(u=> URL.revokeObjectURL(u));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const steps = [
    { label:'Category' },
    { label:'Basic Info' },
    { label:'Specifications' },
    { label:'Pricing & MOQ' },
    { label:'Media' },
    { label:'Shipping' },
    { label:'Review & Publish' }
  ];

  const addImage = (files)=>{
    const list = Array.from(files).filter(f=>/image\//.test(f.type));
    setImages(prev=>[...prev, ...list.slice(0, 8 - prev.length)]);
  };
  const removeImage = (idx)=> setImages(prev=> prev.filter((_,i)=>i!==idx));
  const addSpec = ()=> appendSpec({ name:'', value:'', unit:'' });

  const canNext = ()=>{
    if(step===0) return !!category;
    if(step===1) {
      const { productName:pn } = getValues();
      return (pn||'').trim().length >= 2; // Short description now optional for progression
    }
    return true;
  };

  const submit = (data)=>{/* TODO: integrate API */ console.log({ category, ...data, images }); };

  const productName = watch('productName');
  const shortDesc = watch('shortDesc');
  return (
    <div className='my-5 space-y-6 sm:space-y-8 max-w-6xl mx-auto px-3 sm:px-4 pb-28'>
  <PageHeader
        backHref='/seller/products'
        backLabel='Products'
        title='Add New Product'
        subtitle='List a product with rich specifications & media. Complete each step then publish.'
        primaryLabel={step===steps.length-1 ? 'Publish' : 'Next'}
        primaryDisabled={!canNext()}
        onPrimary={()=> { if(step < steps.length-1){ if(!canNext()) return; setStep(step+1);} else { submit(); } }}
      />
      <div className='-mt-2 sticky top-0 z-30 bg-white/90 backdrop-blur py-2 border-b border-gray-200 px-2 sm:px-0'>
        <div className='flex items-center justify-between gap-3'>
          <StepTabs steps={steps} active={step} onStep={(i)=> { if(i <= step || canNext()) setStep(i); }} />
          <span className='hidden md:inline text-[11px] font-medium text-gray-500'>Step {step+1}/{steps.length}</span>
        </div>
      </div>
  <form onSubmit={handleSubmit(submit)} className='mt-4 space-y-8 sm:space-y-10'>
        {step===0 && (
          <FormSection title='Choose Category' description='Select the most specific category for best visibility.' className='scroll-mt-24 my-2 sm:my-3'>
            <CategorySelector value={category} onChange={(c)=> setCategory(c)} />
            <div className='pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
              <div className='text-[11px] text-gray-500 order-2 sm:order-1'>Choosing a precise category improves discovery.</div>
              <div className='order-1 sm:order-2'>
                <Button type='button' disabled={!canNext()} onClick={()=> setStep(1)}>Continue</Button>
              </div>
            </div>
          </FormSection>
        )}
        {step===1 && (
          <FormSection title='Basic Information' description='Core identifying details about the product.' className='scroll-mt-24 my-2 sm:my-3'>
            <div className='grid gap-6 md:grid-cols-2'>
              <FormField label='Product Name' required>
                <Input placeholder='e.g. 5HP Industrial Water Pump' {...register('productName', { required:'Name is required', minLength:{ value:2, message:'Min 2 chars' } })} />
                {errors.productName && <p className='mt-1 text-[11px] text-red-600'>{errors.productName.message}</p>}
              </FormField>
              <FormField label='Model / SKU'>
                <Input placeholder='Internal model or SKU' {...register('modelSku')} />
              </FormField>
              <FormField label='Short Description (optional)' className='md:col-span-2' hint='Concise pitch shown in listings. You can add later.'>
                <Textarea rows={3} maxLength={280} placeholder='Up to 280 characters' {...register('shortDesc')} />
                <div className='flex justify-end text-[10px] text-gray-400 mt-1'>{shortDesc.length}/280</div>
              </FormField>
              <FormField label='Detailed Description' className='md:col-span-2'>
                <Textarea rows={6} placeholder='Provide full details, materials, usage, compliance, etc.' {...register('detailedDesc')} />
              </FormField>
              <FormField label='Keywords' className='md:col-span-2' hint='Comma separated search keywords.'>
                <Input placeholder='pump, industrial, 5hp, water circulation' {...register('keywords')} />
              </FormField>
            </div>
          </FormSection>
        )}
        {step===2 && (
          <FormSection title='Specifications' description='Structured attributes buyers use to filter and compare.' className='scroll-mt-24 my-2 sm:my-3'>
            <div className='space-y-4'>
              {specFields.length===0 && <p className='text-xs text-gray-500'>No specifications yet.</p>}
              <ul className='space-y-3'>
                {specFields.map((field,i)=>(
                  <li key={i} className='grid gap-3 md:grid-cols-4 items-start bg-white p-3 rounded border border-gray-200'>
                    <Input placeholder='Name' {...register(`specs.${i}.name`)} />
                    <Input placeholder='Value' {...register(`specs.${i}.value`)} />
                    <Input placeholder='Unit (optional)' {...register(`specs.${i}.unit`)} />
                    <div className='flex justify-end'>
                      <Button type='button' size='sm' variant='danger' onClick={()=>removeSpec(i)} icon={XMarkIcon}>Remove</Button>
                    </div>
                  </li>
                ))}
              </ul>
              <Button type='button' size='sm' onClick={addSpec} icon={PlusIcon}>Add Spec</Button>
            </div>
          </FormSection>
        )}
        {step===3 && (
          <FormSection title='Pricing & MOQ' description='Define pricing tiers and minimum order requirements.' className='scroll-mt-24 my-2 sm:my-3'>
            <div className='grid gap-6 md:grid-cols-3'>
              <FormField label='Unit Price (USD)' required>
                <Input type='number' min='0' step='0.01' placeholder='0.00' {...register('price', { required:true })} />
              </FormField>
              <FormField label='Minimum Order Quantity' required>
                <Input type='number' min='1' placeholder='1' {...register('moq', { required:true })} />
              </FormField>
              <FormField label='Lead Time (days)' hint='Production / preparation time.'>
                <Input type='number' min='0' placeholder='7' {...register('leadTime')} />
              </FormField>
              <FormField label='Supply Ability / Month' hint='Your monthly production capacity.'>
                <Input type='number' min='0' placeholder='500' {...register('supplyAbility')} />
              </FormField>
              <FormField label='Payment Terms' className='md:col-span-2'>
                <Input placeholder='T/T, L/C, Western Union, etc.' {...register('paymentTerms')} />
              </FormField>
            </div>
          </FormSection>
        )}
        {step===4 && (
          <FormSection title='Media' description='Upload clear, high-quality images (first = cover).' className='scroll-mt-24 my-2 sm:my-3'>
            <div className='space-y-6'>
              <div className='flex flex-wrap gap-4'>
                {imagePreviews.map((url,i)=>(
                  <div key={i} className='relative group w-32 h-32 rounded border border-gray-200 overflow-hidden bg-gray-50'>
                    <img src={url} alt={images[i]?.name || 'image'} className='object-cover w-full h-full' />
                    <div className='absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 transition'>
                      <button type='button' onClick={()=>removeImage(i)} className='p-2 rounded-full bg-white/90 hover:bg-white shadow'>
                        <XMarkIcon className='h-4 w-4 text-gray-700' />
                      </button>
                    </div>
                  </div>
                ))}
                {images.length < 8 && (
                  <label className='w-32 h-32 cursor-pointer rounded border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs hover:border-indigo-400 hover:text-indigo-500'>
                    <PhotoIcon className='h-6 w-6'/>
                    <span>Upload</span>
                    <input type='file' multiple className='hidden' onChange={(e)=> addImage(e.target.files)} />
                  </label>
                )}
              </div>
              <p className='text-[11px] text-gray-500'>Up to 8 images. First image becomes the cover.</p>
            </div>
          </FormSection>
        )}
        {step===5 && (
          <FormSection title='Shipping' description='Set shipping dimensions and options.' className='scroll-mt-24 my-2 sm:my-3'>
            <div className='grid gap-6 md:grid-cols-4'>
              <FormField label='Package Weight (kg)'><Input type='number' step='0.01' {...register('weight')} /></FormField>
              <FormField label='Length (cm)'><Input type='number' {...register('length')} /></FormField>
              <FormField label='Width (cm)'><Input type='number' {...register('width')} /></FormField>
              <FormField label='Height (cm)'><Input type='number' {...register('height')} /></FormField>
              <FormField label='Shipping Methods' className='md:col-span-2'>
                <Textarea rows={3} placeholder='Courier, Sea freight, Air freight' {...register('shippingMethods')} />
              </FormField>
              <FormField label='Origin Country'>
                <Input placeholder='e.g. China' {...register('originCountry')} />
              </FormField>
            </div>
          </FormSection>
        )}
        {step===6 && (
          <FormSection title='Review & Publish' description='Confirm everything before publishing.' className='scroll-mt-24 my-2 sm:my-3'>
            <div className='space-y-4 text-sm'>
              <div><span className='font-semibold'>Category:</span> {category?.name || '—'}</div>
              <div><span className='font-semibold'>Specs:</span> {specFields.length} added</div>
              <div><span className='font-semibold'>Images:</span> {images.length}</div>
              <p className='text-xs text-gray-500'>Submitting will create the product as draft (if any required field missing) or active when complete.</p>
            </div>
          </FormSection>
        )}

  {/* Bottom action bar removed per request; navigation handled by PageHeader primary & step pills */}
      </form>
    </div>
  );
}
