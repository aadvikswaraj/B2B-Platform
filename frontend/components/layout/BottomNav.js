"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  Squares2X2Icon as SquaresSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  UserIcon as UserSolid,
  ShoppingCartIcon as CartSolid,
} from "@heroicons/react/24/solid";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: HomeIcon, activeIcon: HomeSolid },
  {
    label: "Categories",
    href: "/search",
    icon: Squares2X2Icon,
    activeIcon: SquaresSolid,
  },
  {
    label: "Cart",
    href: "/cart",
    icon: ShoppingCartIcon,
    activeIcon: CartSolid,
  },
  {
    label: "Messages",
    href: "/myaccount/message-center",
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatSolid,
  },
  {
    label: "Account",
    href: "/myaccount/profile",
    icon: UserIcon,
    activeIcon: UserSolid,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on admin/seller routes if needed, but for now show everywhere for buyer focus
  if (pathname.startsWith("/admin") || pathname.startsWith("/seller"))
    return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 pb-safe pt-2 z-50 transition-all duration-300">
      <div className="flex justify-around items-center px-2 pb-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${
                isActive
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-transform ${isActive ? "scale-110" : ""}`}
                />
                {item.label === "Messages" && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
                {item.label === "Cart" && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium leading-none ${isActive ? "font-bold" : ""}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
