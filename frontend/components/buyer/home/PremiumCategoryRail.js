import React from "react";
import Link from "next/link";
import {
  GiSewingMachine,
  GiCircuitry,
  GiClothes,
  GiChemicalDrop,
  GiLipstick,
  GiRunningShoe,
  GiProcessor,
  GiSmartphone,
  GiWoodenChair,
} from "react-icons/gi";
import { MdOutlineAgriculture } from "react-icons/md";

// Rich colorful gradients for premium feel
const CATEGORIES = [
  {
    name: "Machinery",
    icon: <GiSewingMachine />,
    gradient: "from-blue-400 to-blue-600",
  },
  {
    name: "Electronics",
    icon: <GiSmartphone />,
    gradient: "from-violet-400 to-violet-600",
  },
  {
    name: "Apparel",
    icon: <GiClothes />,
    gradient: "from-pink-400 to-rose-500",
  },
  {
    name: "Home",
    icon: <GiWoodenChair />,
    gradient: "from-amber-400 to-orange-500",
  },
  { name: "Beauty", icon: <GiLipstick />, gradient: "from-red-400 to-red-600" },
  {
    name: "Chemicals",
    icon: <GiChemicalDrop />,
    gradient: "from-emerald-400 to-teal-600",
  },
  {
    name: "Agri",
    icon: <MdOutlineAgriculture />,
    gradient: "from-lime-400 to-green-600",
  },
  {
    name: "Minerals",
    icon: <GiProcessor />,
    gradient: "from-slate-400 to-slate-600",
  },
];

export default function PremiumCategoryRail() {
  return (
    <section className="py-4 bg-white md:hidden border-b border-gray-100">
      <div className="px-4 mb-2 flex justify-between items-end">
        <h3 className="font-bold text-gray-900 text-sm">Top Categories</h3>
        <Link href="/search" className="text-xs text-indigo-600 font-medium">
          View All
        </Link>
      </div>

      <div className="flex overflow-x-auto px-4 gap-4 pb-2 no-scrollbar snap-x snap-mandatory">
        {CATEGORIES.map((cat, i) => (
          <Link
            key={cat.name}
            href={`/search?cat=${encodeURIComponent(cat.name)}`}
            className="flex flex-col items-center gap-2 min-w-[72px] snap-start"
          >
            {/* Glassmorphic Icon Container */}
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} p-[2px] shadow-sm`}
            >
              <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-[14px] flex items-center justify-center text-2xl text-gray-800 shadow-inner">
                {cat.icon}
              </div>
            </div>

            <span className="text-[11px] font-medium text-gray-700 text-center tracking-tight leading-3">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
