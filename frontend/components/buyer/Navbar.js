"use client";
import React, { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  ShoppingCart,
  MessageSquare,
  User,
  ClipboardList,
  Heart,
  List,
  X,
  Package,
  Store,
  LogIn,
  UserPlus,
  ChevronRight,
  Settings,
} from "lucide-react";
import AccountDropdown from "@/components/buyer/AccountDropdown";
import dynamic from "next/dynamic";
import { ScreenSpinner } from "../ui/ScreenSpinner";
import { useAuth } from "@/components/common/AuthProvider";

const PostRequirementFormDialog = dynamic(
  () => import("@/components/buyer/PostBuyRequirementDialog"),
  {
    ssr: false,
    loading: () => <ScreenSpinner />,
  },
);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [showPostReq, setShowPostReq] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const auth = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setPortalReady(true);

    const handleScroll = () => {
      // Add shadow and glass effect intensity on scroll
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`
            sticky top-0 z-50 w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              isScrolled
                ? "bg-white/80 backdrop-blur-xl shadow-md border-gray-200/50"
                : "bg-white/60 backdrop-blur-lg border-transparent"
            }
             border-b
             ${/* Mobile Scroll Hiding Logic */ ""}
             ${isScrolled ? "max-md:-translate-y-[72px]" : "translate-y-0"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Logo, Desktop Search, Actions */}
          <div className="flex justify-between items-center h-[60px] gap-6">
            {/* Left: Logo & Mobile Menu Trigger */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 -ml-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full transition-colors active:scale-95"
              >
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              </button>

              <Link href="/" className="relative flex-shrink-0 group">
                <Image
                  width={120}
                  height={40}
                  src="/logo/logo-s-2.png"
                  alt="Logo"
                  className="h-8 md:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
                  priority
                />
              </Link>
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-auto">
              <form
                action="/search"
                method="GET"
                className="w-full relative group"
              >
                <div
                  className={`
                        flex items-center w-full transition-all duration-300 ease-out
                        rounded-full border
                        ${
                          searchFocus
                            ? "bg-white ring-4 ring-indigo-100 border-indigo-300 shadow-lg shadow-indigo-500/10"
                            : isScrolled
                              ? "bg-gray-100/50 border-gray-200 hover:bg-white hover:shadow-md"
                              : "bg-white/80 border-gray-200 hover:shadow-md hover:border-gray-300"
                        }
                    `}
                >
                  <Search
                    className={`w-4 h-4 ml-4 transition-colors ${
                      searchFocus ? "text-indigo-500" : "text-slate-400"
                    }`}
                  />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search for products..."
                    className="w-full bg-transparent border-none py-2.5 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-0"
                    onFocus={() => setSearchFocus(true)}
                    onBlur={() => setSearchFocus(false)}
                  />
                  <button
                    type="submit"
                    className={`
                        m-1 p-1.5 rounded-full transition-all duration-300
                        ${
                          searchFocus
                            ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                            : "bg-gray-100 text-slate-500 hover:bg-indigo-600 hover:text-white"
                        }
                    `}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Actions & Navigation (Desktop) */}
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setShowPostReq(true)}
                className="hidden lg:flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-200 hover:bg-white transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <ClipboardList className="w-4 h-4" strokeWidth={2} />
                <span>Post Request</span>
              </button>

              <div className="flex items-center gap-1">
                <NavLink
                  href="/cart"
                  icon={ShoppingCart}
                  label="Cart"
                  count={0}
                />
                <NavLink
                  href="/myaccount/message-center"
                  icon={MessageSquare}
                  label="Messages"
                />
                <NavLink
                  href="/myaccount/orders"
                  icon={Package}
                  label="Orders"
                />

                <div className="h-6 w-px bg-gray-200 mx-2" />

                {/* Profile Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className={`
                            flex items-center gap-2 px-2 py-1.5 rounded-full transition-all duration-300
                            ${accountOpen ? "bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100" : "hover:bg-gray-50 text-slate-600"}
                        `}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-white border border-indigo-50 flex items-center justify-center shadow-sm">
                      <User
                        className="w-4 h-4 text-indigo-600"
                        strokeWidth={2}
                      />
                    </div>
                    {/* <span className="text-sm font-medium pr-1 max-w-[80px] truncate hidden xl:block">
                        {auth.loggedIn ? "Profile" : "Sign In"}
                    </span> */}
                  </button>

                  <AccountDropdown
                    isOpen={accountOpen}
                    onClose={() => setAccountOpen(false)}
                    isLoggedIn={auth.loggedIn}
                    isLoading={auth.loading}
                  />
                </div>
              </div>
            </nav>

            {/* Right: Mobile Icons (Visible on mobile) */}
            <div
              className={`flex md:hidden items-center gap-2 transition-opacity duration-300 ${
                isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <Link
                href="/cart"
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />
              </Link>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
                aria-label="Account"
              >
                <User className="w-6 h-6" strokeWidth={1.5} />
                <AccountDropdown
                  isOpen={accountOpen}
                  onClose={() => setAccountOpen(false)}
                  isLoggedIn={auth.loggedIn}
                  isLoading={auth.loading}
                  isMobile={true}
                />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar (Lower Part - Sticky on Scroll) */}
          <div className="md:hidden pb-3 px-1">
            <form action="/search" method="GET" className="relative group">
              <div
                className={`
                    absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full 
                    ${searchFocus ? "bg-indigo-100 text-indigo-600" : "bg-transparent text-slate-400"}
                    transition-colors duration-300
                `}
              >
                <Search className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                name="q"
                placeholder={
                  isScrolled ? "Search..." : "Search products & suppliers..."
                }
                className={`
                    w-full pl-12 pr-4 py-3 rounded-2xl text-sm 
                    transition-all duration-300
                    ${
                      isScrolled
                        ? "bg-white shadow-lg border-transparent ring-1 ring-black/5"
                        : "bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:shadow-md"
                    }
                `}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
              />
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar (Premium Drawer) */}
      {portalReady &&
        mobileOpen &&
        createPortal(
          <div className="fixed inset-0 z-[70] md:hidden font-sans">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500"
              onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar Sheet */}
            <div className="absolute inset-y-2 left-2 w-[85%] max-w-[320px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-slide-in-spring">
              {/* Decorative Header Background */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />

              {/* Header */}
              <div className="relative flex items-center justify-between p-5 border-b border-gray-100">
                <Image
                  width={110}
                  height={36}
                  src="/logo/logo-s-2.png"
                  alt="Logo"
                  className="h-8 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 bg-gray-50 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {/* Profile Card */}
                {!auth.loading && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {auth.loggedIn ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold shadow-inner">
                          {(auth.user?.name?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {auth.user?.name || "User"}
                          </p>
                          <Link
                            href="/myaccount/profile"
                            onClick={() => setMobileOpen(false)}
                            className="text-xs text-indigo-600 font-medium hover:underline"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <p className="text-sm text-slate-500">
                          Welcome! Please sign in.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            href="/login"
                            onClick={() => setMobileOpen(false)}
                            className="py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold shadow-sm text-slate-700"
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/signup"
                            onClick={() => setMobileOpen(false)}
                            className="py-2 rounded-lg bg-indigo-600 text-sm font-semibold shadow-md shadow-indigo-200 text-white"
                          >
                            Join Free
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Actions */}
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setShowPostReq(true);
                    }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-white/20 rounded-lg">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm">
                        Post Buy Requirement
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-80" />
                  </button>

                  <Link
                    href="/seller"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                        <Store className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm text-slate-700">
                        Sell on Platform
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Navigation Menu */}
                <div className="space-y-1">
                  <p className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Explore
                  </p>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <MobileMenuLink
                      href="/"
                      icon={Store}
                      label="Home"
                      onClick={() => setMobileOpen(false)}
                    />
                    {/* Divider */} <div className="h-px bg-gray-50 mx-4" />
                    <MobileMenuLink
                      href="/cart"
                      icon={ShoppingCart}
                      label="Cart"
                      onClick={() => setMobileOpen(false)}
                    />
                    {/* Divider */} <div className="h-px bg-gray-50 mx-4" />
                    <MobileMenuLink
                      href="/myaccount/message-center"
                      icon={MessageSquare}
                      label="Messages"
                      onClick={() => setMobileOpen(false)}
                    />
                    {/* Divider */} <div className="h-px bg-gray-50 mx-4" />
                    <MobileMenuLink
                      href="/myaccount/orders"
                      icon={Package}
                      label="My Orders"
                      onClick={() => setMobileOpen(false)}
                    />
                  </div>
                </div>

                {/* Account Links (Only if logged in) */}
                {auth.loggedIn && (
                  <div className="space-y-1">
                    <p className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      My Activity
                    </p>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <MobileMenuLink
                        href="/myaccount/rfqs"
                        icon={List}
                        label="My Buy Leads"
                        onClick={() => setMobileOpen(false)}
                      />
                      <div className="h-px bg-gray-50 mx-4" />
                      <MobileMenuLink
                        href="/myaccount/favs"
                        icon={Heart}
                        label="Favourites"
                        onClick={() => setMobileOpen(false)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  © 2026 B2B Platform
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <PostRequirementFormDialog
        open={showPostReq}
        onClose={() => setShowPostReq(false)}
      />

      <style jsx global>{`
        @keyframes slide-in-spring {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-spring {
          animation: slide-in-spring 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
      `}</style>
    </>
  );
}

// Subcomponents

function NavLink({ href, icon: Icon, label, count }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all duration-300 relative"
    >
      <div className="relative">
        <Icon
          className="w-5 h-5 mb-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
          strokeWidth={1.5}
        />
        {count > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
            {count}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </Link>
  );
}

function MobileMenuLink({ href, icon: Icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
    >
      <Icon
        className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors"
        strokeWidth={1.5}
      />
      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
        {label}
      </span>
      <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-indigo-400" />
    </Link>
  );
}
