import React from "react";
import Link from "next/link";
import ProductCard from "../ProductCard";

export default function IndustrySection({
  title,
  bannerImage,
  products = [],
  linkHref = "/search",
}) {
  // Mock products if empty
  const displayProducts = products.length > 0 ? products : Array(8).fill({});

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-600 rounded-full block"></span>
          {title}
        </h2>
        <Link
          href={linkHref}
          className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
        >
          View Source &rarr;
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Industry Banner (Left) */}
        <div className="lg:w-1/4 relative rounded-xl overflow-hidden min-h-[160px] lg:h-auto group">
          <img
            src={bannerImage || "https://placehold.co/400x800"}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 lg:p-6 flex flex-col justify-end">
            <h3 className="text-white text-xl lg:text-2xl font-bold mb-1 lg:mb-2 leading-tight">
              {title}
            </h3>
            <p className="text-gray-200 text-xs lg:text-sm mb-3 lg:mb-4 line-clamp-2">
              Top selected manufacturers and verified suppliers.
            </p>
            <Link
              href={linkHref}
              className="self-start px-4 py-1.5 lg:px-5 lg:py-2 bg-white text-gray-900 rounded-full text-xs lg:text-sm font-semibold hover:bg-gray-100 transition shadow"
            >
              Source Now
            </Link>
          </div>
        </div>

        {/* Product Grid (Right) */}
        <div className="flex-1 grid grid-flow-col auto-cols-[160px] lg:grid-flow-row lg:grid-cols-4 gap-3 md:gap-4 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {displayProducts.slice(0, 8).map((p, i) => (
            <div key={i} className="h-full">
              <ProductCard {...p} id={`ind-${i}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
