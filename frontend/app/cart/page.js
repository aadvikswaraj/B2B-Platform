'use client';
import { useState, useMemo } from 'react';
import CartSupplierGroup from '@/components/buyer/cart/CartSupplierGroup';
import CartSummary from '@/components/buyer/cart/CartSummary';
import Navbar from '@/components/buyer/Navbar';

export default function Cart() {
  // Modern cart layout (restored). TODO: Replace mock data with backend fetch.
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

  // Update quantity while respecting the minimum order quantity
  const handleQuantityChange = (supplierId, itemId, newQuantity) => {
    setCartItems(prevItems => prevItems.map(supplier => (
      supplier.supplierId === supplierId
        ? {
            ...supplier,
            items: supplier.items.map(item =>
              item.id === itemId
                ? { ...item, quantity: Math.max(item.minOrder, newQuantity) }
                : item
            )
          }
        : supplier
    )));
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
    setCartItems(prevItems => prevItems.map(supplier => (
      supplier.supplierId === supplierId
        ? { ...supplier, items: supplier.items.map(item => ({ ...item, selected })) }
        : supplier
    )));
  };

  // (Global bulk actions removed per request; per-supplier selection retained.)

  const handleRemoveItem = (supplierId, itemId) => {
    setCartItems(prevItems =>
      prevItems.map(supplier => ({
        ...supplier,
        items: supplier.items.filter(item => item.id !== itemId)
      })).filter(supplier => supplier.items.length > 0)
    );
  };

  const selectedItems = useMemo(() => (
    cartItems.flatMap(s => s.items.filter(i => i.selected))
  ), [cartItems]);

  const totalSelectedQuantity = useMemo(() => selectedItems.reduce((sum, i) => sum + i.quantity, 0), [selectedItems]);
  const totalSelectedValue = useMemo(() => selectedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0), [selectedItems]);

  // Derived selection states (unused globally now but kept for possible future UX)
  const allSelected = cartItems.length > 0 && cartItems.every(s => s.items.every(i => i.selected));
  const someSelected = selectedItems.length > 0 && !allSelected;

  // Checkout handler placeholder
  const handleCheckout = () => {
    alert('Checkout: ' + selectedItems.length + ' item(s)');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6 lg:py-10">
          {/* Header (progress tracker removed per request; global action buttons previously removed) */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Shopping Cart</h1>
            <p className="text-xs text-slate-500 mt-1">
              {cartItems.length === 0 ? 'Your cart is empty' : `${selectedItems.length} selected / ${cartItems.reduce((s, sup) => s + sup.items.length, 0)} total items`}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              {cartItems.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 backdrop-blur-sm p-10 text-center">
                  <p className="text-sm text-slate-500">No items yet. Continue browsing products.</p>
                </div>
              )}
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
              <div className="lg:sticky lg:top-6 space-y-4">
                <CartSummary selectedItems={selectedItems} />
                {/* Metrics card removed per request */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      {selectedItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Selected</span>
            <span className="text-sm font-semibold text-slate-800">{selectedItems.length} • ${totalSelectedValue.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Checkout
          </button>
        </div>
      )}
    </>
  );
}
