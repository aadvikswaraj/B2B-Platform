"use client"
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from "next/image";
import { CiSearch } from "react-icons/ci";
import { MdOutlineSell } from "react-icons/md";
import { AiOutlineShoppingCart, AiOutlineMessage, AiOutlineUser } from "react-icons/ai";
import { BsClipboardCheck } from "react-icons/bs";
import { RiMenu3Line } from "react-icons/ri";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FaRegHeart } from "react-icons/fa6";
import { LiaClipboardListSolid } from "react-icons/lia";
import { FaRegUser } from "react-icons/fa";
import { CiViewList } from "react-icons/ci";
import Link from 'next/link';

function useOnClickOutside(ref, handler){
  useEffect(()=>{
    const listener = (e)=>{ if(!ref.current || ref.current.contains(e.target)) return; handler(); };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return ()=> { document.removeEventListener('mousedown', listener); document.removeEventListener('touchstart', listener); };
  },[ref,handler]);
}

export default function Navbar() {
  const [mobileOpen,setMobileOpen] = useState(false);
  const [accountOpen,setAccountOpen] = useState(false);
  const [searchFocus,setSearchFocus] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const accountRef = useRef(null);
  const [portalReady,setPortalReady] = useState(false);
  useOnClickOutside(accountRef, ()=> setAccountOpen(false));

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/auth/loggedin-status', {
          method: 'GET',
          credentials: 'include'
        });
        const loggedInStatus = await response.json();
        console.log("Logged in status response:", loggedInStatus);
        setIsLoggedIn(loggedInStatus.data.isLoggedIn);
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
      }
    }
    checkLoggedInStatus();
  }, []);

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
          <button onClick={()=> setAccountOpen(o=> !o)} aria-label='Account' className='relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition'>
            <AiOutlineUser className='h-5 w-5'/>
          </button>
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
            <Link href="/myaccount/rfqs" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-indigo-500 transition">
              <LiaClipboardListSolid className='h-4 w-4'/> Post Requirement
            </Link>
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
            <div className='relative' ref={accountRef}>
              <button onClick={()=> setAccountOpen(o=> !o)} className='flex flex-col items-center gap-1 px-1.5 text-gray-600 hover:text-indigo-600'>
                <span className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-indigo-50 transition'>
                  <AiOutlineUser className='w-5 h-5'/>
                </span>
                <span>Account</span>
              </button>
              {accountOpen && (
                <div className='absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-50'>
                  <ul className='py-1 text-sm text-gray-700 max-h-[70vh] overflow-auto'>
                    <li><Link href='/login' className='flex items-center gap-2 px-3 py-2 hover:bg-gray-50'><AiOutlineUser className='h-4 w-4'/>Sign In</Link></li>
                    <li className='border-t my-1'/>
                    <li><Link href='/myaccount/profile' className='flex items-center gap-2 px-3 py-2 hover:bg-gray-50'><FaRegUser className='h-4 w-4'/>Profile</Link></li>
                    <li><Link href='/myaccount/orders' className='flex items-center gap-2 px-3 py-2 hover:bg-gray-50'><LiaClipboardListSolid className='h-4 w-4'/>Orders</Link></li>
                    <li><Link href='/myaccount/message-center' className='flex items-center gap-2 px-3 py-2 hover:bg-gray-50'><AiOutlineMessage className='h-4 w-4'/>Messages</Link></li>
                    <li><Link href='/myaccount/rfqs' className='flex items-center gap-2 px-3 py-2 hover:bg-gray-50'><CiViewList className='h-4 w-4'/>Buy Leads</Link></li>
                    <li><Link href='/myaccount/favs' className='flex items-center gap-2 px-3 py-2 hover:bg-gray-50'><FaRegHeart className='h-4 w-4'/>Favourites</Link></li>
                    <li><Link href='/seller' className='flex items-center gap-2 px-3 py-2 hover:bg-gray-50'><MdOutlineSell className='h-4 w-4'/>Sell with Us</Link></li>
                  </ul>
                </div>
              )}
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
                <Link onClick={()=> setMobileOpen(false)} href='/myaccount/rfqs' className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-white text-sm font-semibold shadow hover:bg-indigo-500'>
                  <LiaClipboardListSolid className='h-4 w-4'/> Post Requirement
                </Link>
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
                <ul className='space-y-1 text-sm font-medium'>
                  <li><Link onClick={()=> setMobileOpen(false)} href='/login' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><AiOutlineUser className='h-5 w-5 text-gray-500'/>Sign In</Link></li>
                  <li><Link onClick={()=> setMobileOpen(false)} href='/myaccount/profile' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><FaRegUser className='h-5 w-5 text-gray-500'/>Profile</Link></li>
                  <li><Link onClick={()=> setMobileOpen(false)} href='/myaccount/rfqs' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><CiViewList className='h-5 w-5 text-gray-500'/>Buy Leads</Link></li>
                  <li><Link onClick={()=> setMobileOpen(false)} href='/myaccount/favs' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><FaRegHeart className='h-5 w-5 text-gray-500'/>Favourites</Link></li>
                  <li><Link onClick={()=> setMobileOpen(false)} href='/seller' className='flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50'><MdOutlineSell className='h-5 w-5 text-gray-500'/>Sell with Us</Link></li>
                </ul>
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
  </header>
  )
}
