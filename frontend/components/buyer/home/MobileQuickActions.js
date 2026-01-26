import React from "react";
import Link from "next/link";
import { LiaClipboardListSolid } from "react-icons/lia";
import { BiCategory } from "react-icons/bi";
import { AiOutlineMessage, AiOutlineShoppingCart } from "react-icons/ai";

// Enhanced Quick Actions with Glassmorphism and better visual hierarchy
const ACTIONS = [
  {
    label: "Post RFQ",
    icon: <LiaClipboardListSolid />,
    href: "/myaccount/rfqs",
    color: "text-blue-600",
    bg: "bg-blue-50/80 border-blue-100",
  },
  {
    label: "All Categories",
    icon: <BiCategory />,
    href: "/search",
    color: "text-indigo-600",
    bg: "bg-indigo-50/80 border-indigo-100",
  },
  {
    label: "Messages",
    icon: <AiOutlineMessage />,
    href: "/myaccount/message-center",
    color: "text-purple-600",
    bg: "bg-purple-50/80 border-purple-100",
  },
  {
    label: "My Cart",
    icon: <AiOutlineShoppingCart />,
    href: "/cart",
    color: "text-green-600",
    bg: "bg-green-50/80 border-green-100",
  },
];

export default function MobileQuickActions() {
  return (
    <div className="md:hidden py-4 px-4 bg-white/50 backdrop-blur-sm sticky top-[64px] z-40 border-b border-gray-100/50">
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`flex items-center gap-3 p-3 rounded-xl border ${action.bg} shadow-sm active:scale-[0.98] transition-all`}
          >
            <div className={`text-xl ${action.color}`}>{action.icon}</div>
            <span className="text-xs font-semibold text-gray-700 leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
