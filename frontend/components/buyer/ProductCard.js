'use client';

import { MdLocalPhone } from "react-icons/md";
import Link from 'next/link';

const ProductCard = ({ featured = false, id = '1' }) => {
  return (
    <Link href={`/product/${id}`} className={`block bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-[1.02] ${
      featured ? 'col-span-full mb-8' : 'col-span-1'
    }`}>
      <div className={`flex ${featured ? 'flex-row' : 'flex-col'}`}>
        {/* Image Section */}
        <div className={`${featured ? 'w-1/3' : 'w-full'} relative`}>
          <img
            src="https://placehold.co/600x400"
            alt="Product"
            className={`w-full h-full object-cover ${featured ? 'h-[400px]' : 'h-[200px]'}`}
          />
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
            New
          </span>
        </div>

        {/* Content Section */}
        <div className={`${featured ? 'w-2/3 p-6' : 'p-4'}`}>
          <h2 className={`font-bold text-gray-800 ${featured ? 'text-2xl mb-4' : 'text-lg mb-2'}`}>
            Product Title
          </h2>
          <p className="text-gray-600 mb-2">$299.99</p>
          <p className={`text-gray-500 ${featured ? 'mb-6' : 'mb-4'} line-clamp-2`}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Tag 1</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Tag 2</span>
          </div>

          {/* Action Buttons */}
          <div className={`flex ${featured ? 'gap-4' : 'gap-2'} flex-wrap`}>
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              <span className={`${featured ? '' : 'hidden sm:inline'}`}>Add to Cart</span>
            </button>
            <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
              <span className={`${featured ? '' : 'hidden sm:inline'}`}>Chat Now</span>
            </button>
            <button className="bg-gray-600 text-white p-2 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
            <MdLocalPhone/>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
