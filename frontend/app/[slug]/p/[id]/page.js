"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import ImageGallery from "@/components/buyer/product/ImageGallery";
import SupplierCard from "@/components/buyer/product/SupplierCard";
import CostSupportBadges from "@/components/buyer/product/CostSupportBadges";
import ReviewsSection from "@/components/buyer/product/ReviewsSection";
import Navbar from "@/components/buyer/Navbar";
import Button from "@/components/ui/Button";
import SendInquiryModal from "@/components/buyer/product/SendInquiryModal";
import PriceSlabsDisplay from "@/components/buyer/product/PriceSlabsDisplay";
import AddToCartDrawer from "@/components/buyer/product/AddToCartDrawer";
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  ShoppingCartIcon,
  PhoneIcon,
  CubeIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  StarIcon as StarIconOutline,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import CatalogAPI from "@/utils/api/catalog";

export default function ProductDetails({ params }) {
  const { id, slug } = params;
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Refs for scroll sections
  const descriptionRef = useRef(null);
  const specificationsRef = useRef(null);
  const reviewsRef = useRef(null);
  const supplierRef = useRef(null);
  const [activeSection, setActiveSection] = useState("description");

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const response = await CatalogAPI.product(id);
        if (response.success) {
          const apiData = response.data;
          
          // Helper to get image URL
          const getImageUrl = (img) => 
            img?.relativePath ? `https://d2j2w287680182.cloudfront.net/${img.relativePath}` : "/placeholder.jpg";

          // Transform API data to component shape
          const transformedData = {
            id: apiData._id,
            name: apiData.title,
            short: apiData.description?.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...", // Strip HTML for short desc
            images: apiData.images?.map(getImageUrl) || [],
            video: null,
            price: apiData.price || { // Fallback if price structure differs
              type: "single",
              singlePrice: 0,
              moq: 1
            },
            moq: apiData.moq || 1,
            stock: 1000, // Mock stock as it might not be in public API
            taxPercent: 18,
            support: apiData.support || {
              freight: { type: "single", amount: 0 },
              paymentFee: { type: "single", percent: 0 }
            },
            logistics: apiData.logistics || {
              dispatchTime: { parcel: { type: "single", days: 7 } },
              originCountry: "India"
            },
            production: apiData.production || { capacity: "N/A" },
            description: apiData.description || "",
            specifications: apiData.specifications || [], // Assuming backend has this, else empty
            reviews: {
              averageRating: 4.5, // Mock reviews
              totalReviews: 12,
              items: [
                {
                  id: 1,
                  rating: 5,
                  date: "2024-01-01",
                  author: "Verified Buyer",
                  comment: "Great product!",
                  verified: true,
                  helpfulCount: 2,
                }
              ],
            },
            supplier: {
              name: apiData.user?.name || apiData.brand?.name || "Supplier",
              logo: "https://placehold.co/100x100",
              location: "India",
              isVerified: true,
              rating: 4.5,
              responseTime: "< 24h",
              businessType: "Manufacturer" 
            },
            category: apiData.category,
            brand: apiData.brand
          };
          setProductData(transformedData);
        } else {
          setError(response.message || "Failed to load product");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Error loading product");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const trustBadges = [
    { icon: ShieldCheckIcon, label: "Secure Trade", color: "text-emerald-600" },
    { icon: TruckIcon, label: "Pan India Shipping", color: "text-blue-600" },
    { icon: ClockIcon, label: "On-time 98%", color: "text-purple-600" },
  ];

  const sections = [
    {
      id: "description",
      label: "Description",
      ref: descriptionRef,
      icon: DocumentTextIcon,
    },
    {
      id: "specifications",
      label: "Specifications",
      ref: specificationsRef,
      icon: CubeIcon,
    },
    {
      id: "reviews",
      label: `Reviews (${productData?.reviews?.totalReviews || 0})`,
      ref: reviewsRef,
      icon: StarIconOutline,
    },
    {
      id: "supplier",
      label: "Supplier",
      ref: supplierRef,
      icon: BuildingStorefrontIcon,
    },
  ];

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section?.ref?.current) {
      const yOffset = -100;
      const y =
        section.ref.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Track active section on scroll
  useEffect(() => {
    if (isLoading || !productData) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref?.current) {
          const top = section.ref.current.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, productData]);

  // Update selected quantity
  useEffect(() => {
    if (productData && selectedQuantity < productData.moq)
      setSelectedQuantity(productData.moq);
  }, [productData?.moq]);

  // Helper: Get Current Unit Price
  const currentUnitPrice = useMemo(() => {
    if (!productData) return 0;
    return (
      productData.price?.slabs?.findLast(
        (s) => selectedQuantity >= s.minQuantity,
      )?.price ||
      productData.price?.slabs?.[0]?.price ||
      productData.price?.singlePrice ||
      0
    );
  }, [selectedQuantity, productData]);

  // Helper: Get Total Price
  const totalPrice = selectedQuantity * currentUnitPrice;

  // Render stars
  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "text-amber-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-indigo-600">Loading product...</div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="text-red-500 font-medium">{error || "Product not found"}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-24 lg:pb-0 font-sans">
      <Navbar />

      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Breadcrumb - using slug if available or just name */}
        <nav className="hidden lg:flex text-xs text-gray-500 items-center gap-1 mb-6">
          <a href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </a>
          <span>/</span>
          <a href="/search" className="hover:text-indigo-600 transition-colors">
            Products
          </a>
          <span>/</span>
          {productData.category && (
            <>
              <a href={`/search?category=${productData.category.slug}`} className="hover:text-indigo-600 transition-colors">
                {productData.category.name}
              </a>
              <span>/</span>
            </>
          )}
          <span className="text-gray-700 truncate max-w-[200px] font-medium">
            {productData.name}
          </span>
        </nav>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ==================== LEFT COLUMN (Main Content) ==================== */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Hero Section: Gallery + Basic Info */}
            <div className="grid md:grid-cols-2 gap-6 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              {/* Gallery */}
              <div className="rounded-lg overflow-hidden">
                <ImageGallery
                  images={productData.images}
                  video={productData.video}
                />
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                {/* Title & Verified */}
                <div>
                  {productData.supplier.isVerified && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
                      <CheckCircleIcon className="h-3.5 w-3.5" /> Verified
                      Supplier
                    </span>
                  )}
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug tracking-tight">
                    {productData.name}
                  </h1>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {productData.short}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 pt-1">
                  {renderStars(productData.reviews.averageRating)}
                  <span className="text-sm font-semibold text-gray-900">
                    {productData.reviews.averageRating}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({productData.reviews.totalReviews} reviews)
                  </span>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-gray-500 block mb-0.5">
                      Min Order
                    </span>
                    <p className="font-bold text-gray-900 text-sm">
                      {productData.moq} Units
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-gray-500 block mb-0.5">
                      Lead Time
                    </span>
                    <p className="font-bold text-gray-900 text-sm">
                      {productData.logistics.dispatchTime?.parcel?.days || 7} Days
                    </p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 border-t border-gray-50">
                  {trustBadges.map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-600"
                    >
                      <b.icon className={`h-4 w-4 ${b.color}`} />
                      <span>{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Cost Support (Moved to Left) */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Shipping & Payment Support
              </h3>
              <CostSupportBadges support={productData.support} />
            </div>

            {/* 4. Tab Navigation (Sticky) */}
            <div className="sticky top-[4.5rem] z-20 bg-gray-50/95 backdrop-blur-sm py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-2 p-1.5 bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-x-auto no-scrollbar scroll-smooth">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                      ${
                        activeSection === section.id
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Detailed Content Sections */}
            <div className="space-y-6">
              {/* Description */}
              <section
                ref={descriptionRef}
                className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 scroll-mt-32 shadow-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6" />
                  </span>
                  Product Description
                </h3>
                <div className="prose prose-indigo prose-sm md:prose-base max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: productData.description,
                    }}
                  />
                </div>
              </section>

              {/* Specifications */}
              <section
                ref={specificationsRef}
                className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 scroll-mt-32 shadow-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <CubeIcon className="h-6 w-6" />
                  </span>
                  Specifications
                </h3>
                {productData.specifications && productData.specifications.length > 0 ? (
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-gray-100">
                        {productData.specifications.map((spec, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 text-gray-500 font-medium w-1/3 bg-gray-50/30 border-r border-gray-50">
                              {spec.key}
                            </td>
                            <td className="px-6 py-4 text-gray-800 font-semibold">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No specifications available</p>
                )}
              </section>

              {/* Reviews */}
              <section
                ref={reviewsRef}
                className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 scroll-mt-32 shadow-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <StarIconOutline className="h-6 w-6" />
                  </span>
                  Customer Reviews
                </h3>
                <ReviewsSection
                  reviews={productData.reviews.items}
                  averageRating={productData.reviews.averageRating}
                  totalReviews={productData.reviews.totalReviews}
                />
              </section>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN (Sticky Action Panel) ==================== */}
          <div className="lg:col-span-4 lg:block hidden">
            <div className="sticky top-24 space-y-6">
              {/* Main Action Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/40 overflow-hidden">
                {/* Price Header */}
                <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                  <p className="text-gray-300 text-xs font-medium mb-1">
                    Total Price (excl. tax)
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(totalPrice)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(currentUnitPrice)}{" "}
                    per unit for {selectedQuantity} units
                  </p>
                </div>

                <div className="p-5 space-y-5">
                  {/* Bulk Pricing Slabs */}
                  <div className="mb-4">
                    <PriceSlabsDisplay price={productData.price} />
                  </div>

                  {/* Quantity Selector + Add to Cart Row */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
                      Quantity
                    </label>
                    <div className="flex gap-3">
                      {/* Qty Input */}
                      <div className="flex items-center border border-gray-300 rounded-xl h-12 w-32 px-1 shadow-sm">
                        <button
                          onClick={() =>
                            setSelectedQuantity(
                              Math.max(productData.moq, selectedQuantity - 1),
                            )
                          }
                          disabled={selectedQuantity <= productData.moq}
                          className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          className="flex-1 w-full text-center border-none focus:ring-0 text-sm font-bold text-gray-900 px-0"
                          value={selectedQuantity}
                          onChange={(e) =>
                            setSelectedQuantity(
                              Math.max(
                                productData.moq,
                                parseInt(e.target.value) || productData.moq,
                              ),
                            )
                          }
                        />
                        <button
                          onClick={() =>
                            setSelectedQuantity(selectedQuantity + 1)
                          }
                          className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        variant="outline"
                        className="flex-1 h-12 flex items-center justify-center gap-2 border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl"
                        onClick={() => setIsDrawerOpen(true)} // Or direct add to cart logic
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <Button
                    size="lg"
                    className="w-full h-12 justify-center font-bold text-base rounded-xl shadow-lg shadow-indigo-200"
                    onClick={() => setIsInquiryModalOpen(true)}
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    Send Inquiry
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                    <span>Generic Secure Transactions</span>
                  </div>
                </div>
              </div>

              {/* Support Badges - REMOVED from here */}

              {/* Supplier Card (Sticky Right) */}
              <SupplierCard
                supplier={productData.supplier}
                hideActions={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE FLOATING ACTIONS ==================== */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe-area">
        <div className="flex items-center p-3 gap-3">
          <Button
            variant="ghost"
            className="flex-col gap-1 h-auto py-1 px-2 text-gray-500 hover:text-indigo-600"
          >
            <PhoneIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">Call</span>
          </Button>

          <div className="flex-1 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11 justify-center rounded-xl border-gray-300 font-semibold text-gray-700"
              onClick={() => setIsInquiryModalOpen(true)}
            >
              Chat
            </Button>
            <Button
              className="h-11 justify-center rounded-xl bg-gray-900 text-white font-bold shadow-lg shadow-gray-900/20"
              onClick={() => setIsDrawerOpen(true)}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE DRAWER ==================== */}
      <AddToCartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        product={productData}
        quantity={selectedQuantity}
        setQuantity={setSelectedQuantity}
        onAddToCart={() => {
          // Implement add to cart logic here
          // toast.success("Added to cart!");
          console.log("Added to cart", selectedQuantity);
        }}
      />

      <SendInquiryModal
        open={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        product={productData}
      />
    </div>
  );
}
