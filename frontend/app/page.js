
import Navbar from "@/components/buyer/Navbar";
import Link from "next/link";
import HomeHero from "@/components/buyer/home/HomeHero";
import IndustrySection from "@/components/buyer/home/IndustrySection";
import JustForYou from "@/components/buyer/home/JustForYou";
import MobileQuickActions from "@/components/buyer/home/MobileQuickActions";
import FeatureHighlighter from "@/components/buyer/home/FeatureHighlighter";
import PremiumCategoryRail from "@/components/buyer/home/PremiumCategoryRail";


// Lazy load form moved to PostRequirementFormWrapper


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB]">
      <Navbar />

      {/* Main Hero Area */}
      <HomeHero />

      {/* Mobile Quick Actions (Mobile Only) */}
      <MobileQuickActions />

      {/* Premium Category Rail (Mobile Only) */}
      <PremiumCategoryRail />

      {/* Platform Features - Verified, Safe, Fast */}
      <FeatureHighlighter />

      {/* Industry Sections */}
      <div className="flex flex-col gap-2 sm:gap-8">
        <IndustrySection
          title="Consumer Electronics"
          bannerImage="https://cdn.d4tcdn.com/staticdt/images/category/electrical.jpg"
          linkHref="/search?cat=Electronics"
        />

        <IndustrySection
          title="Industrial Machinery"
          bannerImage="https://cdn.d4tcdn.com/staticdt/images/category/machinery.jpg"
          linkHref="/search?cat=Machinery"
        />

        <IndustrySection
          title="Apparel & Textiles"
          bannerImage="https://placehold.co/300x600/f3f4f6/333?text=Apparel"
          linkHref="/search?cat=Apparel"
        />
      </div>

      {/* Modern RFQ Callout */}
      <section className="py-12 bg-indigo-900 my-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div className="text-white max-w-2xl text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-4 tracking-tight">
                Need a custom quote?
              </h2>
              <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                One request, multiple quotes. Tell verified suppliers what you
                need and compare signals within 24 hours.
              </p>
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center font-bold">
                    1
                  </div>
                  <span className="text-sm">Submit Request</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center font-bold">
                    2
                  </div>
                  <span className="text-sm">Compare Quotes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center font-bold">
                    3
                  </div>
                  <span className="text-sm">Order Securely</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md transform hover:scale-[1.01] transition-transform duration-300">
              <h3 className="text-gray-900 font-bold mb-4 text-center">
                Post Free Request
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Just For You */}
      <JustForYou />

      {/* Footer */}
      <footer className="mt-auto bg-white border-t pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                Customer Care
              </h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Report Abuse
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Submit a Dispute
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                About Us
              </h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Company Info
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Sitemap
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Investors
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                Buy on Platform
              </h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    All Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Request for Quotation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                Sell on Platform
              </h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Supplier Membership
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Logistics
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} B2B Platform (Global). All rights
              reserved.
            </p>
            <div className="flex gap-4">{/* Social icons could go here */}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
