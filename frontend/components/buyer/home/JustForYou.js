import React from "react";
import ProductCard from "../ProductCard";
import SectionHeader from "./SectionHeader";

export default function JustForYou({ products = [] }) {
  const displayProducts = products.length > 0 ? products : Array(12).fill({});

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mb-8">
      <SectionHeader title="Just For You" linkText="See all recommendations" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {displayProducts.map((p, i) => (
          <ProductCard key={i} {...p} id={`jfu-${i}`} />
        ))}
      </div>
    </div>
  );
}
