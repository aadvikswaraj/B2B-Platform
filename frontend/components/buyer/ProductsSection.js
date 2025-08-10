'use client';

import ProductCard from './ProductCard';

const ProductsSection = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Featured Product */}
      <ProductCard featured={true} id="featured-1" />
      
      {/* Grid of Regular Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard id="1" />
        <ProductCard id="2" />
        <ProductCard id="3" />
        <ProductCard id="4" />
      </div>
    </div>
  );
};

export default ProductsSection;
