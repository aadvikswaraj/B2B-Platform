"use client";
import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/buyer/Navbar";
import SearchProductCard from "@/components/buyer/search/SearchProductCard";
import SearchFilters from "@/components/buyer/search/SearchFilters";
import { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  FunnelIcon,
  XMarkIcon,
  SparklesIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

// Mock data - will be replaced with API call
const MOCK_PRODUCTS = Array.from({ length: 24 }).map((_, i) => ({
  id: `${i + 1}`,
  _id: `${i + 1}`,
  title: [
    "Industrial CNC Precision Milling Machine Pro",
    "Premium Stainless Steel Pipe 304 Grade",
    "Heavy Duty Industrial Electric Motor 5HP",
    "Solar Panel Monocrystalline 400W Module",
    "Hydraulic Press Machine 100 Ton Capacity",
    "Industrial Chemical Solvent Grade A",
    "Packaging Carton Box Heavy Duty 5-Ply",
    "LED Industrial Light Fixture 200W",
  ][i % 8],
  images: [{ relativePath: "" }],
  price:
    i % 3 === 0
      ? {
          type: "slab",
          slabs: [
            { minQuantity: 1, price: 1500 + i * 100 },
            { minQuantity: 10, price: 1200 + i * 100 },
            { minQuantity: 50, price: 900 + i * 100 },
          ],
        }
      : { type: "single", singlePrice: 999 + i * 50, moq: 1 },
  moq: [1, 5, 10, 20, 50][i % 5],
  support: {
    freight: i % 4 === 0 ? { type: "single", amount: 200 } : null,
    paymentFee: i % 5 === 0 ? { type: "single", percent: 2 } : null,
  },
  logistics: {
    dispatchTime: {
      parcel: { type: "single", days: [3, 5, 7, 10, 14][i % 5] },
    },
  },
  seller: {
    companyName: [
      "Tech Solutions",
      "Global Trade Co",
      "Prime Industries",
      "Star Exports",
      "Sunrise Corp",
    ][i % 5],
  },
  brand: { name: ["BrandA", "BrandB", "BrandC", "Generic"][i % 4] },
  isVerified: i % 3 === 0,
  location: ["Mumbai", "Delhi", "Chennai", "Bangalore", "Pune"][i % 5],
  category: [
    "Machinery",
    "Metals",
    "Electrical",
    "Packaging",
    "Chemicals",
    "Solar",
  ][i % 6],
  rating: 3.5 + Math.random() * 1.5,
  reviewCount: Math.floor(Math.random() * 200),
  soldCount: Math.floor(Math.random() * 5000),
}));

const CATEGORIES = [
  "All",
  "Machinery",
  "Metals",
  "Electrical",
  "Packaging",
  "Chemicals",
  "Solar",
];
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "rating", label: "Best Rating" },
  { value: "newest", label: "Newest First" },
];

export default function SearchPage() {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("relevance");
  const [view, setView] = useState("grid"); // Only used on desktop
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let items = [...MOCK_PRODUCTS];

    // Category filter
    if (category !== "All") {
      items = items.filter((p) => p.category === category);
    }

    // Advanced filters
    if (filters.verified) {
      items = items.filter((p) => p.isVerified);
    }
    if (filters.freeShipping) {
      items = items.filter((p) => p.support?.freight?.amount > 0);
    }
    if (filters.paymentSupport) {
      items = items.filter((p) => p.support?.paymentFee?.percent > 0);
    }
    if (filters.priceMin) {
      items = items.filter((p) => {
        const price = p.price?.singlePrice || p.price?.slabs?.[0]?.price || 0;
        return price >= Number(filters.priceMin);
      });
    }
    if (filters.priceMax) {
      items = items.filter((p) => {
        const price = p.price?.singlePrice || p.price?.slabs?.[0]?.price || 0;
        return price <= Number(filters.priceMax);
      });
    }
    if (filters.moqMax) {
      items = items.filter((p) => p.moq <= filters.moqMax);
    }
    if (filters.minRating) {
      items = items.filter((p) => p.rating >= filters.minRating);
    }

    // Sort
    switch (sort) {
      case "priceLow":
        items.sort((a, b) => {
          const priceA =
            a.price?.singlePrice || a.price?.slabs?.[0]?.price || 0;
          const priceB =
            b.price?.singlePrice || b.price?.slabs?.[0]?.price || 0;
          return priceA - priceB;
        });
        break;
      case "priceHigh":
        items.sort((a, b) => {
          const priceA =
            a.price?.singlePrice || a.price?.slabs?.[0]?.price || 0;
          const priceB =
            b.price?.singlePrice || b.price?.slabs?.[0]?.price || 0;
          return priceB - priceA;
        });
        break;
      case "rating":
        items.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        items.reverse();
        break;
    }

    return items;
  }, [category, sort, filters]);

  const handleAddToCart = (product) => {
    console.log("Add to cart:", product.id);
  };

  const handleInquiry = (product) => {
    console.log("Send inquiry:", product.id);
  };

  const handleCall = (product) => {
    console.log("Call seller:", product.id);
  };

  const resetFilters = () => {
    setFilters({});
    setCategory("All");
    setSort("relevance");
  };

  const activeFilterCount =
    Object.values(filters).filter(Boolean).length +
    (category !== "All" ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
        {/* Top Bar: Categories + Sort + Filter */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {/* Category Pills - Scrollable */}
          <div className="flex gap-2 flex-shrink-0">
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all
                    ${
                      active
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
                    }
                  `}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs border-gray-200 py-1.5"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            {/* View Toggle - Desktop Only */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`p-2 ${
                  view === "grid"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 ${
                  view === "list"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 relative flex-shrink-0"
          >
            <FunnelIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Results Count Bar */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            <strong className="text-gray-900">{filteredProducts.length}</strong>{" "}
            products
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-20 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <SearchFilters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters({})}
                categories={CATEGORIES}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-dashed border-gray-200 bg-white">
                <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No products found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Try adjusting your filters
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile: Always Compact Cards */}
                {isMobile ? (
                  <div className="flex flex-col gap-3">
                    {filteredProducts.map((p) => (
                      <SearchProductCard
                        key={p.id}
                        product={p}
                        variant="compact"
                        onAddToCart={handleAddToCart}
                        onInquiry={handleInquiry}
                        onCall={handleCall}
                      />
                    ))}
                  </div>
                ) : /* Desktop: Grid or List based on toggle */
                view === "grid" ? (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((p) => (
                      <SearchProductCard
                        key={p.id}
                        product={p}
                        variant="grid"
                        onAddToCart={handleAddToCart}
                        onInquiry={handleInquiry}
                        onCall={handleCall}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {filteredProducts.map((p) => (
                      <SearchProductCard
                        key={p.id}
                        product={p}
                        variant="list"
                        onAddToCart={handleAddToCart}
                        onInquiry={handleInquiry}
                        onCall={handleCall}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div className="ml-auto h-full w-80 max-w-[90%] bg-white shadow-2xl flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
              <h2 className="text-base font-semibold text-gray-800">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto">
              {/* Mobile Sort */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Sort By
                </label>
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="mt-2 w-full"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>

              <SearchFilters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters({})}
                categories={CATEGORIES}
              />
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <Button className="flex-1" onClick={() => setShowFilters(false)}>
                Show {filteredProducts.length} Results
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetFilters();
                  setShowFilters(false);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
