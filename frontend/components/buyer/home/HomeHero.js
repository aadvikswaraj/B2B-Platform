import React from "react";
import CategorySidebar from "./CategorySidebar";
import UserWelcomeWidget from "./UserWelcomeWidget";
// Using the existing slider, but wrapping it
import ImageSlider from "@/components/ImageSlider";

export default function HomeHero() {
  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[400px]">
        {/* Left Sidebar - Hidden on mobile, visible on LG */}
        <div className="hidden lg:block lg:col-span-3 h-full">
          <CategorySidebar />
        </div>

        {/* Center Banner */}
        <div className="col-span-1 lg:col-span-7 h-[200px] lg:h-full relative rounded-lg overflow-hidden shadow-sm bg-gray-100">
          <ImageSlider height="h-full" />
        </div>

        {/* Right Widget - Hidden on mobile/tablet if needed, or stacked */}
        <div className="hidden lg:block lg:col-span-2 h-full">
          <UserWelcomeWidget />
        </div>
      </div>
    </div>
  );
}
