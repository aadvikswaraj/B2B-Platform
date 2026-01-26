"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/buyer/Navbar";
import { Card, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import TrustBadges from "@/components/common/TrustBadges";
import QuickContactCard from "@/components/common/QuickContactCard";

import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowLeftIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// Product card component
function ProductCard({ product, view = "grid", onContact, onView }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (view === "list") {
    return (
      <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
        {/* Image */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.badge && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
              {product.badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
              {product.name}
            </h3>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <HeartIcon
                className={`h-5 w-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-400"}`}
              />
            </button>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-indigo-600">
              ${product.price}
            </span>
            {product.unit && (
              <span className="text-xs text-gray-500">/{product.unit}</span>
            )}
          </div>

          <div className="mt-1 text-xs text-gray-500">
            {product.moq && <span>MOQ: {product.moq}</span>}
          </div>

          {/* Ratings */}
          <div className="mt-2 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <StarIconSolid
                key={i}
                className={`h-3.5 w-3.5 ${i < 4 ? "text-amber-400" : "text-gray-200"}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">(24 reviews)</span>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(product)}
            >
              View Details
            </Button>
            <Button size="sm" onClick={() => onContact?.(product)}>
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              Inquiry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
            {product.badge}
          </span>
        )}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <HeartIcon
            className={`h-4 w-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-600"}`}
          />
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            onClick={() => onView?.(product)}
            className="transform translate-y-4 group-hover:translate-y-0 transition-transform"
          >
            Quick View
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3
          className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]"
          title={product.name}
        >
          {product.name}
        </h3>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xs text-gray-500">From</span>
          <span className="text-base font-bold text-indigo-600">
            ${product.price}
          </span>
          {product.unit && (
            <span className="text-xs text-gray-400">/{product.unit}</span>
          )}
        </div>

        {product.moq && (
          <div className="mt-1 text-xs text-gray-500">MOQ: {product.moq}</div>
        )}

        {/* Ratings */}
        <div className="mt-2 flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <StarIconSolid
              key={i}
              className={`h-3 w-3 ${i < 4 ? "text-amber-400" : "text-gray-200"}`}
            />
          ))}
          <span className="text-[10px] text-gray-500 ml-1">(24)</span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-1.5">
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

// Category item with expand/collapse
function CategoryItem({ category, isActive, onClick, depth = 0 }) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          onClick(category.key);
          if (hasChildren) setIsExpanded(!isExpanded);
        }}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${
          isActive
            ? "bg-indigo-50 text-indigo-700 font-medium"
            : "text-gray-700 hover:bg-gray-50"
        }`}
        style={{ paddingLeft: `${12 + depth * 12}px` }}
      >
        <span className="flex items-center gap-2">
          {category.name}
          {category.count && (
            <span className="text-xs text-gray-400">({category.count})</span>
          )}
        </span>
        {hasChildren && (
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {category.children.map((child) => (
            <CategoryItem
              key={child.key}
              category={child}
              isActive={isActive}
              onClick={onClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Mobile filter drawer
function MobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onCategoryChange,
  sortValue,
  onSortChange,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Sort */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Sort By</h4>
            <Select
              value={sortValue}
              onChange={onSortChange}
              className="w-full"
            >
              <option value="latest">Latest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </Select>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Categories
            </h4>
            <div className="space-y-1">
              {categories.map((cat) => (
                <CategoryItem
                  key={cat.key}
                  category={cat}
                  isActive={activeCategory === cat.key}
                  onClick={(key) => {
                    onCategoryChange(key);
                    onClose();
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <Button className="w-full" onClick={onClose}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyProductsPage({ params }) {
  const { id } = params;

  // State
  const [activeCat, setActiveCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [view, setView] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Mock company info
  const company = {
    name: "Tech Solutions Co., Ltd",
    logo: "https://placehold.co/60x60",
  };

  // Categories with nested structure
  const categories = [
    { key: "all", name: "All Products", count: 48 },
    {
      key: "electronics",
      name: "Electronics",
      count: 18,
      children: [
        { key: "electronics-controllers", name: "Controllers", count: 8 },
        { key: "electronics-sensors", name: "Sensors", count: 10 },
      ],
    },
    {
      key: "machinery",
      name: "Machinery",
      count: 15,
      children: [
        { key: "machinery-pumps", name: "Pumps", count: 7 },
        { key: "machinery-motors", name: "Motors", count: 8 },
      ],
    },
    { key: "tools", name: "Industrial Tools", count: 10 },
    { key: "accessories", name: "Accessories", count: 5 },
  ];

  // Mock products
  const allProducts = Array.from({ length: 24 }).map((_, i) => ({
    id: i + 1,
    name: `Premium Industrial Component ${i + 1} - High Precision Engineering Part`,
    price: (39 + (i % 6) * 15).toFixed(2),
    image: "/product-image.jpg",
    category:
      i % 4 === 0
        ? "electronics"
        : i % 4 === 1
          ? "machinery"
          : i % 4 === 2
            ? "tools"
            : "accessories",
    moq: `${10 + i * 5} units`,
    unit: "piece",
    badge: i === 0 ? "Hot" : i === 3 ? "New" : i === 7 ? "Sale" : null,
  }));

  // Filter and sort products
  const filtered = useMemo(() => {
    let list = allProducts;

    if (activeCat !== "all") {
      list = list.filter(
        (p) => p.category === activeCat || activeCat.startsWith(p.category),
      );
    }

    if (searchQuery.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (sort === "price-asc") {
      list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    }

    return list;
  }, [activeCat, searchQuery, sort, allProducts]);

  const handleViewProduct = (product) => {
    window.location.href = `/product/${product.id}`;
  };

  const handleContactProduct = (product) => {
    // Could open a modal or scroll to contact form
    console.log("Contact for product:", product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link
              href={`/company/${id}`}
              className="hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Store
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-gray-700">Products</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={company.logo}
                alt={company.name}
                className="w-10 h-10 rounded-lg border bg-white"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {company.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {filtered.length} products
                </p>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9 w-64"
                />
              </div>

              {/* Sort */}
              <Select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="latest">Latest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 transition-colors ${view === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 transition-colors ${view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="lg:hidden mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-9 w-full"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters(true)}
            >
              <FunnelIcon className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {/* Mobile Category Chips - visible only on mobile */}
        <div className="lg:hidden mb-4 -mx-4 px-4">
          <div
            className="flex overflow-x-auto scrollbar-hide gap-2 pb-2"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCat(cat.key)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  activeCat === cat.key
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                {cat.name}
                {cat.count && (
                  <span
                    className={`ml-1 ${activeCat === cat.key ? "text-indigo-200" : "text-gray-400"}`}
                  >
                    ({cat.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader title="Categories" />
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <CategoryItem
                      key={cat.key}
                      category={cat}
                      isActive={activeCat === cat.key}
                      onClick={setActiveCat}
                    />
                  ))}
                </div>
              </Card>

              {/* Quick Contact Sidebar */}
              <QuickContactCard
                companyName={company.name}
                responseTime="≤24h"
                email="sales@example.com"
                phone="+86 123 456 7890"
              />
            </div>
          </aside>

          {/* Product Grid */}
          <section className="lg:col-span-9">
            {/* Active Category Header */}
            {activeCat !== "all" && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">Showing:</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full flex items-center gap-1">
                  {categories.find((c) => c.key === activeCat)?.name ||
                    activeCat}
                  <button
                    onClick={() => setActiveCat("all")}
                    className="ml-1 hover:bg-indigo-100 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setActiveCat("all");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div
                className={
                  view === "grid"
                    ? "grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
                    : "space-y-4"
                }
              >
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    view={view}
                    onView={handleViewProduct}
                    onContact={handleContactProduct}
                  />
                ))}
              </div>
            )}

            {/* Pagination placeholder */}
            {filtered.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, "...", 8].map((page, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        page === 1
                          ? "bg-indigo-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        categories={categories}
        activeCategory={activeCat}
        onCategoryChange={setActiveCat}
        sortValue={sort}
        onSortChange={(e) => setSort(e.target.value)}
      />
    </div>
  );
}
