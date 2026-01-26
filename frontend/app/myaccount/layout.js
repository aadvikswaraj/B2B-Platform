"use client";
import Navbar from "@/components/buyer/Navbar";
import AccountSubNav from "@/components/buyer/AccountSubNav";

export default function MyAccountLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />

      {/* Sticky Horizontal Navigation */}
      <AccountSubNav />

      {/* Main Content - Full Width */}
      <main className="flex-1 min-h-0 relative">{children}</main>
    </div>
  );
}
