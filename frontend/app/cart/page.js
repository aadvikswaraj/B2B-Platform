"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import CartSupplierGroup from "@/components/buyer/cart/CartSupplierGroup";
import CartSummary from "@/components/buyer/cart/CartSummary";
import Navbar from "@/components/buyer/Navbar";
import { getCart, updateQuantity, removeFromCart } from "@/utils/api/cart";

export default function Cart() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart data
  const fetchCartData = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      if (response && response.success) {
        transformCartData(response.data.cart);
      } else if (response && response.status === 401) {
        // Redirect to login if unauthorized
        router.push("/login?redirect=/cart");
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const transformCartData = (cart) => {
    if (!cart || !cart.items) {
      setCartItems([]);
      return;
    }

    // Group items by supplier
    const supplierMap = new Map();

    cart.items.forEach((cartItem) => {
      if (!cartItem.product) return;

      const product = cartItem.product;
      const seller = product.seller || {
        _id: "unknown",
        name: "Unknown Seller",
      };
      const supplierId = seller._id;

      if (!supplierMap.has(supplierId)) {
        supplierMap.set(supplierId, {
          supplierId,
          supplierName: seller.name,
          supplierLocation: seller.city || "",
          items: [],
        });
      }

      const supplierGroup = supplierMap.get(supplierId);
      supplierGroup.items.push({
        id: product._id,
        name: product.title,
        image: product.image || "https://placehold.co/100x100",
        price: cartItem.unitPrice || 0, // Using calculated unit price from backend
        quantity: cartItem.quantity,
        minOrder: product.minOrderQuantity || 1,
        category: product.category?.name || "Uncategorized",
        specifications: {}, // Backend needs to return specs if needed
        selected: true, // Default selected?
        product: product, // Pass full product for support calculations
      });
    });

    setCartItems(Array.from(supplierMap.values()));
  };

  // Update quantity while respecting the minimum order quantity
  const handleQuantityChange = async (supplierId, itemId, newQuantity) => {
    // Optimistic update
    setCartItems((prevItems) =>
      prevItems.map((supplier) =>
        supplier.supplierId === supplierId
          ? {
              ...supplier,
              items: supplier.items.map((item) =>
                item.id === itemId
                  ? { ...item, quantity: Math.max(item.minOrder, newQuantity) }
                  : item,
              ),
            }
          : supplier,
      ),
    );

    try {
      // Call API
      const response = await updateQuantity(itemId, newQuantity);
      if (!response || !response.success) {
        // Revert on failure (reload cart)
        fetchCartData();
      } else {
        // Optionally update prices if they changed due to slabs
        // For now, simpler to just re-fetch or trust optimistic update if price doesn't change often
        // But price DOES change with quantity (slabs), so re-fetching or re-transforming partial data is better.
        // The backend returns the updated cart in data.cart
        transformCartData(response.data.cart);
      }
    } catch (error) {
      console.error("Update quantity failed", error);
      fetchCartData();
    }
  };

  const handleItemSelect = (supplierId, itemId, selected) => {
    setCartItems((prevItems) =>
      prevItems.map((supplier) => ({
        ...supplier,
        items: supplier.items.map((item) =>
          item.id === itemId ? { ...item, selected } : item,
        ),
      })),
    );
  };

  const handleSelectAllForSupplier = (supplierId, selected) => {
    setCartItems((prevItems) =>
      prevItems.map((supplier) =>
        supplier.supplierId === supplierId
          ? {
              ...supplier,
              items: supplier.items.map((item) => ({ ...item, selected })),
            }
          : supplier,
      ),
    );
  };

  const handleRemoveItem = async (supplierId, itemId) => {
    // Optimistic remove
    setCartItems((prevItems) =>
      prevItems
        .map((supplier) => ({
          ...supplier,
          items: supplier.items.filter((item) => item.id !== itemId),
        }))
        .filter((supplier) => supplier.items.length > 0),
    );

    try {
      const response = await removeFromCart(itemId);
      if (response && response.success) {
        transformCartData(response.data.cart);
      } else {
        fetchCartData(); // Revert
      }
    } catch (e) {
      console.error("Failed to remove item", e);
      fetchCartData();
    }
  };

  // (Global bulk actions removed per request; per-supplier selection retained.)

  const selectedItems = useMemo(
    () => cartItems.flatMap((s) => s.items.filter((i) => i.selected)),
    [cartItems],
  );

  const totalSelectedQuantity = useMemo(
    () => selectedItems.reduce((sum, i) => sum + i.quantity, 0),
    [selectedItems],
  );
  const totalSelectedValue = useMemo(
    () => selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [selectedItems],
  );

  // Derived selection states (unused globally now but kept for possible future UX)
  const allSelected =
    cartItems.length > 0 &&
    cartItems.every((s) => s.items.every((i) => i.selected));
  const someSelected = selectedItems.length > 0 && !allSelected;

  const handleCheckout = async () => {
    if (selectedItems.length === 0) return;

    try {
      setLoading(true);
      const { orderAPI } = await import("@/utils/api/order");

      // Prepare items for order creation
      const itemsToOrder = selectedItems.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      }));

      const response = await orderAPI.create({
        items: itemsToOrder,
        cartCheckout: false, // We are sending specific selected items
      });

      if (response && response.success) {
        // Redirect to shipping with order ID
        router.push(
          `/checkout/shipping?orderId=${response.data.order.readableId}`,
        );
      } else {
        alert(
          "Failed to create order: " + (response?.message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6 lg:py-10">
          {/* Header (progress tracker removed per request; global action buttons previously removed) */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Shopping Cart
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {cartItems.length === 0
                ? "Your cart is empty"
                : `${selectedItems.length} selected / ${cartItems.reduce((s, sup) => s + sup.items.length, 0)} total items`}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              {cartItems.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 backdrop-blur-sm p-10 text-center">
                  <p className="text-sm text-slate-500">
                    No items yet. Continue browsing products.
                  </p>
                </div>
              )}
              {cartItems.map((supplier) => (
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
                <CartSummary
                  selectedItems={selectedItems}
                  cartItems={cartItems}
                  onCheckout={handleCheckout}
                />
                {/* Metrics card removed per request */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Floating Checkout Island */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 lg:hidden pointer-events-none">
          <div className="pointer-events-auto flex items-center justify-between gap-6 bg-slate-900/90 dark:bg-white/95 backdrop-blur-xl text-white dark:text-slate-900 p-2 pl-6 pr-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.25)] border border-white/10 dark:border-slate-200 w-full max-w-md animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                Total
              </span>
              <span className="text-lg font-bold tabular-nums leading-none">
                ${totalSelectedValue.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 py-3 font-semibold text-sm shadow-[0_4px_12px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              Checkout
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">
                {selectedItems.length}
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
