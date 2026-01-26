"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";

function ProductCard({ product, onContact, onView }) {
  return (
    <div className="group flex-shrink-0 w-[160px] sm:w-[200px] rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {/* Image */}
      <div className="relative h-32 sm:h-40 bg-gray-100 overflow-hidden">
        <img
          src={product.image || "/product-image.jpg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold bg-rose-500 text-white rounded-full">
            {product.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4
          className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]"
          title={product.name}
        >
          {product.name}
        </h4>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xs text-gray-500">From</span>
          <span className="text-sm font-bold text-indigo-600">
            ${product.price}
          </span>
          {product.unit && (
            <span className="text-xs text-gray-400">/{product.unit}</span>
          )}
        </div>
        {product.moq && (
          <div className="mt-1 text-xs text-gray-500">MOQ: {product.moq}</div>
        )}

        {/* Actions */}
        <div className="mt-2 flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs py-1.5"
            onClick={() => onView?.(product)}
          >
            View
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs py-1.5"
            onClick={() => onContact?.(product)}
          >
            Inquiry
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProductShowcase({
  title = "Featured Products",
  products = [],
  categories = [],
  onViewProduct,
  onContactProduct,
  onViewAll,
  showCategoryTabs = true,
  className = "",
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Default products if none provided
  const defaultProducts = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Premium Industrial Component ${i + 1}`,
    price: (49 + i * 10).toFixed(2),
    image: "/product-image.jpg",
    moq: "10 units",
    category: i % 3 === 0 ? "electronics" : i % 3 === 1 ? "machinery" : "tools",
    badge: i === 0 ? "Hot" : i === 2 ? "New" : null,
  }));

  const displayProducts = products.length > 0 ? products : defaultProducts;

  const filteredProducts =
    activeCategory === "all"
      ? displayProducts
      : displayProducts.filter((p) => p.category === activeCategory);

  const defaultCategories = [
    { key: "all", name: "All" },
    { key: "electronics", name: "Electronics" },
    { key: "machinery", name: "Machinery" },
    { key: "tools", name: "Tools" },
  ];

  const displayCategories =
    categories.length > 0 ? categories : defaultCategories;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [filteredProducts]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 220;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        {showCategoryTabs && (
          <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {displayCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Carousel */}
      <div className="relative group">
        {/* Scroll Buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 p-2 rounded-full bg-white shadow-lg border border-gray-100 text-gray-700 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 p-2 rounded-full bg-white shadow-lg border border-gray-100 text-gray-700 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {filteredProducts.map((product) => (
            <div key={product.id} style={{ scrollSnapAlign: "start" }}>
              <ProductCard
                product={product}
                onView={onViewProduct}
                onContact={onContactProduct}
              />
            </div>
          ))}
        </div>
      </div>

      {/* View All Link */}
      {onViewAll && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={onViewAll}>
            View All Products
          </Button>
        </div>
      )}
    </div>
  );
}
