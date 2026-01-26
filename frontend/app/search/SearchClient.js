"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/buyer/Navbar";
import SearchProductCard from "@/components/buyer/search/SearchProductCard";
import SearchFilters from "@/components/buyer/search/SearchFilters";
import { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AddToCartDrawer from "@/components/buyer/product/AddToCartDrawer";
import { addToCart } from "@/utils/api/cart";
import { buildSearchQuery } from "@/utils/api/search";
import SendInquiryModal from "@/components/buyer/product/SendInquiryModal";
import ContactSellerModal from "@/components/common/ContactSellerModal";
import {
  FunnelIcon,
  XMarkIcon,
  SparklesIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest First" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "title", label: "Name: A-Z" },
];

export default function SearchClient({
  products = [],
  categories = [],
  pagination = {},
  searchQuery = {},
}) {
  const router = useRouter();

  const [view, setView] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Add to cart drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Auto-show inquiry modal after 10 seconds if no interaction
  useEffect(() => {
    const timer = setTimeout(() => {
        if (!sessionStorage.getItem("inquiryPopupShown")) {
            // Only show auto popup if strictly needed, but SendInquiryModal requires a product
            // So we might skip auto-popup or generic inquiry for this specific request 
            // since user asked to replace InquiryPopup with SendInquiryModal
            // which usually targets a specific product. 
            // However, sticking to the requirement: "integrate sendinquirymodal"
            // If the modal requires a product, auto-pop up might not make sense without one.
            // But let's keep the hook for now, maybe trigger it for general inquiry if adapted
            // For now, I'll comment out the auto-trigger or let it fail gracefully if no product passed
            // to generic mode if supported, OR just rely on user clicking "Inquiry" on product cards.
            
            // Assuming user intention is to use the modal when clicking buttons.
            sessionStorage.setItem("inquiryPopupShown", "true");
        }
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleAddToCart = (product) => {
    // Ensure compatibility with AddToCartDrawer
    const productForDrawer = {
      ...product,
      images: product.images || (product.image ? [product.image] : []),
      name: product.name || product.title,
      price: product.price
    };
    setSelectedProduct(productForDrawer);
    setQuantity(product.minOrderQuantity || 1);
    setDrawerOpen(true);
  };

  const handleConfirmAddToCart = async () => {
    if (!selectedProduct) return;
    try {
      await addToCart(selectedProduct._id, quantity);
      setDrawerOpen(false);
      alert("Added to cart successfully!");
    } catch(e) {
      console.error("Failed to add to cart", e);
      alert("Failed to add to cart");
    }
  };

  const handleInquiry = (product) => {
    setInquiryProduct({
        ...product,
        name: product.name || product.title,
        images: product.images || [], 
        image: product.image || (product.images?.[0] ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : null),
        minOrder: product.moq || "1",
        prices: product.price?.slabs || [],
        supplier: product.seller || product.supplier
    });
    setShowInquiryModal(true);
  };

  const handleCall = (product) => {
    if (product.seller?._id) {
        setSelectedSellerId(product.seller._id);
        setIsContactModalOpen(true);
    } else {
         // Fallback or attempt to use id directly if seller object isn't populated
         setSelectedSellerId(product.seller || "mock-seller-id");
         setIsContactModalOpen(true);
    }
  };

  // Update URL with new params (triggers server re-fetch)
  const updateParams = (updates) => {
    const newParams = {
      q: searchQuery.q,
      category: searchQuery.category,
      brand: searchQuery.brand,
      minPrice: searchQuery.minPrice,
      maxPrice: searchQuery.maxPrice,
      inStock: searchQuery.inStock,
      sortBy: searchQuery.sortBy,
      page: 1, // Reset page on filter change
      ...updates,
    };
    const queryString = buildSearchQuery(newParams);
    router.push(`/search${queryString ? `?${queryString}` : ""}`);
  };

  const resetFilters = () => {
    router.push("/search");
  };

  // Calculate active filter count
  const activeFilterCount =
    (searchQuery.category ? 1 : 0) +
    (searchQuery.brand ? 1 : 0) +
    (searchQuery.minPrice ? 1 : 0) +
    (searchQuery.maxPrice ? 1 : 0) +
    (searchQuery.inStock ? 1 : 0);

  // Build category list with "All" option
  const categoryOptions = [
    { _id: null, name: "All", slug: "all" },
    ...categories,
  ];

  // Handle filter changes from SearchFilters component
  const handleFilterChange = (newFilters) => {
    updateParams({
      minPrice: newFilters.priceMin || null,
      maxPrice: newFilters.priceMax || null,
      inStock: newFilters.inStock || null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
        {/* Top Bar: Categories + Sort + Filter */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {/* Category Pills - Scrollable */}
          <div className="flex gap-2 flex-shrink-0">
            {categoryOptions.map((cat) => {
              const isActive =
                (!searchQuery.category && !cat._id) ||
                searchQuery.category === cat._id;
              return (
                <button
                  key={cat._id || "all"}
                  onClick={() => updateParams({ category: cat._id })}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all
                    ${
                      isActive
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
                    }
                  `}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Select
              value={searchQuery.sortBy || "relevance"}
              onChange={(e) => updateParams({ sortBy: e.target.value })}
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
            <strong className="text-gray-900">{pagination.totalCount || 0}</strong>{" "}
            products
            {pagination.totalPages > 1 && (
              <span className="ml-2">
                (Page {pagination.page} of {pagination.totalPages})
              </span>
            )}
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
                filters={{
                  priceMin: searchQuery.minPrice,
                  priceMax: searchQuery.maxPrice,
                  inStock: searchQuery.inStock,
                }}
                onChange={handleFilterChange}
                onReset={resetFilters}
                categories={categoryOptions.map((c) => c.name)}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            {products.length === 0 ? (
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
                    {products.map((p) => (
                      <SearchProductCard
                        key={p._id || p.id}
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
                    {products.map((p) => (
                      <SearchProductCard
                        key={p._id || p.id}
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
                    {products.map((p) => (
                      <SearchProductCard
                        key={p._id || p.id}
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
                  value={searchQuery.sortBy || "relevance"}
                  onChange={(e) => updateParams({ sortBy: e.target.value })}
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
                filters={{
                  priceMin: searchQuery.minPrice,
                  priceMax: searchQuery.maxPrice,
                  inStock: searchQuery.inStock,
                }}
                onChange={handleFilterChange}
                onReset={resetFilters}
                categories={categoryOptions.map((c) => c.name)}
              />
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <Button className="flex-1" onClick={() => setShowFilters(false)}>
                Show {pagination.totalCount || 0} Results
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
      
      {/* Add To Cart Drawer */}

      <AddToCartDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={selectedProduct}
        quantity={quantity}
        setQuantity={setQuantity}
        onAddToCart={handleConfirmAddToCart}
      />

      <SendInquiryModal 
        open={showInquiryModal} 
        onClose={() => setShowInquiryModal(false)} 
        product={inquiryProduct}
      />

      <ContactSellerModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        sellerId={selectedSellerId}
      />
      
      {/* Search Inquiry Floating Button (Mobile) - Generic Inquiry Trigger */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
            <button
                onClick={() => {
                    setInquiryProduct({ 
                        name: "General Requirement", 
                        images: [],
                        supplier: { name: "B2B Platform" } 
                    });
                    setShowInquiryModal(true);
                }}
                className="bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-300 hover:bg-blue-700 transition-all active:scale-95"
            >
                <span className="sr-only">Post Requirement</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
            </button>
      </div>
    </div>
  );
}
