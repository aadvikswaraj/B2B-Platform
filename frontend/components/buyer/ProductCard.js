import React from "react";
import Link from "next/link";
import { MdVerified } from "react-icons/md";

// B2B Optimized Product Card
const ProductCard = ({ id = "1", slug, title, price, moq, image, supplier }) => {
  // Mock data fallbacks
  const pTitle = title || "Heavy Duty Industrial Machinery with High Capacity";
  const pPrice = price || "$1,200.00 - $1,500.00";
  const pMinOrder = moq || "1 Set";
  const pImage = image || "https://placehold.co/400x400"; // fallback
  const pSupplier = supplier || "Global Tech Industries";

  const productUrl = slug ? `/${slug}/p/${id}` : `/product/${id}`;

  return (
    <Link
      href={productUrl}
      className="group bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-lg active:scale-[0.98] transition-all duration-200 h-full flex flex-col overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        <img
          src={pImage}
          alt={pTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay Actions (optional for B2B, maybe Quick View) */}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Title */}
        <h3
          className="text-sm text-gray-800 font-medium line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors"
          title={pTitle}
        >
          {pTitle}
        </h3>

        {/* Price & MOQ */}
        <div className="mt-auto">
          <p className="text-base font-bold text-gray-900 leading-tight mb-1">
            {pPrice}
          </p>
          <p className="text-xs text-gray-500 mb-3">{pMinOrder} (Min. Order)</p>

          {/* Supplier Info */}
          <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
            <span className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">
              {pSupplier}
            </span>
            <span className="text-green-500" title="Verified Supplier">
              <MdVerified className="w-3 h-3" />
            </span>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded">
              3 Yrs
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
