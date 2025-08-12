"use client"
import React, { useState } from 'react';
import Image from "next/image";
import { CiSearch } from "react-icons/ci";
import { MdOutlineSell } from "react-icons/md";
import { AiOutlineShoppingCart, AiOutlineMessage, AiOutlineUser } from "react-icons/ai";
import { BsClipboardCheck } from "react-icons/bs";
import { RiMenu3Line } from "react-icons/ri";
import { FaRegHeart } from "react-icons/fa6";
import { LiaClipboardListSolid } from "react-icons/lia";
import { FaRegUser } from "react-icons/fa";
import { CiViewList } from "react-icons/ci";
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-white shadow-md sticky w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href={"/"} className="flex-shrink-0">
            <Image width={150} height={50} src="/logo/logo-s-2.png" alt="Logo" className="cursor-pointer"/>
          </Link>

          {/* Search bar - hidden on mobile */}
          <form className="hidden md:flex flex-1 mx-8" action="/search" method="GET">
            <div className="relative w-full max-w-2xl">
              <input 
                type="text" 
                name='product'
                placeholder='What are you looking for?'
                className="w-full pl-4 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 text-gray-600 hover:text-blue-600">
                <CiSearch className="w-6 h-6"/>
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm">
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
            <div className='relative group'>
                <Link href={"/login"} className="nav-btn flex flex-col items-center px-1.5">
                    <AiOutlineUser className="w-6 h-6"/>
                    <span>Sign In</span>
                </Link>
                <div className="user-menu-popup absolute top-full w-40 bg-white shadow-md border border-gray-500 rounded-sm overflow-hidden hidden group-hover:block">
                    <ul>
                        <li>
                            <Link href={"/myaccount/profile"} className='flex items-center py-2.5 pl-1 hover:bg-gray-100'><FaRegUser className='w-4 h-4 mr-1'/>My Profile</Link>
                        </li>
                        <li>
                            <Link href={"/myaccount/orders"} className='flex items-center py-2.5 pl-1 hover:bg-gray-100'><LiaClipboardListSolid className='w-4 h-4 mr-1'/>Orders</Link>
                        </li>
                        <li>
                            <Link href="/myaccount/message-center" className='flex items-center py-2.5 pl-1 hover:bg-gray-100'><AiOutlineMessage className='w-4 h-4 mr-1'/>Messages</Link>
                        </li>
                        <li>
                            <Link href={"/myaccount/rfqs"} className='flex items-center py-2.5 pl-1 hover:bg-gray-100'><CiViewList className='w-4 h-4 mr-1'/>RFQS</Link>
                        </li>
                        <li>
                            <Link href={"/myaccount/favs"} className='flex items-center py-2.5 pl-1 hover:bg-gray-100'><FaRegHeart className='w-4 h-4 mr-1'/>Favourties</Link>
                        </li>
                        <li>
                            <Link href={"/seller"} className='flex items-center py-2.5 pl-1 hover:bg-gray-100'><MdOutlineSell className='w-4 h-4 mr-1'/>Sell with Us</Link>
                        </li>
                    </ul>
                </div>
            </div>
          </nav>
        </div>

        {/* Mobile Search - visible only on mobile */}
        <div className="md:hidden py-4">
          <form action="/search" method="GET" className="relative">
            <input 
              type="text"
              name="product" 
              placeholder='What are you looking for?'
              className="w-full pl-4 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 text-gray-600">
              <CiSearch className="w-6 h-6"/>
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
