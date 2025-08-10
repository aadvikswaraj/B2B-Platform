'use client';

import { use } from 'react';
import ImageGallery from '@/components/buyer/product/ImageGallery';
import PriceTable from '@/components/buyer/product/PriceTable';
import ProductTabs from '@/components/buyer/product/ProductTabs';
import SupplierCard from '@/components/buyer/product/SupplierCard';
import Navbar from '@/components/buyer/Navbar';

export default function ProductDetails({ params }) {
  const { id } = use(params);

  // Mock data - replace with actual API call
  const productData = {
    name: "Premium Quality Widget Pro Max",
    images: [
      "/product-image.jpg",
      "/product-image.jpg",
      "/product-image.jpg",
      "/product-image.jpg",
    ],
    video: "https://gv.videocdn.alibaba.com/4f4e1c368ac918af/ef94a2ab9744f48e/20230630_c7b02336d7831cfa_417527018632_mp4_264_hd_unlimit_taobao.mp4?bizCode=icbu_vod_video",
    prices: [
      { minQty: 1, maxQty: 9, price: 299.99 },
      { minQty: 10, maxQty: 49, price: 249.99 },
      { minQty: 50, maxQty: 99, price: 199.99 },
      { minQty: 100, price: 149.99 },
    ],
    description: `
      <h2>Product Description</h2>
      <p>Detailed product description goes here...</p>
      <h3>Features & Benefits</h3>
      <ul>
        <li>Feature 1</li>
        <li>Feature 2</li>
        <li>Feature 3</li>
      </ul>
    `,
    specifications: {
      // Add product specifications
    },
    reviews: {
      product: [
        {
          rating: 5,
          date: "2025-07-15",
          comment: "Excellent product, exactly as described!"
        },
        // Add more reviews
      ],
      supplier: [
        // Add supplier reviews
      ]
    },
    supplier: {
      name: "Tech Solutions Co., Ltd",
      logo: "https://placehold.co/100x100",
      location: "Shanghai, China",
      responseTime: "≤24h",
      transactionLevel: "Diamond",
      onTimeDelivery: "98%",
      yearsInBusiness: 8,
      businessType: "Manufacturer",
      mainProducts: "Electronics, Gadgets, Accessories"
    }
  };

  return (
    <>
      <Navbar/>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-4">
            <ImageGallery 
              images={productData.images}
              video={productData.video}
            />
          </div>

          {/* Middle Column - Product Info */}
          <div className="lg:col-span-5">
            <div className="sticky top-4 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{productData.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <span>4.8★</span>
                  <span>•</span>
                  <span>382 Reviews</span>
                  <span>•</span>
                  <span>2.5K+ Sold</span>
                </div>
              </div>

              <PriceTable prices={productData.prices} />

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Quick Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Min. Order:</span>
                    <span className="ml-2">1 Unit</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Lead Time:</span>
                    <span className="ml-2">7-15 days</span>
                  </div>
                  {/* Add more quick details */}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Supplier Info */}
          <div className="lg:col-span-3">
            <div className="sticky top-4">
              <SupplierCard supplier={productData.supplier} />
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <ProductTabs
            description={productData.description}
            specifications={productData.specifications}
            reviews={productData.reviews}
            supplierInfo={productData.supplier}
          />
        </div>
      </div>
    </>
  );
}
