"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const NAVIGATION = [
  { name: "Profile", href: "/myaccount/profile", icon: UserIcon },
  { name: "Orders", href: "/myaccount/orders", icon: ShoppingBagIcon },
  { name: "Returns", href: "/myaccount/returns", icon: ArrowPathIcon },
  {
    name: "Messages",
    href: "/myaccount/message-center",
    icon: ChatBubbleLeftRightIcon,
  },
  { name: "RFQs", href: "/myaccount/rfqs", icon: ClipboardDocumentListIcon },
  { name: "Addresses", href: "/myaccount/addresses", icon: MapPinIcon },
  { name: "Wishlist", href: "/myaccount/favs", icon: HeartIcon },
];

export default function AccountSubNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-[60px] z-30 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar"
          aria-label="Tabs"
        >
          {NAVIGATION.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  whitespace-nowrap py-2.5 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                  ${
                    isActive
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-gray-400"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
