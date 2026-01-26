"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Image from "next/image";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline"; // Added ExclamationCircleIcon
import Link from "next/link";
import { inquiryAPI } from "@/utils/api/buyer/inquiry"; // Import API

export default function SendInquiryModal({ open, onClose, product }) {
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(
    product?.minOrder ? parseInt(product.minOrder) : 1,
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        product: product.id, // Assuming product object has id or _id
        quantity: parseInt(quantity),
        message: message,
      };

      const response = await inquiryAPI.create(payload);

      if (response.success) {
        console.log("Inquiry sent successfully:", response.data);
        setIsSubmitted(true);
      } else {
        setError(
          response.message || "Failed to send inquiry. Please try again.",
        );
      }
    } catch (err) {
      console.error("Error sending inquiry:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setMessage("");
    setError(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isSubmitted ? "Inquiry Sent" : "Send Inquiry"}
      size="lg"
    >
      {isSubmitted ? (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Inquiry Sent Successfully!
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
              The supplier has received your inquiry and will respond shortly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-sm px-4">
            <Link href="/buyer/messages" className="flex-1">
              {" "}
              {/* Updated Link path if needed, assumed /buyer/messages based on context */}
              <Button className="w-full justify-center">Go to Messages</Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 justify-center"
            >
              Continue Browsing
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Product Details */}
          <div className="md:col-span-5 space-y-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
              {/* Fallback if no images */}
              {(product.images && product.images.length > 0) ||
              product.image ? (
                <Image
                  src={
                    product.images && product.images.length > 0
                      ? typeof product.images[0] === "string"
                        ? product.images[0]
                        : product.images[0]?.url
                      : product.image
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                To:{" "}
                <span className="text-indigo-600 font-medium">
                  {product.supplier?.name}
                </span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-md p-3 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">MOQ:</span>
                <span className="font-medium text-gray-900">
                  {product.minOrder || product.moq}
                </span>{" "}
                {/* Handle both minOrder and moq */}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price:</span>
                <span className="font-medium text-gray-900">
                  {product.prices && product.prices.length > 0
                    ? `$${product.prices[product.prices.length - 1].price} - $${product.prices[0].price}`
                    : product.price && product.price.singlePrice
                      ? `$${product.price.singlePrice}`
                      : "Negotiable"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="md:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm flex items-center gap-2">
                  <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Quantity
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min={product.minOrder || product.moq || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter quantity"
                    required
                  />
                  <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                    Units
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Describe your requirements in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter specific details such as size, color, materials etc.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full justify-center"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Inquiry"}
                </Button>
                <p className="text-[10px] text-center text-gray-400 mt-2">
                  By clicking send, you agree to our Terms of Service.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}
