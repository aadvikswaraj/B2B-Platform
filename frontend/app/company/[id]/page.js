'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/buyer/Navbar';
import { Card, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MapPinIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon, ClockIcon, BuildingOffice2Icon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Input, Textarea } from '@/components/ui/Input';
import { useAlert } from '@/components/ui/AlertManager';

function Stat({ label, value }){
  return (
    <div className="rounded-md border bg-gray-50 p-3 text-center">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

export default function CompanyPage({ params }){
  const { id } = params;
  const pushAlert = useAlert();
  // Mock data – swap to real API later using id
  const company = {
    id,
    name: 'Tech Solutions Co., Ltd',
    logo: 'https://placehold.co/120x120',
    banner: '/company-banner.jpg',
    location: 'Shanghai, China',
    yearsInBusiness: 8,
    businessType: 'Manufacturer',
    mainProducts: ['Electronics', 'Gadgets', 'Accessories'],
    website: 'https://example.com',
    description: 'We are a leading manufacturer specializing in high-precision electronics and advanced gadgets with global supply capabilities.',
    metrics: {
      responseTime: '≤24h',
      onTimeDelivery: '98%',
      transactionLevel: 'Diamond',
      transactions: '1,250+',
      employees: '200+',
      certifications: ['ISO9001', 'CE']
    },
    featuredProducts: Array.from({length:8}).map((_,i)=> ({ id: i+1, name: `Featured Product ${i+1}`, price: (49+i*5).toFixed(2), image: '/product-image.jpg' })),
    featuredHero: { id: 101, name: 'Flagship Industrial Controller X200', price: '299.00', image: '/product-image.jpg', blurb: 'Next-gen performance with robust reliability for demanding environments.' }
  };

  // Contact form state
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cMsg, setCMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const contactErrors = useMemo(()=>{
    const e = {};
    if(!cName.trim()) e.name = 'Your name is required';
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cEmail)) e.email = 'Valid email required';
    if(cPhone && !/^\+?[0-9\-\s]{6,15}$/.test(cPhone)) e.phone = 'Invalid phone';
    if(cMsg.trim().length < 10) e.msg = 'Please add more details (min 10 chars)';
    return e;
  }, [cName, cEmail, cPhone, cMsg]);

  async function submitContact(e){
    e?.preventDefault?.();
    if(Object.keys(contactErrors).length) return;
    setSubmitting(true);
    try{
      // TODO: integrate backend for supplier contact
      console.log('CONTACT_SUPPLIER', { companyId: id, name:cName, email:cEmail, phone:cPhone, message:cMsg });
      pushAlert?.('success', 'Message sent to supplier. They will respond soon.');
      setCName(''); setCEmail(''); setCPhone(''); setCMsg('');
    }catch(err){
      pushAlert?.('error', err?.message || 'Failed to send message');
    }finally{ setSubmitting(false); }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-white">
      <Navbar />
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border shadow-sm">
          <div className="h-28 sm:h-36 w-full bg-gradient-to-r from-indigo-50 to-blue-50"/>
          <div className="p-4 sm:p-6 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 -mt-16">
              <div className="flex items-center gap-4">
                <img src={company.logo} alt={company.name} className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg border bg-white object-cover shadow"/>
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{company.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1"><MapPinIcon className="h-4 w-4 text-indigo-600"/>{company.location}</span>
                    <span className="inline-flex items-center gap-1"><BuildingOffice2Icon className="h-4 w-4 text-indigo-600"/>{company.businessType}</span>
                    <span className="inline-flex items-center gap-1"><ShieldCheckIcon className="h-4 w-4 text-indigo-600"/>Verified Supplier</span>
                  </div>
                  <div className="text-[11px] text-gray-500">Main products: {company.mainProducts.join(', ')}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant='outline'>Visit Website</Button>
                <Button>Contact Supplier</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky sub-navigation */}
        <div className="sticky top-16 z-30 mt-4 bg-white/90 backdrop-blur border rounded-lg p-2">
          <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <a href="#home" className="px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-700">Home</a>
            <a href={`/company/${id}/products`} className="px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-700">Products</a>
            <a href="#about" className="px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-700">About Us</a>
            <a href="#contact" className="px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-700">Contact Us</a>
          </nav>
        </div>

        {/* Home Section (Overview) */}
        <div id="home" className="grid gap-6 md:grid-cols-3 mt-6 scroll-mt-24">
          {/* Left: Overview & About */}
          <div className="md:col-span-2 space-y-6">
            {/* Featured Product hero */}
            <Card>
              <CardHeader title="Featured Product" />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <img src={company.featuredHero.image} alt={company.featuredHero.name} className="w-full h-40 sm:h-48 object-cover rounded-md border" />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{company.featuredHero.name}</h3>
                  <p className="text-sm text-gray-700">{company.featuredHero.blurb}</p>
                  <div className="mt-1 text-xs text-gray-600">From ${company.featuredHero.price}</div>
                  <div className="mt-2 flex gap-2">
                    <Button as='a' href={`/product/${company.featuredHero.id}`}>View Product</Button>
                    <Button variant='outline'>Request Quote</Button>
                  </div>
                </div>
              </div>
            </Card>
            <Card>
              <CardHeader title="Company Overview"/>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Response Time" value={company.metrics.responseTime} />
                <Stat label="On-time Delivery" value={company.metrics.onTimeDelivery} />
                <Stat label="Transaction Level" value={company.metrics.transactionLevel} />
                <Stat label="Transactions" value={company.metrics.transactions} />
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Years in Business" value={`${company.yearsInBusiness}+`} />
                <Stat label="Employees" value={company.metrics.employees} />
                <Stat label="Certifications" value={company.metrics.certifications.join(', ')} />
                <Stat label="Business Type" value={company.businessType} />
              </div>
            </Card>

            <Card>
              <CardHeader title="About the Company"/>
              <p className="text-sm text-gray-700 leading-relaxed">{company.description}</p>
            </Card>

            {/* Removed multi-item featured products grid; dedicated products live at /company/[id]/products */}
          </div>

          {/* Right: Contact & Assurance */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Contact"/>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700"><ChatBubbleLeftRightIcon className='h-4 w-4 text-indigo-600'/>Average response: {company.metrics.responseTime}</div>
                <div className="flex items-center gap-2 text-gray-700"><ClockIcon className='h-4 w-4 text-indigo-600'/>Working hours: Mon–Fri</div>
                <div className="flex items-center gap-2 text-gray-700"><GlobeAltIcon className='h-4 w-4 text-indigo-600'/>Website: <a className='text-indigo-700 hover:underline' href={company.website} target='_blank' rel='noopener noreferrer'>{company.website}</a></div>
                <div className="pt-2 flex gap-2">
                  <Button className='flex-1'>Contact Now</Button>
                  <Button variant='outline' className='flex-1'>Chat Now</Button>
                </div>
              </div>
            </Card>
            <Card>
              <CardHeader title="Assurance"/>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className='flex items-center gap-2'><ShieldCheckIcon className='h-4 w-4 text-indigo-600'/>Trade protection available</li>
                <li className='flex items-center gap-2'><ClockIcon className='h-4 w-4 text-indigo-600'/>On-time delivery: {company.metrics.onTimeDelivery}</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Products section removed to consolidate on the dedicated products page */}

        {/* About Us */}
        <section id="about" className="mt-8 scroll-mt-24">
          <Card>
            <CardHeader title="About Us" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {company.description} We focus on reliable quality, timely deliveries, and tailored OEM/ODM solutions for global clients.
                </p>
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <li className="rounded-md border bg-gray-50 p-3">• OEM/ODM capability</li>
                  <li className="rounded-md border bg-gray-50 p-3">• In-house QA lab</li>
                  <li className="rounded-md border bg-gray-50 p-3">• Global export experience</li>
                  <li className="rounded-md border bg-gray-50 p-3">• Flexible MOQ</li>
                </ul>
              </div>
              <div className="space-y-3 text-sm">
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-gray-500">Business Type</div>
                  <div className="font-medium text-gray-900">{company.businessType}</div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-gray-500">Years in Business</div>
                  <div className="font-medium text-gray-900">{company.yearsInBusiness}+ years</div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-gray-500">Certifications</div>
                  <div className="font-medium text-gray-900">{company.metrics.certifications.join(', ')}</div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Contact Us */}
        <section id="contact" className="mt-8 scroll-mt-24">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader title="Contact Us" />
              <form onSubmit={submitContact} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Your Name</label>
                  <Input value={cName} onChange={(e)=> setCName(e.target.value)} placeholder="John Doe" invalid={!!contactErrors.name} />
                  {contactErrors.name && <p className="mt-1 text-[11px] text-rose-600">{contactErrors.name}</p>}
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <Input type="email" value={cEmail} onChange={(e)=> setCEmail(e.target.value)} placeholder="john@example.com" invalid={!!contactErrors.email} />
                  {contactErrors.email && <p className="mt-1 text-[11px] text-rose-600">{contactErrors.email}</p>}
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <Input value={cPhone} onChange={(e)=> setCPhone(e.target.value)} placeholder="+1 555 123 4567" invalid={!!contactErrors.phone} />
                  {contactErrors.phone && <p className="mt-1 text-[11px] text-rose-600">{contactErrors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                  <Textarea rows={4} value={cMsg} onChange={(e)=> setCMsg(e.target.value)} placeholder="Describe your requirement, quantity, destination..." invalid={!!contactErrors.msg} />
                  {contactErrors.msg && <p className="mt-1 text-[11px] text-rose-600">{contactErrors.msg}</p>}
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" disabled={!!Object.keys(contactErrors).length || submitting}>{submitting? 'Sending…':'Send Message'}</Button>
                </div>
              </form>
            </Card>
            <Card>
              <CardHeader title="Reach Us" />
              <div className="space-y-3 text-sm text-gray-700">
                <div><span className="text-gray-500 block text-xs">Location</span>{company.location}</div>
                <div><span className="text-gray-500 block text-xs">Email</span><a className="text-indigo-700 hover:underline" href="mailto:sales@example.com">sales@example.com</a></div>
                <div><span className="text-gray-500 block text-xs">Phone</span><a className="text-indigo-700 hover:underline" href="tel:+861234567890">+86 123 456 7890</a></div>
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-[11px] text-indigo-700">We reply within 24 hours on business days.</div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
