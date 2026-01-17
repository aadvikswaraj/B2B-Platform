"use client"
import Navbar from "@/components/buyer/Navbar";
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import PostRequirementForm from '@/components/buyer/PostRequirementForm';

// Lazy load heavy slider only on client
const ImageSlider = dynamic(()=> import('@/components/ImageSlider'), { ssr:false });

const FEATURE_CARDS = [
  { title:'Source Smart', desc:'Compare verified suppliers and request competitive quotes quickly.', icon:'💼' },
  { title:'Real-Time Messaging', desc:'Chat securely with suppliers to clarify specs and negotiate.', icon:'💬' },
  { title:'Manage Orders', desc:'Track RFQs, quotes and orders in one unified dashboard.', icon:'📦' },
  { title:'Insights', desc:'Analytics on conversion, response speed, & supplier performance.', icon:'📊' }
];

const CATEGORIES = [
  { name:'Machinery', image:'https://cdn.d4tcdn.com/staticdt/images/category/machinery.jpg' },
  { name:'Metals', image:'https://cdn.d4tcdn.com/staticdt/images/category/metals.jpg' },
  { name:'Electrical', image:'https://cdn.d4tcdn.com/staticdt/images/category/electrical.jpg' },
  { name:'Packaging', image:'https://cdn.d4tcdn.com/staticdt/images/category/packaging.jpg' },
  { name:'Chemicals', image:'https://cdn.d4tcdn.com/staticdt/images/category/chemicals.jpg' },
  { name:'Solar & Energy', image:'https://cdn.d4tcdn.com/staticdt/images/category/solar.jpg' }
];

export default function Home(){
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-white'>
      <Navbar />
      {/* Hero Slider Section */}
      <section className='relative overflow-hidden'>
        <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)]' />
        <div className='w-full'>
          <ImageSlider />
        </div>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 flex flex-col lg:flex-row gap-12 items-center'>
          <div className='flex-1 max-w-xl'>
            <h1 className='text-3xl sm:text-5xl font-semibold tracking-tight text-gray-900'>
              Powering Global <span className='bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent'>B2B Trade</span>
            </h1>
            <p className='mt-5 text-base sm:text-lg text-gray-600 leading-relaxed'>Discover verified suppliers, manage buy leads, and accelerate procurement with unified messaging, quoting, and analytics.</p>
            <div className='mt-8 flex flex-col sm:flex-row gap-3'>
              <Link href='/signup' className='inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-3 text-sm font-medium text-white shadow hover:bg-indigo-500 transition'>Get Started</Link>
              <Link href='/seller' className='inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-medium text-gray-800 shadow border border-gray-200 hover:bg-gray-50 transition'>Become a Seller</Link>
            </div>
            <div className='mt-8 grid grid-cols-3 gap-4 text-center'>
              {[{label:'Suppliers',value:'8.2k+'},{label:'Products',value:'120k+'},{label:'Countries',value:'40+'}].map(s=> (
                <div key={s.label} className='rounded-lg bg-white/70 backdrop-blur border border-gray-200 p-4'>
                  <p className='text-xl font-semibold text-gray-900'>{s.value}</p>
                  <p className='text-[11px] font-medium tracking-wide text-gray-500 uppercase'>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className='flex-1 w-full max-w-xl relative'>
            <div className='aspect-[4/3] rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200 bg-white flex items-center justify-center'>
              <Image src='https://cdn.d4tcdn.com/staticdt/images/home-banner/sell-on-d4t.jpg' alt='Hero Banner' fill className='object-cover' />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Post Requirement */}
      <section className='py-10 bg-white/60 backdrop-blur border-y'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col lg:flex-row gap-6 lg:items-center'>
            <div className='lg:w-1/3'>
              <h2 className='text-xl font-semibold text-gray-900'>Post a Requirement</h2>
              <p className='mt-2 text-sm text-gray-600'>Tell suppliers what you need and receive competitive quotes quicker.</p>
            </div>
            <div className='flex-1'>
              <PostRequirementForm />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className='py-16'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <h2 className='text-2xl sm:text-3xl font-semibold text-gray-900 mb-8'>Platform Advantages</h2>
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {FEATURE_CARDS.map(f=> (
              <div key={f.title} className='group rounded-xl bg-white p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition flex flex-col'>
                <div className='text-3xl'>{f.icon}</div>
                <h3 className='mt-4 font-medium text-gray-900'>{f.title}</h3>
                <p className='mt-2 text-sm text-gray-600 leading-relaxed'>{f.desc}</p>
                <span className='mt-4 inline-flex items-center text-xs font-medium text-indigo-600 group-hover:underline'>Learn more →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Carousel */}
      <section className='py-12 bg-gradient-to-b from-white to-slate-50'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl sm:text-2xl font-semibold text-gray-900'>Top Categories</h2>
            <Link href='/search' className='text-sm font-medium text-indigo-600 hover:text-indigo-500'>View all</Link>
          </div>
          <div className='relative'>
            <div className='grid gap-5 grid-flow-col auto-cols-[170px] overflow-x-auto pb-2 no-scrollbar'>
              {CATEGORIES.map(c=> (
                <Link key={c.name} href={`/search?cat=${encodeURIComponent(c.name)}`} className='group relative rounded-xl overflow-hidden h-40 flex items-end p-3 bg-gray-100 ring-1 ring-gray-200 hover:ring-indigo-300 hover:shadow-md transition'>
                  <Image src={c.image} alt={c.name} fill className='object-cover absolute inset-0 opacity-80 group-hover:opacity-100 transition'/>
                  <div className='relative z-10'>
                    <p className='text-sm font-medium text-white drop-shadow-sm'>{c.name}</p>
                  </div>
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className='py-20'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h2 className='text-2xl sm:text-3xl font-semibold text-gray-900'>Ready to scale your sourcing?</h2>
          <p className='mt-4 text-gray-600 max-w-2xl mx-auto'>Join thousands of businesses using our platform to connect, negotiate and close deals faster.</p>
          <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/signup' className='inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-3 text-sm font-medium text-white shadow hover:bg-indigo-500 transition'>Create Free Account</Link>
            <Link href='/seller' className='inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-medium text-gray-800 shadow border border-gray-200 hover:bg-gray-50 transition'>Sell on Platform</Link>
          </div>
        </div>
      </section>
      <footer className='mt-auto border-t bg-white/60 backdrop-blur'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-gray-500'>
          © {new Date().getFullYear()} B2B Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
