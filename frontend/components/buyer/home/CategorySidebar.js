import React from "react";
import Link from "next/link";
import { BiCategory } from "react-icons/bi";
import {
  GiSewingMachine,
  GiCircuitry,
  GiClothes,
  GiChemicalDrop,
  GiLipstick,
  GiRunningShoe,
  GiProcessor,
} from "react-icons/gi";
import { MdOutlineAgriculture } from "react-icons/md";
import { IoMdBicycle } from "react-icons/io";

const CATEGORIES = [
  { name: "Machinery", icon: <GiSewingMachine /> },
  { name: "Consumer Electronics", icon: <GiCircuitry /> },
  { name: "Apparel & Accessories", icon: <GiClothes /> },
  { name: "Home & Garden", icon: <IoMdBicycle /> }, // best match I could find quickly
  { name: "Beauty & Personal Care", icon: <GiLipstick /> },
  { name: "Chemicals", icon: <GiChemicalDrop /> },
  { name: "Agriculture", icon: <MdOutlineAgriculture /> },
  { name: "Minerals & Metallurgy", icon: <GiProcessor /> },
];

export default function CategorySidebar() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100/50 h-full py-2 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <BiCategory className="text-gray-500 w-5 h-5" />
        <h3 className="font-semibold text-gray-800 text-sm">Categories</h3>
      </div>
      <ul className="flex-1 overflow-y-auto py-1">
        {CATEGORIES.map((cat) => (
          <li key={cat.name}>
            <Link
              href={`/search?cat=${encodeURIComponent(cat.name)}`}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-indigo-600 hover:font-medium transition-colors group"
            >
              <span className="text-gray-400 group-hover:text-indigo-500 text-lg transition-colors">
                {cat.icon}
              </span>
              <span className="truncate">{cat.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
