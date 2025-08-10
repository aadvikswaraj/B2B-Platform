'use client';

import { Tab } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ProductTabs = ({ description, specifications, reviews, supplierInfo }) => {
  return (
    <div className="w-full">
      <Tab.Group>
        <Tab.List className="flex space-x-1 border-b">
          {['Product Details', 'Company Profile', 'Reviews & Ratings', 'Trade History'].map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'py-2.5 px-4 text-sm leading-5 font-medium text-gray-700',
                  'focus:outline-none',
                  selected
                    ? 'border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </Tab.Panel>
          <Tab.Panel className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Company Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Business Type</p>
                  <p className="font-medium">{supplierInfo.businessType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Main Products</p>
                  <p className="font-medium">{supplierInfo.mainProducts}</p>
                </div>
                {/* Add more company details */}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Trade Capacity</h3>
              {/* Add trade capacity information */}
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="space-y-6">
              {/* Product Reviews */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Product Reviews</h3>
                {reviews.product.map((review, idx) => (
                  <div key={idx} className="border-b last:border-0 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
              
              {/* Supplier Reviews */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Supplier Reviews</h3>
                {/* Similar structure to product reviews */}
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Trade History</h3>
              {/* Add trade history information */}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ProductTabs;
