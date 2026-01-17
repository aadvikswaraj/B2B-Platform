"use client"
import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import Image from "next/image";
import { CiSearch } from "react-icons/ci";
import { MdOutlineSell } from "react-icons/md";
import { AiOutlineShoppingCart, AiOutlineMessage, AiOutlineUser } from "react-icons/ai";
import { BsClipboardCheck } from "react-icons/bs";
import { RiMenu3Line } from "react-icons/ri";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FaRegHeart } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa";
import { LiaClipboardListSolid } from "react-icons/lia";
// removed unused FaRegUser import; account items moved into AccountDropdown
import { CiViewList } from "react-icons/ci";
import AccountDropdown from "@/components/buyer/AccountDropdown";
import Link from 'next/link';
import PostBuyRequirementDialog from '@/components/buyer/PostBuyRequirementDialog';
import { AuthContext } from '@/context/context';

function useOnClickOutside(ref, handler){
  // Deprecated in favor of internal dropdown handler; kept here for backward compatibility
}

export default function Navbar() {
  const [mobileOpen,setMobileOpen] = useState(false);
  const [accountOpen,setAccountOpen] = useState(false);
  const [showPostReq, setShowPostReq] = useState(false);
  const [searchFocus,setSearchFocus] = useState(false);
  const [portalReady,setPortalReady] = useState(false);

  let auth = useContext(AuthContext);

  // Delay portal usage until mounted to avoid SSR mismatch
  useEffect(()=> { setPortalReady(true); },[]);
  


  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 shadow-sm border-b border-gray-100/70">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Left cluster: hamburger + logo */}
          <div className='flex items-center gap-3 min-w-0'>
            <button onClick={()=> setMobileOpen(true)} className='md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition' aria-label='Open menu'>
              <RiMenu3Line className='h-5 w-5'/>
            </button>
            <Link href={"/"} className="flex-shrink-0 flex items-center gap-2 min-w-0">
              <Image width={110} height={32} src="/logo/logo-s-2.png" alt="Logo" className="h-6 md:h-8 w-auto object-contain cursor-pointer transition-all"/>
            </Link>
          </div>
          {/* Mobile Top Icons Row (account, messages, cart) */}
        <div className='md:hidden flex items-center justify-end gap-2'>
          <Link href='/myaccount/message-center' aria-label='Messages' className='inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition'>
            <AiOutlineMessage className='h-5 w-5'/>
          </Link>
          <Link href='/cart' aria-label='Cart' className='inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition'>
            <AiOutlineShoppingCart className='h-5 w-5'/>
          </Link>
          <div className='relative'>
            <button onClick={()=> setAccountOpen(o=> !o)} aria-label='Account' aria-expanded={accountOpen} className='inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition'>
              <AiOutlineUser className='h-5 w-5'/>
            </button>
            <AccountDropdown isOpen={accountOpen} onClose={()=> setAccountOpen(false)} isLoggedIn={auth.loggedIn} isLoading={auth.loading} />
          </div>
        </div>

          {/* Desktop Search (hidden on mobile) */}
          <form className="hidden md:flex flex-1 mx-6" action="/search" method="GET">
            <div className={`relative w-full max-w-2xl rounded-full transition-all ${searchFocus? 'ring-2 ring-indigo-500/60 shadow-sm':''}`}>
              <input
                type="text"
                name='q'
                placeholder='Search products, suppliers…'
                onFocus={()=> setSearchFocus(true)}
                onBlur={()=> setSearchFocus(false)}
                className="w-full pl-5 pr-14 py-2.5 rounded-full border border-gray-200 bg-gray-50/80 backdrop-blur text-sm placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white"
              />
              <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-500">
                <CiSearch className="w-5 h-5"/>
              </button>
            </div>
          </form>

          {/* Desktop Navigation (unchanged) */}
          <nav className="hidden md:flex items-center space-x-5 text-[11px] font-medium">
            <button onClick={()=> setShowPostReq(true)} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-indigo-500 transition">
              <LiaClipboardListSolid className='h-4 w-4'/> Post Requirement
            </button>
            <Link href="/cart" className="nav-btn flex flex-col items-center px-1.5">
              <AiOutlineShoppingCart className="w-6 h-6"/>
              <span>Cart</span>
            </Link>
            <Link href="/myaccount/message-center" className="nav-btn flex flex-col items-center px-1.5">
              <AiOutlineMessage className="w-6 h-6"/>
              <span>Messages</span>
            </Link>
            <Link href="/myaccount/orders" className="nav-btn flex flex-col items-center px-1.5">
              <BsClipboardCheck className="w-6 h-6"/>
              <span>Orders</span>
            </Link>
            <div className='relative'>
              <button
                onClick={()=> setAccountOpen(o=> !o)}
                aria-haspopup='true'
                aria-expanded={accountOpen}
                className='flex flex-col items-center gap-1 px-1.5 text-gray-600 hover:text-indigo-600'
              >
                <span className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-indigo-50 transition'>
                  <AiOutlineUser className='w-5 h-5'/>
                </span>
                <span>{auth.loading ? 'Account' : (auth.loggedIn ? 'Account' : 'Sign In')}</span>
              </button>
              <AccountDropdown isOpen={accountOpen} onClose={()=> setAccountOpen(false)} isLoggedIn={auth.loggedIn} isLoading={auth.loading} />
            </div>
          </nav>
        </div>

        {/* Mobile Full-width Search Bar */}
        <div className="md:hidden pb-3">
          <form action="/search" method="GET" className="relative">
            <input
              type="text"
              name="q"
              placeholder='Search products, suppliers…'
              className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:bg-white text-sm"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">
              <CiSearch className="w-5 h-5"/>
            </button>
          </form>
        </div>
  </div>
  {/* Mobile Drawer */}
      {portalReady && mobileOpen && createPortal(
        <div className='fixed inset-0 z-50 md:hidden'>
          <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={()=> setMobileOpen(false)} />
          <div className='absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white shadow-xl flex flex-col rounded-r-2xl overflow-hidden animate-slideIn'>
            <div className='flex items-center justify-between px-4 h-16 border-b'>
              <Link href='/' onClick={()=> setMobileOpen(false)} className='flex items-center gap-2'>
                <Image src='/logo/logo-s-2.png' width={100} height={28} alt='Logo' className='h-6 w-auto md:h-8'/>
              </Link>
              <button aria-label='Close menu' onClick={()=> setMobileOpen(false)} className='p-2 rounded-lg hover:bg-gray-100 text-gray-500'>
                <XMarkIcon className='h-5 w-5'/>
              </button>
            </div>
            <div className='p-4 flex-1 overflow-auto space-y-6'>
              <div>
                <button onClick={()=> { setMobileOpen(false); setShowPostReq(true); }} className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-white text-sm font-semibold shadow hover:bg-indigo-500'>
                  <LiaClipboardListSolid className='h-4 w-4'/> Post Requirement
                </button>
              </div>
              <div>
                <h4 className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2'>Quick Links</h4>
                <ul className='space-y-1 text-sm font-medium'>
                  <li><Link onClick={()=> setMobileOpen(false)} href='/cart' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><AiOutlineShoppingCart className='h-5 w-5 text-gray-500'/>Cart</Link></li>
                  <li><Link onClick={()=> setMobileOpen(false)} href='/myaccount/message-center' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><AiOutlineMessage className='h-5 w-5 text-gray-500'/>Messages</Link></li>
                  <li><Link onClick={()=> setMobileOpen(false)} href='/myaccount/orders' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><BsClipboardCheck className='h-5 w-5 text-gray-500'/>Orders</Link></li>
                </ul>
              </div>
              <div>
                <h4 className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2'>Account</h4>
                {auth.loading ? (
                  <div className='space-y-2'>
                    <div className='h-10 rounded-lg bg-gray-100 animate-pulse' />
                    <div className='h-10 rounded-lg bg-gray-100 animate-pulse' />
                    <div className='h-10 rounded-lg bg-gray-100 animate-pulse' />
                  </div>
                ) : !auth.loggedIn ? (
                  <div className='space-y-2'>
                    <Link onClick={()=> setMobileOpen(false)} href='/login' className='flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-white text-sm font-semibold shadow hover:bg-indigo-500'>
                      <AiOutlineUser className='h-4 w-4'/> Sign In
                    </Link>
                    <Link onClick={()=> setMobileOpen(false)} href='/signup' className='flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50'>
                      <AiOutlineUser className='h-4 w-4'/> Create Account
                    </Link>
                    <Link onClick={()=> setMobileOpen(false)} href='/seller' className='flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50'>
                      <MdOutlineSell className='h-4 w-4'/> Sell with Us
                    </Link>
                  </div>
                ) : (
                  <ul className='space-y-1 text-sm font-medium'>
                    <li><Link onClick={()=> setMobileOpen(false)} href='/myaccount/profile' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><FaRegUser className='h-5 w-5 text-gray-500'/>Profile</Link></li>
                    <li><Link onClick={()=> setMobileOpen(false)} href='/myaccount/rfqs' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><CiViewList className='h-5 w-5 text-gray-500'/>Buy Leads</Link></li>
                    <li><Link onClick={()=> setMobileOpen(false)} href='/myaccount/favs' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><FaRegHeart className='h-5 w-5 text-gray-500'/>Favourites</Link></li>
                    <li><Link onClick={()=> setMobileOpen(false)} href='/seller' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><MdOutlineSell className='h-5 w-5 text-gray-500'/>Sell with Us</Link></li>
                  </ul>
                )}
              </div>
              <div className='pt-2 border-t'>
                <p className='text-[11px] text-gray-500'>Grow faster: respond to buy leads early to improve conversions.</p>
              </div>
            </div>
            <div className='p-4 border-t text-center'>
              <span className='text-[11px] text-gray-400'>© {new Date().getFullYear()} B2B Platform</span>
            </div>
          </div>
          <style jsx>{`
            .animate-slideIn { animation: slideIn .28s cubic-bezier(.4,0,.2,1); }
            @keyframes slideIn { from { transform: translateX(-12%); opacity:0 } to { transform: translateX(0); opacity:1 } }
          `}</style>
        </div>, document.body)
      }
  {portalReady && (
    <PostBuyRequirementDialog open={showPostReq} onClose={()=> setShowPostReq(false)} />
  )}
  </header>
  )
}
