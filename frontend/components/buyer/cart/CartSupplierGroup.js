'use client';

import { useState } from 'react';
import { MdDelete } from 'react-icons/md';

const CartSupplierGroup = ({
  supplier,
  onQuantityChange,
  onItemSelect,
  onSelectAll,
  onRemoveItem
}) => {
  const allSelected = supplier.items.every(item => item.selected);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Supplier Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => onSelectAll(supplier.supplierId, e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <div>
          <h3 className="font-semibold">{supplier.supplierName}</h3>
          <p className="text-sm text-gray-500">{supplier.supplierLocation}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y">
        {supplier.items.map(item => (
          <div key={item.id} className="py-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={(e) => onItemSelect(supplier.supplierId, item.id, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              
              {/* Product Image */}
              <div className="w-20 h-20 flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>

              {/* Product Details */}
              <div className="flex-grow">
                <h4 className="font-medium mb-1">{item.name}</h4>
                <div className="text-sm text-gray-500 space-y-1">
                  {Object.entries(item.specifications).map(([key, value]) => (
                    <div key={key}>
                      {key}: <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price and Quantity */}
              <div className="text-right">
                <div className="font-medium mb-2">${item.price.toFixed(2)}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onQuantityChange(supplier.supplierId, item.id, item.quantity - 1)}
                    disabled={item.quantity <= item.minOrder}
                    className="w-8 h-8 flex items-center justify-center border rounded-l hover:bg-gray-50 disabled:opacity-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={item.minOrder}
                    value={item.quantity}
                    onChange={(e) => onQuantityChange(supplier.supplierId, item.id, parseInt(e.target.value) || item.minOrder)}
                    className="w-16 h-8 text-center border-y focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => onQuantityChange(supplier.supplierId, item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-r hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Min. Order: {item.minOrder}
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemoveItem(supplier.supplierId, item.id)}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <MdDelete size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Footer */}
      <div className="flex justify-between items-center pt-4 border-t mt-4">
        <div className="text-sm text-gray-500">
          Shipping: Calculated at checkout
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          Chat with Supplier
        </button>
      </div>
    </div>
  );
};

export default CartSupplierGroup;
