"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/buyer/Navbar";
import { Card, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useAlert } from "@/components/ui/AlertManager";

// New shared components
import CompanyBannerSlider from "@/components/common/CompanyBannerSlider";
import StoreStatCard, {
  StoreStatInline,
} from "@/components/common/StoreStatCard";
import TrustBadges, {
  VerificationStrip,
} from "@/components/common/TrustBadges";
import QuickContactCard from "@/components/common/QuickContactCard";
import ProductShowcase from "@/components/common/ProductShowcase";

import {
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ClockIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  PlayCircleIcon,
  PhotoIcon,
  CubeIcon,
  TruckIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// Tab navigation items
const STORE_TABS = [
  { id: "home", label: "Home", href: "#home" },
  { id: "products", label: "Products", href: null },
  { id: "about", label: "About Us", href: "#about" },
  { id: "gallery", label: "Gallery", href: "#gallery" },
  { id: "contact", label: "Contact", href: "#contact" },
];

function TabNavigation({ companyId, activeTab, onTabChange }) {
  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {STORE_TABS.map((tab) =>
            tab.href ? (
              <a
                key={tab.id}
                href={tab.href}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </a>
            ) : (
              <Link
                key={tab.id}
                href={`/company/${companyId}/products`}
                className="px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                {tab.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </div>
  );
}

function StoreHeader({ company }) {
  return (
    <div className="mb-4 sm:mb-8 animate-fade-in sm:mt-28">
      {/* Main Card */}
      <div className="max-w-7xl mx-auto sm:px-6 mt-4 sm:-mt-24">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden backdrop-blur-xl bg-white/95 supports-[backdrop-filter]:bg-white/80">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row gap-5">
              
              {/* Logo Section */}
              <div className="flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
                 <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 sm:w-32 sm:h-32 rounded-xl border-2 border-white shadow-lg overflow-hidden bg-white">
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified Producer">
                      <ShieldCheckIcon className="w-3 h-3 sm:w-5 sm:h-5" />
                    </div>
                 </div>
                 
                 {/* Mobile Business Name (shown next to logo on mobile) */}
                 <div className="sm:hidden flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-gray-900 leading-snug truncate">
                      {company.name}
                    </h1>
                     <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                        {company.businessType}
                      </span>
                      <div className="flex items-center text-xs font-semibold text-amber-500">
                         <StarIconSolid className="w-3.5 h-3.5 mr-0.5" /> 4.9
                      </div>
                    </div>
                 </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0 pt-1">
                {/* Desktop Header & Details */}
                <div className="hidden sm:block">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                             <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {company.name}
                             </h1>
                             <div className="flex items-center gap-3 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">
                                  {company.businessType}
                                </span>
                                <span className="text-gray-300">|</span>
                                <div className="flex items-center text-sm font-medium text-gray-600">
                                   <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                                   {company.location}
                                </div>
                             </div>
                        </div>
                        <div className="flex gap-3">
                             <Button variant="outline" className="h-10 px-4 rounded-lg hover:bg-gray-50 border-gray-200">
                                <GlobeAltIcon className="w-4 h-4 mr-2" /> Website
                             </Button>
                             <Button className="h-10 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all active:scale-95">
                                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" /> One-Click Contact
                             </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Extra Details & Actions */}
                <div className="sm:hidden space-y-4">
                   {/* Info Grid */}
                   <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-indigo-400" />
                        <span className="truncate">{company.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
                        <span>{company.yearsInBusiness} Years Exp.</span>
                      </div>
                       <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                        <span>Verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <CubeIcon className="w-4 h-4 text-indigo-400" />
                         <span>Manufacturer</span>
                      </div>
                   </div>

                   {/* Mobile Actions */}
                   <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="w-full justify-center h-10 border-gray-200 text-sm">
                         Visit Site
                      </Button>
                      <Button className="w-full justify-center h-10 bg-indigo-600 text-white shadow-md text-sm">
                         Contact
                      </Button>
                   </div>
                </div>

                {/* Desktop Trust Badges & Stats */}
                <div className="hidden sm:flex mt-6 items-center gap-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-700 group cursor-help">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                         <ShieldCheckIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Verified Supplier</p>
                        <p className="text-xs text-gray-500">Business license checked</p>
                      </div>
                    </div>
                     <div className="flex items-center gap-2 text-sm text-gray-700 group cursor-help">
                      <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                         <StarIconSolid className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">4.9/5.0 Rating</p>
                        <p className="text-xs text-gray-500">From 120+ reviews</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 group cursor-help">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                         <ClockIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Fast Response</p>
                        <p className="text-xs text-gray-500">Avg. time &lt; 24h</p>
                      </div>
                    </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ metrics }) {
  const stats = [
    {
      icon: ClockIcon,
      label: "Response Time",
      value: metrics?.responseTime || "≤24h",
    },
    {
      icon: TruckIcon,
      label: "On-time Delivery",
      value: metrics?.onTimeDelivery || "98%",
    },
    {
      icon: StarIconSolid,
      label: "Transaction Level",
      value: metrics?.transactionLevel || "Diamond",
    },
    {
      icon: CubeIcon,
      label: "Transactions",
      value: metrics?.transactions || "1,250+",
    },
    {
      icon: CalendarDaysIcon,
      label: "Years in Business",
      value: metrics?.yearsInBusiness ? `${metrics.yearsInBusiness}+` : "8+",
    },
    {
      icon: UserGroupIcon,
      label: "Employees",
      value: metrics?.employees || "200+",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, index) => (
        <StoreStatCard
          key={index}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          size="sm"
          variant={index === 2 ? "gradient" : "default"}
        />
      ))}
    </div>
  );
}

function GallerySection({ images = [] }) {
  const defaultImages = [
    "/product-image.jpg",
    "/product-image.jpg",
    "/product-image.jpg",
    "/product-image.jpg",
  ];
  const displayImages = images.length > 0 ? images : defaultImages;

  return (
    <section id="gallery" className="scroll-mt-24">
      <Card>
        <CardHeader title="Factory & Showroom" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {displayImages.slice(0, 4).map((img, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
            >
              <img
                src={typeof img === "string" ? img : img.src}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
        {displayImages.length > 4 && (
          <div className="mt-3 text-center">
            <Button variant="outline" size="sm">
              <PhotoIcon className="h-4 w-4 mr-1" />
              View All ({displayImages.length} photos)
            </Button>
          </div>
        )}
      </Card>
    </section>
  );
}

function AboutSection({ company }) {
  const capabilities = [
    { label: "OEM/ODM Capability", available: true },
    { label: "In-house QA Lab", available: true },
    { label: "Global Export Experience", available: true },
    { label: "Flexible MOQ", available: true },
  ];

  return (
    <section id="about" className="scroll-mt-24">
      <Card>
        <CardHeader title="About the Company" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              {company.description}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              We focus on reliable quality, timely deliveries, and tailored
              OEM/ODM solutions for global clients.
            </p>

            {/* Capabilities */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {capabilities.map((cap, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <ShieldCheckIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-700">
                    {cap.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Details */}
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500">Business Type</div>
              <div className="font-medium text-gray-900">
                {company.businessType}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500">Years in Business</div>
              <div className="font-medium text-gray-900">
                {company.yearsInBusiness}+ years
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500">Certifications</div>
              <div className="font-medium text-gray-900">
                {company.metrics?.certifications?.join(", ")}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500">Main Markets</div>
              <div className="font-medium text-gray-900">
                North America, Europe, Asia
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

function ContactSection({ company, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (!formData.name.trim()) e.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Invalid email";
    if (formData.message.trim().length < 10) e.message = "Min 10 chars";
    return e;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;
    setSubmitting(true);
    try {
      await onSubmit?.(formData);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="scroll-mt-24">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Send Inquiry" />
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 555 123 4567"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Message *
              </label>
              <Textarea
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Describe your requirements, quantity, destination..."
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button
                type="submit"
                disabled={Object.keys(errors).length > 0 || submitting}
              >
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Contact Info" />
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-xs text-gray-500 mb-1">Location</div>
              <div className="flex items-center gap-2 text-gray-900">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                {company.location}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Email</div>
              <a
                href="mailto:sales@example.com"
                className="flex items-center gap-2 text-indigo-600 hover:underline"
              >
                <EnvelopeIcon className="h-4 w-4" />
                sales@example.com
              </a>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Phone</div>
              <a
                href="tel:+861234567890"
                className="flex items-center gap-2 text-indigo-600 hover:underline"
              >
                <PhoneIcon className="h-4 w-4" />
                +86 123 456 7890
              </a>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
              <div className="flex items-center gap-2 text-xs text-indigo-700">
                <ClockIcon className="h-4 w-4" />
                We reply within 24 hours on business days
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default function CompanyPage({ params }) {
  const { id } = params;
  const pushAlert = useAlert();
  const [activeTab, setActiveTab] = useState("home");

  // Mock company data
  const company = {
    id,
    name: "Tech Solutions Co., Ltd",
    logo: "https://placehold.co/120x120",
    banners: [
      {
        src: "/product-image.jpg",
        title: "Premium Industrial Equipment",
        subtitle: "Quality manufacturing for global markets",
      },
      {
        src: "/product-image.jpg",
        title: "Advanced Electronics",
        subtitle: "Cutting-edge technology solutions",
      },
      {
        src: "/product-image.jpg",
        title: "Custom OEM Services",
        subtitle: "Tailored products for your brand",
      },
    ],
    location: "Shanghai, China",
    yearsInBusiness: 8,
    businessType: "Manufacturer",
    mainProducts: [
      "Electronics",
      "Gadgets",
      "Accessories",
      "Industrial Components",
    ],
    website: "https://example.com",
    description:
      "We are a leading manufacturer specializing in high-precision electronics and advanced gadgets with global supply capabilities. Our state-of-the-art facilities and experienced team ensure exceptional quality in every product.",
    metrics: {
      responseTime: "≤24h",
      onTimeDelivery: "98%",
      transactionLevel: "Diamond",
      transactions: "1,250+",
      employees: "200+",
      certifications: ["ISO9001", "CE", "RoHS"],
      yearsInBusiness: 8,
    },
    featuredProducts: Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      name: `Premium Product ${i + 1} - High Quality Industrial Component`,
      price: (49 + i * 15).toFixed(2),
      image: "/product-image.jpg",
      moq: "10 units",
      category:
        i % 3 === 0 ? "electronics" : i % 3 === 1 ? "machinery" : "tools",
      badge: i === 0 ? "Hot" : i === 2 ? "New" : null,
    })),
  };

  const handleContactSubmit = async (data) => {
    console.log("CONTACT_SUPPLIER", { companyId: id, ...data });
    pushAlert?.("success", "Message sent! The supplier will respond soon.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Navbar />

      {/* Store Header - At Top */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <StoreHeader company={company} />
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        companyId={id}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Banner Slider - Restored */}
            <div id="home" className="rounded-2xl overflow-hidden shadow-sm">
              <CompanyBannerSlider
                images={company.banners}
                height="h-40 sm:h-52 lg:h-64"
              />
            </div>

            {/* Stats */}
            <StatsGrid metrics={company.metrics} />

            {/* Featured Products */}
            <Card>
              <ProductShowcase
                title="Featured Products"
                products={company.featuredProducts}
                categories={[
                  { key: "all", name: "All" },
                  { key: "electronics", name: "Electronics" },
                  { key: "machinery", name: "Machinery" },
                  { key: "tools", name: "Tools" },
                ]}
                onViewAll={() =>
                  (window.location.href = `/company/${id}/products`)
                }
                onViewProduct={(p) =>
                  (window.location.href = `/product/${p.id}`)
                }
              />
            </Card>

            {/* About */}
            <AboutSection company={company} />

            {/* Gallery */}
            <GallerySection />

            {/* Contact Form */}
            <ContactSection company={company} onSubmit={handleContactSubmit} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            {/* Quick Contact */}
            <QuickContactCard
              companyName={company.name}
              responseTime={company.metrics.responseTime}
              email="sales@example.com"
              phone="+86 123 456 7890"
              onSubmit={handleContactSubmit}
            />

            {/* Assurance Card */}
            <Card>
              <CardHeader title="Buyer Protection" />
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Trade Assurance
                    </div>
                    <div className="text-xs text-gray-500">
                      Secure payments & on-time shipping
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <TruckIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">
                      On-time Delivery
                    </div>
                    <div className="text-xs text-gray-500">
                      {company.metrics.onTimeDelivery} rate guaranteed
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ClockIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Quick Response
                    </div>
                    <div className="text-xs text-gray-500">
                      Replies within {company.metrics.responseTime}
                    </div>
                  </div>
                </li>
              </ul>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader title="Quick Links" />
              <div className="space-y-2">
                <Link
                  href={`/company/${id}/products`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-700">
                    View All Products
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                </Link>
                <a
                  href="#about"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-700">About Company</span>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                </a>
                <a
                  href="#gallery"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-700">Factory Gallery</span>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
