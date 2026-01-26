"use client";
import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageSquare, User, Heart, Store, Package, List } from "lucide-react";

/**
 * AccountDropdown
 *
 * Props:
 * - isOpen: boolean — controls visibility
 * - onClose: () => void — called on outside click or ESC
 * - isLoggedIn: boolean — switches between auth CTAs and account links
 * - isLoading: boolean — shows skeleton placeholders while auth status resolves
 * - align: "left" | "right" (default: right) — dropdown alignment to trigger
 *
 * Accessibility:
 * - Trap closes on ESC
 * - role="menu" list with focusable links/buttons
 *
 * Usage example:
 * <div className="relative">
 *   <button onClick={() => setOpen(o => !o)}>Account</button>
 *   <AccountDropdown isOpen={open} onClose={() => setOpen(false)} isLoggedIn={isLoggedIn} />
 * </div>
 */
export default function AccountDropdown({
  isOpen,
  onClose,
  isLoggedIn,
  isLoading = false,
  align = "right",
}) {
  const panelRef = useRef(null);
  const pathname = usePathname();

  // Close after route changes (covers both Link and programmatic nav)
  useEffect(() => {
    if (!isOpen) return;
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close dropdown shortly after link click without preventing navigation
  const handleLinkClick = () => {
    // Let Next Link handle navigation first, then close dropdown
    setTimeout(() => onClose?.(), 0);
  };

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Close on outside click (use 'click' to avoid racing before Link's own handler)
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(e.target)) return;
      onClose?.();
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 w-72 rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden z-[60] origin-top-right transform transition-all`}
      role="menu"
      aria-label="Account menu"
    >
      {isLoading ? (
        <div className="p-4" aria-busy="true" aria-live="polite">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <span className="inline-block h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
            <div className="min-w-0 flex-1">
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="mt-2 h-2 w-40 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="pt-3 grid grid-cols-1 gap-2">
            <div className="h-9 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-9 rounded-lg bg-gray-100 animate-pulse" />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="h-6 w-32 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      ) : isLoggedIn ? (
        <>
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              My Account
            </p>
          </div>
          <ul
            className="py-2 text-sm text-gray-700 max-h-[70vh] overflow-auto"
            role="none"
          >
            <li>
              <Link
                href="/myaccount/profile"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                role="menuitem"
              >
                <User className="w-4 h-4" strokeWidth={2} /> Profile
              </Link>
            </li>
            <li>
              <Link
                href="/myaccount/orders"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                role="menuitem"
              >
                <Package className="w-4 h-4" strokeWidth={2} /> Orders
              </Link>
            </li>
            <li>
              <Link
                href="/myaccount/message-center"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                role="menuitem"
              >
                <MessageSquare className="w-4 h-4" strokeWidth={2} /> Messages
              </Link>
            </li>
            <li>
              <Link
                href="/myaccount/rfqs"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                role="menuitem"
              >
                <List className="w-4 h-4" strokeWidth={2} /> Buy Leads
              </Link>
            </li>
            <li>
              <Link
                href="/myaccount/favs"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                role="menuitem"
              >
                <Heart className="w-4 h-4" strokeWidth={2} /> Favourites
              </Link>
            </li>
            <li className="mt-2 pt-2 border-t border-gray-100">
              <Link
                href="/seller"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                role="menuitem"
              >
                <Store className="w-4 h-4" strokeWidth={2} /> Sell with Us
              </Link>
            </li>
          </ul>
        </>
      ) : (
        <div className="p-5">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/50">
              <User className="w-6 h-6" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Welcome</p>
              <p className="text-xs text-gray-500">
                Sign in to access your account
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/login"
              onClick={handleLinkClick}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all transform active:scale-95"
              role="menuitem"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={handleLinkClick}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
              role="menuitem"
            >
              Create Account
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href="/seller"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
              role="menuitem"
            >
              <Store className="w-4 h-4" /> Become a Seller
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
