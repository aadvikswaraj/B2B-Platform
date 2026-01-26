"use client";

import HeroSliderManager from "./HeroSliderManager";
import FeaturedCategoriesManager from "./FeaturedCategoriesManager";

export default function HomepageManager() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <HeroSliderManager />
      </section>

      <section>
        <FeaturedCategoriesManager />
      </section>
    </div>
  );
}
