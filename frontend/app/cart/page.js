'use client';

import { useState } from 'react';
import CartSupplierGroup from '@/components/buyer/cart/CartSupplierGroup';
import CartSummary from '@/components/buyer/cart/CartSummary';

export default function Cart() {
  // Mock cart data - replace with actual data from your backend
  const [cartItems, setCartItems] = useState([
    {
      supplierId: '1',
      supplierName: 'Tech Solutions Co., Ltd',
      supplierLocation: 'Shanghai, China',
      items: [
        {
          id: '1',
          name: 'Premium Widget Pro Max',
          image: 'https://placehold.co/100x100',
          price: 299.99,
          quantity: 2,
          minOrder: 1,
          specifications: {
            color: 'Blue',
            size: 'Large'
          },
          selected: true,
        },
        {
          id: '2',
          name: 'Advanced Gadget XL',
          image: 'https://placehold.co/100x100',
          price: 199.99,
          quantity: 1,
          minOrder: 5,
          specifications: {
            color: 'Black',
            size: 'Medium'
          },
          selected: true,
        }
      ]
    },
    {
      supplierId: '2',
      supplierName: 'Global Electronics Inc.',
      supplierLocation: 'Shenzhen, China',
      items: [
        {
          id: '3',
          name: 'Smart Device 2000',
          image: 'https://placehold.co/100x100',
          price: 449.99,
          quantity: 1,
          minOrder: 2,
          specifications: {
            color: 'Silver',
            size: 'Standard'
          },
          selected: true,
        }
      ]
    }
  ]);

  const handleQuantityChange = (supplierId, itemId, newQuantity) => {
    setCartItems(prevItems => 
      prevItems.map(supplier => ({
        ...supplier,
        items: supplier.id === supplierId
          ? supplier.items.map(item =>
              item.id === itemId
                ? { ...item, quantity: Math.max(item.minOrder, newQuantity) }
                : item
            )
          : supplier.items
      }))
    );
  };

  const handleItemSelect = (supplierId, itemId, selected) => {
    setCartItems(prevItems =>
      prevItems.map(supplier => ({
        ...supplier,
        items: supplier.items.map(item =>
          item.id === itemId ? { ...item, selected } : item
        )
      }))
    );
  };

  const handleSelectAllForSupplier = (supplierId, selected) => {
    setCartItems(prevItems =>
      prevItems.map(supplier =>
        supplier.id === supplierId
          ? {
              ...supplier,
              items: supplier.items.map(item => ({ ...item, selected }))
            }
          : supplier
      )
    );
  };

  const handleRemoveItem = (supplierId, itemId) => {
    setCartItems(prevItems =>
      prevItems.map(supplier => ({
        ...supplier,
        items: supplier.items.filter(item => item.id !== itemId)
      })).filter(supplier => supplier.items.length > 0)
    );
  };

  const getSelectedItems = () => {
    return cartItems.flatMap(supplier =>
      supplier.items.filter(item => item.selected)
    );
  };

  return (
    <>
      <Navbar/>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {cartItems.map(supplier => (
              <CartSupplierGroup
                key={supplier.supplierId}
                supplier={supplier}
                onQuantityChange={handleQuantityChange}
                onItemSelect={handleItemSelect}
                onSelectAll={handleSelectAllForSupplier}
                onRemoveItem={handleRemoveItem}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-4">
              <CartSummary
                selectedItems={getSelectedItems()}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
