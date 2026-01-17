"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import ImageGallery from "@/components/buyer/product/ImageGallery";
import SupplierCard from "@/components/buyer/product/SupplierCard";
import CostSupportBadges from "@/components/buyer/product/CostSupportBadges";
import QuantityPriceCalculator from "@/components/buyer/product/QuantityPriceCalculator";
import ReviewsSection from "@/components/buyer/product/ReviewsSection";
import Navbar from "@/components/buyer/Navbar";
import Button from "@/components/ui/Button";
import SendInquiryModal from "@/components/buyer/product/SendInquiryModal";
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
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

export default function ProductDetails({ params }) {
  const { id } = params;
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Refs for scroll sections
  const descriptionRef = useRef(null);
  const specificationsRef = useRef(null);
  const reviewsRef = useRef(null);
  const supplierRef = useRef(null);
  const [activeSection, setActiveSection] = useState("description");

  // Mock data
  const productData = {
    id,
    name: "Premium Quality Industrial Widget Pro Max 2024 Edition",
    short:
      "High performance industrial widget engineered with premium alloys for precision manufacturing.",
    images: ["/product-image.jpg", "/product-image.jpg", "/product-image.jpg"],
    video: null,
    price: {
      type: "slab",
      slabs: [
        { minQuantity: 1, price: 2999 },
        { minQuantity: 10, price: 2499 },
        { minQuantity: 50, price: 1999 },
        { minQuantity: 100, price: 1499 },
      ],
      moq: 1,
    },
    moq: 1,
    stock: 5000,
    taxPercent: 18,
    support: {
      freight: {
        type: "slab",
        slabs: [
          { minQty: 10, amount: 500 },
          { minQty: 50, amount: 1000 },
        ],
      },
      paymentFee: {
        type: "slab",
        slabs: [
          { minQty: 50, percent: 50 },
          { minQty: 100, percent: 100 },
        ],
      },
    },
    logistics: {
      dispatchTime: { parcel: { type: "single", days: 3 } },
      originCountry: "India",
    },
    production: { capacity: "10,000 units/month" },
    description: `
      <h3>Product Description</h3>
      <p>Engineered with premium alloys and precision machining for durability and high throughput operations.</p>
      <h4>Key Features</h4>
      <ul>
        <li>High torque efficiency</li>
        <li>Low vibration & noise</li>
        <li>Extended service life 50,000+ hours</li>
        <li>Corrosion-resistant coating</li>
      </ul>
    `,
    specifications: [
      { key: "Material", value: "Stainless Steel 304" },
      { key: "Weight", value: "2.5 kg" },
      { key: "Dimensions", value: "30 × 20 × 15 cm" },
      { key: "Voltage", value: "220V / 380V AC" },
      { key: "Power", value: "500W" },
      { key: "Certification", value: "ISO 9001, CE" },
      { key: "Warranty", value: "2 Years" },
    ],
    reviews: {
      averageRating: 4.6,
      totalReviews: 156,
      items: [
        {
          id: 1,
          rating: 5,
          date: "2025-01-10",
          author: "Rajesh Kumar",
          comment: "Excellent product, exactly as described!",
          verified: true,
          helpfulCount: 24,
        },
        {
          id: 2,
          rating: 4,
          date: "2025-01-05",
          author: "Priya Sharma",
          comment: "Good quality. Minor delay in shipping but satisfied.",
          verified: true,
          helpfulCount: 12,
        },
        {
          id: 3,
          rating: 5,
          date: "2024-12-28",
          author: "Mohammed Ali",
          comment:
            "Best supplier for industrial equipment. Ordering for 2 years.",
          verified: true,
          helpfulCount: 45,
        },
      ],
    },
    supplier: {
      name: "Tech Solutions Pvt. Ltd.",
      logo: "https://placehold.co/100x100",
      location: "Mumbai, India",
      responseTime: "≤2h",
      transactionLevel: "Diamond",
      onTimeDelivery: "98%",
      yearsInBusiness: 12,
      businessType: "Manufacturer",
      mainProducts: "Industrial Machinery, CNC Parts",
      isVerified: true,
    },
  };

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
      label: `Reviews (${productData.reviews.totalReviews})`,
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
      const yOffset = -80;
      const y =
        section.ref.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
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
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex-1">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 flex items-center gap-1 mb-4">
          <a href="/" className="hover:text-indigo-600">
            Home
          </a>
          <span>/</span>
          <a href="/search" className="hover:text-indigo-600">
            Products
          </a>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[150px]">
            {productData.name}
          </span>
        </nav>

        {/* Main Grid: 2 columns on desktop */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Gallery + Content Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Hero Section: Gallery + Basic Info */}
            <div className="grid md:grid-cols-2 gap-4 bg-white rounded-xl border border-gray-100 p-4">
              {/* Gallery */}
              <div>
                <ImageGallery
                  images={productData.images}
                  video={productData.video}
                />
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  {productData.supplier.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 mb-2">
                      <CheckCircleIcon className="h-3 w-3" /> Verified Supplier
                    </span>
                  )}
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">
                    {productData.name}
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    {productData.short}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  {renderStars(productData.reviews.averageRating)}
                  <span className="text-sm font-medium text-gray-700">
                    {productData.reviews.averageRating}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({productData.reviews.totalReviews} reviews)
                  </span>
                </div>

                {/* Quick Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">MOQ</span>
                    <p className="font-semibold text-gray-800">
                      {productData.moq} Units
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">Lead Time</span>
                    <p className="font-semibold text-gray-800">
                      {productData.logistics.dispatchTime.parcel.days} Days
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">Supply</span>
                    <p className="font-semibold text-gray-800">
                      {productData.production.capacity}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">Origin</span>
                    <p className="font-semibold text-gray-800">
                      {productData.logistics.originCountry}
                    </p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-2">
                  {trustBadges.map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center gap-1 text-xs text-gray-600"
                    >
                      <b.icon className={`h-4 w-4 ${b.color}`} />
                      <span>{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Tab Navigation */}
            <div className="sticky top-16 z-20 bg-gray-50 py-2">
              <div className="flex gap-1 p-1 bg-white rounded-lg border border-gray-100 overflow-x-auto no-scrollbar">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors
                      ${
                        activeSection === section.id
                          ? "bg-indigo-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }
                    `}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Sections - Vertical Stack */}
            <div className="space-y-6">
              {/* Description */}
              <section
                ref={descriptionRef}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                  Description
                </h2>
                <div className="prose prose-sm max-w-none text-gray-600">
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
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CubeIcon className="h-5 w-5 text-indigo-600" />
                  Specifications
                </h2>
                <div className="rounded-lg border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {productData.specifications.map((spec, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-4 py-2.5 text-gray-500 font-medium w-1/3">
                            {spec.key}
                          </td>
                          <td className="px-4 py-2.5 text-gray-800">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Reviews */}
              <section
                ref={reviewsRef}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <StarIconOutline className="h-5 w-5 text-indigo-600" />
                  Reviews ({productData.reviews.totalReviews})
                </h2>
                <ReviewsSection
                  reviews={productData.reviews.items}
                  averageRating={productData.reviews.averageRating}
                  totalReviews={productData.reviews.totalReviews}
                />
              </section>

              {/* Supplier */}
              <section
                ref={supplierRef}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BuildingStorefrontIcon className="h-5 w-5 text-indigo-600" />
                  Supplier Profile
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={productData.supplier.logo}
                        alt=""
                        className="h-12 w-12 rounded-lg border"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {productData.supplier.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {productData.supplier.location}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Type:</span>{" "}
                        <span className="font-medium">
                          {productData.supplier.businessType}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Years:</span>{" "}
                        <span className="font-medium">
                          {productData.supplier.yearsInBusiness}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Response:</span>{" "}
                        <span className="font-medium">
                          {productData.supplier.responseTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Delivery:</span>{" "}
                        <span className="font-medium">
                          {productData.supplier.onTimeDelivery}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Main Products</p>
                    <p className="text-sm text-gray-700">
                      {productData.supplier.mainProducts}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Price Calculator + Actions */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Price Calculator */}
              <QuantityPriceCalculator
                price={productData.price}
                moq={productData.moq}
                stock={productData.stock}
                support={productData.support}
                taxPercent={productData.taxPercent}
                onChange={(qty) => setSelectedQuantity(qty)}
              />

              {/* Cost Support */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <CostSupportBadges support={productData.support} />
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <Button
                  size="lg"
                  className="w-full justify-center"
                  onClick={() => setIsInquiryModalOpen(true)}
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  Send Inquiry
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 justify-center">
                    <ShoppingCartIcon className="h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="success" className="px-4">
                    <PhoneIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Supplier Card (Compact) */}
              <SupplierCard supplier={productData.supplier} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar with Price */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 shadow-lg">
        {/* Price Row */}
        <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">Price from</span>
              <p className="text-lg font-bold text-indigo-600">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                }).format(
                  productData.price?.slabs?.[0]?.price ||
                    productData.price?.singlePrice ||
                    0
                )}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">
                Qty: {selectedQuantity}
              </span>
              <p className="text-sm font-semibold text-gray-800">
                Total:{" "}
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                }).format(
                  selectedQuantity *
                    (productData.price?.slabs?.find(
                      (s) => selectedQuantity >= s.minQuantity
                    )?.price ||
                      productData.price?.slabs?.[0]?.price ||
                      productData.price?.singlePrice ||
                      0)
                )}
              </p>
            </div>
          </div>
        </div>
        {/* Actions Row */}
        <div className="p-3 flex items-center gap-2">
          <Button variant="outline" size="sm">
            <PhoneIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <ShoppingCartIcon className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            className="flex-1 justify-center"
            onClick={() => setIsInquiryModalOpen(true)}
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Send Inquiry
          </Button>
        </div>
      </div>

      <SendInquiryModal
        open={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        product={productData}
      />
    </div>
  );
}
