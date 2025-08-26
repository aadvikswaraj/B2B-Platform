'use client';

import ImageGallery from '@/components/buyer/product/ImageGallery';
import PriceTable from '@/components/buyer/product/PriceTable';
import ProductTabs from '@/components/buyer/product/ProductTabs';
import SupplierCard from '@/components/buyer/product/SupplierCard';
import Navbar from '@/components/buyer/Navbar';
import Button from '@/components/ui/Button';
import { CheckCircleIcon, ShieldCheckIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function ProductDetails({ params }) {
  const { id } = params; // simplified (no experimental use())

  // Mock data - replace with actual API call / fetch
  const productData = {
    id,
    name: 'Premium Quality Widget Pro Max',
    short: 'High performance industrial widget for precision manufacturing.',
    images: ['/product-image.jpg','/product-image.jpg','/product-image.jpg','/product-image.jpg'],
    video: 'https://gv.videocdn.alibaba.com/4f4e1c368ac918af/ef94a2ab9744f48e/20230630_c7b02336d7831cfa_417527018632_mp4_264_hd_unlimit_taobao.mp4?bizCode=icbu_vod_video',
    prices: [
      { minQty:1, maxQty:9, price:299.99 },
      { minQty:10, maxQty:49, price:249.99 },
      { minQty:50, maxQty:99, price:199.99 },
      { minQty:100, price:149.99 }
    ],
    minOrder: '1 Unit',
    leadTime: '7-15 days',
    supplyAbility: '5,000 units / Month',
    shipping: 'FOB / CIF / Express',
    certifications: ['ISO9001','CE'],
    description: `
      <h2>Product Description</h2>
      <p>Engineered with premium alloys and precision machining for durability and high throughput operations.</p>
      <h3>Features & Benefits</h3>
      <ul>
        <li>High torque efficiency</li>
        <li>Low vibration & noise</li>
        <li>Extended service life</li>
      </ul>
    `,
    specifications: {},
    reviews: {
      product:[{ rating:5, date:'2025-07-15', comment:'Excellent product, exactly as described!' }],
      supplier:[]
    },
    supplier:{
      name:'Tech Solutions Co., Ltd',
      logo:'https://placehold.co/100x100',
      location:'Shanghai, China',
      responseTime:'≤24h',
      transactionLevel:'Diamond',
      onTimeDelivery:'98%',
      yearsInBusiness:8,
      businessType:'Manufacturer',
      mainProducts:'Electronics, Gadgets, Accessories'
    }
  };

  const trustBadges = [
    { icon:ShieldCheckIcon, label:'Secure Trade' },
    { icon:ClockIcon, label:'On-time Delivery 98%' },
    { icon:TruckIcon, label:'Flexible Shipping' },
    { icon:CheckCircleIcon, label:'Quality Assured' }
  ];

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-white'>
      <Navbar />
      <div className='w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex-1'>
        {/* Breadcrumb */}
        <nav className='text-[11px] sm:text-xs text-gray-500 flex flex-wrap gap-1 mb-4'>
          <span className='text-gray-400'>Home</span>
          <span>/</span>
            <span className='text-gray-400'>Machinery</span>
          <span>/</span>
          <span className='font-medium text-gray-600 truncate max-w-[160px] sm:max-w-none'>{productData.name}</span>
        </nav>

        <div className='grid gap-8 lg:grid-cols-12'>
          {/* Media Gallery */}
          <div className='lg:col-span-5 xl:col-span-5'>
            <div className='sticky top-20 space-y-4'>
              <ImageGallery images={productData.images} video={productData.video} />
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                {trustBadges.map(b=> (
                  <div key={b.label} className='flex items-center gap-2 rounded-md bg-white border p-2 shadow-sm'>
                    <b.icon className='h-5 w-5 text-indigo-600'/>
                    <span className='text-[11px] font-medium text-gray-600'>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className='lg:col-span-4 xl:col-span-4'>
            <div className='space-y-6'>
              <header>
                <h1 className='text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900'>{productData.name}</h1>
                <p className='mt-3 text-sm text-gray-600 leading-relaxed max-w-prose'>{productData.short}</p>
                <div className='mt-4 flex flex-wrap gap-3 text-xs text-gray-600'>
                  <span className='inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100'>4.8★ Rated</span>
                  <span className='inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100'>2.5K+ Sold</span>
                  <span className='inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200'>{productData.minOrder} MOQ</span>
                </div>
              </header>

              {/* Pricing Breaks */}
              <div className='rounded-lg border bg-white p-4 shadow-sm'>
                <div className='flex items-center justify-between mb-3'>
                  <h2 className='text-sm font-semibold text-gray-800'>Pricing (USD)</h2>
                  <button className='text-[11px] font-medium text-indigo-600 hover:underline'>Request Better Price</button>
                </div>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                  {productData.prices.map((br,i)=> (
                    <div key={i} className='rounded-md border bg-gray-50 p-3 text-center flex flex-col gap-1'>
                      <p className='text-[11px] font-medium text-gray-500'>Qty {br.minQty}{br.maxQty?`-${br.maxQty}`:'+'}</p>
                      <p className='text-sm font-semibold text-gray-900'>${br.price}</p>
                    </div>
                  ))}
                </div>
                <div className='mt-4'>
                  <PriceTable prices={productData.prices} />
                </div>
              </div>

              {/* Quick Specs */}
              <div className='rounded-lg border bg-white p-4 shadow-sm space-y-3'>
                <h2 className='text-sm font-semibold text-gray-800'>Quick Details</h2>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-[11px] sm:text-xs'>
                  <div><p className='text-gray-500'>Min. Order</p><p className='font-medium text-gray-800'>{productData.minOrder}</p></div>
                  <div><p className='text-gray-500'>Lead Time</p><p className='font-medium text-gray-800'>{productData.leadTime}</p></div>
                  <div><p className='text-gray-500'>Supply Ability</p><p className='font-medium text-gray-800'>{productData.supplyAbility}</p></div>
                  <div><p className='text-gray-500'>Shipping</p><p className='font-medium text-gray-800'>{productData.shipping}</p></div>
                  <div><p className='text-gray-500'>Certifications</p><p className='font-medium text-gray-800 space-x-1'>{productData.certifications.map(c=> <span key={c}>{c}</span>)}</p></div>
                </div>
                <details className='group'>
                  <summary className='cursor-pointer text-[11px] font-medium text-indigo-600 mt-1'>Show more details</summary>
                  <div className='mt-3 text-xs text-gray-600'>Additional technical specifications and material composition can be provided upon request.</div>
                </details>
              </div>

              {/* Action Panel (desktop) */}
              <div className='hidden md:flex flex-col gap-3'>
                <Button size='lg' className='w-full'>Request Quote</Button>
                <div className='flex gap-3'>
                  <Button variant='outline' className='flex-1'>Add to Cart</Button>
                  <Button variant='outline' className='flex-1'>Chat Now</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier / Meta */}
          <div className='lg:col-span-3 xl:col-span-3'>
            <div className='sticky top-20 space-y-4'>
              <SupplierCard supplier={productData.supplier} />
              <div className='rounded-lg border bg-white p-4 shadow-sm space-y-3'>
                <h4 className='text-sm font-semibold text-gray-800'>Assurance</h4>
                <ul className='space-y-2 text-xs text-gray-600'>
                  <li className='flex items-center gap-2'><ShieldCheckIcon className='h-4 w-4 text-indigo-600'/> Trade protection available</li>
                  <li className='flex items-center gap-2'><TruckIcon className='h-4 w-4 text-indigo-600'/> Multiple logistics partners</li>
                  <li className='flex items-center gap-2'><ClockIcon className='h-4 w-4 text-indigo-600'/> 24h average response</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Extended Content */}
        <div className='mt-12 rounded-xl border bg-white p-6 shadow-sm'>
          <ProductTabs
            description={productData.description}
            specifications={productData.specifications}
            reviews={productData.reviews}
            supplierInfo={productData.supplier}
          />
        </div>

        {/* Recommended / Related */}
        <section className='mt-16'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Related Products</h2>
          <div className='grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {Array.from({length:5}).map((_,i)=>(
              <div key={i} className='h-40 rounded-lg border bg-white flex items-center justify-center text-xs text-gray-400'>Placeholder</div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className='md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t p-3 flex gap-3'>
        <Button variant='outline' className='flex-1'>Chat</Button>
        <Button variant='outline' className='flex-1'>Add</Button>
        <Button className='flex-[1.6]'>Request Quote</Button>
      </div>
    </div>
  );
}
