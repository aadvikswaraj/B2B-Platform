"use client";
import {
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Modal from "../../ui/Modal";

export default function AddToCartDrawer({
  isOpen,
  onClose,
  product,
  quantity,
  setQuantity,
  onAddToCart,
}) {
  const currentPrice =
    product?.price?.slabs?.findLast((s) => quantity >= s.minQuantity)?.price ||
    product?.price?.slabs?.[0]?.price ||
    product?.price?.singlePrice ||
    0;

  const total = currentPrice * quantity;

  const formatPrice = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Add to Cart"
      mobileMode="drawer"
      size="md"
    >
      <div className="space-y-6">
        {/* Product Summary */}
        <div className="flex gap-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
            <img
              src={product?.images?.[0] || "https://placehold.co/100x100"}
              alt={product?.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {product?.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-indigo-600">
              {formatPrice(currentPrice)}{" "}
              <span className="text-gray-400 font-normal text-xs">/ unit</span>
            </p>
          </div>
        </div>

        {/* Quantity Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Quantity
          </label>

          {/* Reduced Slabs Display for Drawer */}
          {product?.price?.type === "slab" &&
            product?.price?.slabs?.length > 1 && (
              <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {product.price.slabs.map((slab, idx) => {
                    const isActive =
                      quantity >= slab.minQuantity &&
                      (idx === product.price.slabs.length - 1 ||
                        quantity < product.price.slabs[idx + 1].minQuantity);
                    return (
                      <div
                        key={idx}
                        className={`
                                  flex-shrink-0 flex flex-col items-center p-2 rounded-lg border text-xs min-w-[80px]
                                  ${isActive ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500" : "border-gray-200 text-gray-600 bg-gray-50"}
                                `}
                      >
                        <span className="font-medium">{slab.minQuantity}+</span>
                        <span className="font-bold">
                          {formatPrice(slab.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <button
              onClick={() =>
                setQuantity(Math.max(product?.moq || 1, quantity - 1))
              }
              disabled={quantity <= (product?.moq || 1)}
              className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm text-gray-600 active:scale-95 disabled:opacity-50 transition-all"
            >
              <MinusIcon className="h-5 w-5" />
            </button>
            <div className="text-center">
              <span className="block text-xl font-bold text-gray-900">
                {quantity}
              </span>
              <span className="text-[10px] text-gray-500">
                MOQ: {product?.moq}
              </span>
            </div>
            <button
              onClick={() =>
                setQuantity(Math.min(product?.stock || 9999, quantity + 1))
              }
              disabled={quantity >= (product?.stock || 9999)}
              className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm text-gray-600 active:scale-95 disabled:opacity-50 transition-all"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          {/* Add tax calculation logic if needed here from parent */}
          <div className="flex justify-between text-lg font-bold text-indigo-700 border-t border-gray-100 pt-3">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-transparent bg-indigo-600 px-6 py-3.5 text-base font-medium text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-all"
          onClick={() => {
            onAddToCart();
            onClose();
          }}
        >
          <ShoppingCartIcon className="h-5 w-5" />
          Add {quantity} Items to Cart
        </button>
      </div>
    </Modal>
  );
}
