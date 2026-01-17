"use client";
import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AiOutlineMessage, AiOutlineUser } from "react-icons/ai";
import { LiaClipboardListSolid } from "react-icons/lia";
import { FaRegHeart, FaRegUser } from "react-icons/fa6";
import { MdOutlineSell } from "react-icons/md";

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
export default function AccountDropdown({ isOpen, onClose, isLoggedIn, isLoading = false, align = "right" }) {
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
  className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-[60]`}
      role="menu"
      aria-label="Account menu"
    >
      {isLoading ? (
        <div className="p-4" aria-busy="true" aria-live="polite">
          <div className="flex items-center gap-3 pb-3 border-b">
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
          <div className="mt-3 pt-3 border-t">
            <div className="h-6 w-32 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      ) : isLoggedIn ? (
        <ul className="py-1 text-sm text-gray-700 max-h-[70vh] overflow-auto" role="none">
          <li>
            <Link href="/myaccount/profile" onClick={handleLinkClick} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50" role="menuitem">
              <FaRegUser className="h-4 w-4" /> Profile
            </Link>
          </li>
          <li>
            <Link href="/myaccount/orders" onClick={handleLinkClick} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50" role="menuitem">
              <LiaClipboardListSolid className="h-4 w-4" /> Orders
            </Link>
          </li>
          <li>
            <Link href="/myaccount/message-center" onClick={handleLinkClick} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50" role="menuitem">
              <AiOutlineMessage className="h-4 w-4" /> Messages
            </Link>
          </li>
          <li>
            <Link href="/myaccount/rfqs" onClick={handleLinkClick} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50" role="menuitem">
              <LiaClipboardListSolid className="h-4 w-4" /> Buy Leads
            </Link>
          </li>
          <li>
            <Link href="/myaccount/favs" onClick={handleLinkClick} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50" role="menuitem">
              <FaRegHeart className="h-4 w-4" /> Favourites
            </Link>
          </li>
          <li>
            <Link href="/seller" onClick={handleLinkClick} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50" role="menuitem">
              <MdOutlineSell className="h-4 w-4" /> Sell with Us
            </Link>
          </li>
        </ul>
      ) : (
        <div className="p-4">
          <div className="flex items-center gap-3 pb-3 border-b">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <AiOutlineUser className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Welcome</p>
              <p className="text-xs text-gray-500">Sign in to access your account</p>
            </div>
          </div>
          <div className="pt-3 grid grid-cols-1 gap-2">
            <Link
              href="/login"
              onClick={handleLinkClick}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-semibold hover:bg-indigo-500 transition"
              role="menuitem"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={handleLinkClick}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              role="menuitem"
            >
              Create Account
            </Link>
          </div>
          <div className="mt-3 pt-3 border-t">
            <Link href="/seller" onClick={handleLinkClick} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50" role="menuitem">
              <MdOutlineSell className="h-4 w-4" /> Sell with Us
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
