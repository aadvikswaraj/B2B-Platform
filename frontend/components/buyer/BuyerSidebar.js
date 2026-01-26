"use client";
import React, { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthContext } from "@/context/context";
import {
  UserIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import {
  UserIcon as UserIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  ArrowPathIcon as ArrowPathIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  MapPinIcon as MapPinIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";

const NAVIGATION = [
  {
    name: "My Profile",
    href: "/myaccount/profile",
    icon: UserIcon,
    activeIcon: UserIconSolid,
  },
  {
    name: "Orders",
    href: "/myaccount/orders",
    icon: ShoppingBagIcon,
    activeIcon: ShoppingBagIconSolid,
  },
  {
    name: "Returns & Refunds",
    href: "/myaccount/returns",
    icon: ArrowPathIcon,
    activeIcon: ArrowPathIconSolid,
  },
  {
    name: "Messages",
    href: "/myaccount/message-center",
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatBubbleLeftRightIconSolid,
  },
  {
    name: "Addresses",
    href: "/myaccount/addresses",
    icon: MapPinIcon,
    activeIcon: MapPinIconSolid,
  },
  {
    name: "Wishlist",
    href: "/myaccount/favs",
    icon: HeartIcon,
    activeIcon: HeartIconSolid,
  },
];

export default function BuyerSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);

  // Overlay for mobile
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl p-6 flex flex-col gap-6 animate-slide-in">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
              {user?.name?.[0] || "U"}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.name || "Guest"}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {NAVIGATION.map((item) => {
              const isActive = pathname === item.href;
              const Icon = isActive ? item.activeIcon : item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-black text-white shadow-lg shadow-gray-200"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    );
  }

  // Desktop Sidebar
  return (
    <div className="hidden lg:block w-72 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24 p-6 min-h-[calc(100vh-8rem)]">
        {/* User Summary Widget */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-gray-50 mb-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 p-1 mb-3 ring-2 ring-white shadow-sm">
            <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-2xl">
              {user?.name?.[0] || "U"}
            </div>
          </div>
          <h3 className="font-bold text-gray-900 text-lg">
            {user?.name || "My Account"}
          </h3>
          <p className="text-sm text-gray-400">Buyer Account</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {NAVIGATION.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.activeIcon : item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-black text-white shadow-xl shadow-gray-200 translate-x-1"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
                />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/30" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-50">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm font-medium transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
