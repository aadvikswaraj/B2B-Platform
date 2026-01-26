"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Paperclip,
} from "lucide-react";

const SendInquiryModal = ({ isOpen, onClose, product }) => {
  const [step, setStep] = useState("form"); // 'form' | 'success'
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  // Default/Fallback product data
  const productData = product || {
    name: "Industrial High-Grade Steel Valves",
    image: "/placeholder-product.jpg", // Replace with real placeholder if needed
    sku: "VLV-8829-X",
    moq: 200,
    unit: "pcs",
    sellerName: "Global Steel Works Ltd.",
  };

  const fileInputRef = useRef(null);

  // Auto-generate message when quantity changes or initially
  useEffect(() => {
    if (step === "form" && !message) {
      setMessage(
        `Hi, I'm interested in ${productData.name}. Could you please provide clearer pricing for ${quantity || productData.moq} ${productData.unit}?`,
      );
    }
  }, [productData, quantity, message, step]);

  if (!isOpen) return null;

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    // Allow only numbers
    if (val === "" || /^\d+$/.test(val)) {
      setQuantity(val);
      // Clear error if valid
      if (Number(val) >= productData.moq) {
        setErrors((prev) => ({ ...prev, quantity: null }));
      }
    }
  };

  const handleBlurQuantity = () => {
    if (quantity && Number(quantity) < productData.moq) {
      setErrors((prev) => ({
        ...prev,
        quantity: `Minimum order quantity is ${productData.moq} ${productData.unit}`,
      }));
    }
  };

  const handleChipClick = (text) => {
    setMessage((prev) => (prev ? `${prev}\n${text}` : text));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (newFiles) => {
    if (files.length + newFiles.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }
    // Basic validation could go here
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Basic validation
    const qty = Number(quantity);
    if (!qty || qty < productData.moq) {
      setErrors((prev) => ({
        ...prev,
        quantity: `Minimum order quantity is ${productData.moq} ${productData.unit}`,
      }));
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setStep("success");
    }, 500);
  };

  const resetForm = () => {
    setStep("form");
    setQuantity("");
    setMessage("");
    setFiles([]);
    setErrors({});
    onClose();
  };

  // -- RENDERERS --

  const renderProductInfo = (isMobile = false) => (
    <div
      className={`flex flex-col ${isMobile ? "p-4 border-b bg-gray-50" : "p-6 bg-gray-50 h-full border-r"}`}
    >
      {!isMobile && (
        <div className="relative w-full aspect-square bg-white rounded-lg border overflow-hidden mb-4 flex items-center justify-center">
          {/* Using a div placeholder if no image source for demo */}
          <div className="text-gray-300 text-4xl font-bold">IMG</div>
          {/* <Image src={productData.image} alt={productData.name} fill className="object-cover" /> */}
        </div>
      )}

      <div className={isMobile ? "flex gap-3" : ""}>
        {isMobile && (
          <div className="w-16 h-16 bg-white rounded border flex-shrink-0 flex items-center justify-center text-xs text-gray-300">
            IMG
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 leading-tight mb-1">
            {productData.name}
          </h3>
          {productData.sku && (
            <p className="text-sm text-gray-500 mb-2">SKU: {productData.sku}</p>
          )}
          <p className="text-sm text-gray-600 mb-1">
            Seller:{" "}
            <span className="text-gray-900 font-medium">
              {productData.sellerName}
            </span>
          </p>
          <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
            MOQ: {productData.moq} {productData.unit}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormHTML = () => (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Send Inquiry</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            This is not an order. The seller will reply with price and terms.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <X size={20} />
        </button>
      </div>

      {/* Mobile Header */}
      <div className="sm:hidden flex items-center px-4 py-3 border-b bg-white">
        <button onClick={onClose} className="mr-3 p-1">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Send Inquiry</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Mobile Product Summary */}
        <div className="sm:hidden -mx-4 -mt-4 mb-4">
          {renderProductInfo(true)}
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Quantity <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              onBlur={handleBlurQuantity}
              className={`block w-full rounded-lg border ${errors.quantity ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} pl-4 pr-12 py-2.5 sm:text-sm shadow-sm transition-colors`}
              placeholder={`Min ${productData.moq}`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                {productData.unit}
              </span>
            </div>
          </div>
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" /> {errors.quantity}
            </p>
          )}
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message to Seller
          </label>
          <div className="relative">
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 sm:text-sm shadow-sm resize-none"
            />
          </div>

          {/* Quick Chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Best price?",
              "Bulk order details",
              "Urgent delivery",
              "Long-term partnership",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-transparent hover:border-gray-300"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments{" "}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}
          >
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={(e) =>
                e.target.files && handleFiles(Array.from(e.target.files))
              }
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <div className="p-2 bg-gray-100 rounded-full">
              <Upload size={20} className="text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, JPG, PNG, DOC (Max 5 files)
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded border bg-gray-50"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText
                      size={16}
                      className="text-gray-500 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {(file.size / 1024).toFixed(0)}KB
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1 hover:text-red-500 text-gray-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 border-t bg-white sm:bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0">
        <button
          onClick={onClose}
          className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!quantity || Number(quantity) < productData.moq}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all
                ${
                  !quantity || Number(quantity) < productData.moq
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                }`}
        >
          Send Inquiry
        </button>
      </div>
    </div>
  );

  const renderSuccessHTML = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 size={32} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Sent!</h2>
      <p className="text-gray-500 max-w-sm mb-8">
        The seller <strong>{productData.sellerName}</strong> has received your
        inquiry. They usually respond within 24 hours.
      </p>

      {/* Summary Card */}
      <div className="bg-gray-50 rounded-xl p-4 w-full max-w-sm border mb-8 text-left">
        <div className="flex gap-3 mb-3 pb-3 border-b border-gray-200">
          <div className="w-12 h-12 bg-white rounded border flex-shrink-0 flex items-center justify-center text-[10px] text-gray-300">
            IMG
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-gray-900 truncate">
              {productData.name}
            </p>
            <p className="text-sm text-gray-500">
              {quantity} {productData.unit}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Files attached</span>
          <span className="font-medium text-gray-900 flex items-center gap-1">
            <Paperclip size={14} /> {files.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={resetForm} // For demo purposes, just resets. Real app might nav to 'My Inquiries'
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View My Inquiries
        </button>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
        >
          Continue Browsing
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden sm:flex sm:items-center sm:justify-center">
      {/* Blurred Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`
        relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl 
        bg-white sm:rounded-2xl shadow-2xl flex flex-col sm:flex-row overflow-hidden
        transition-all transform
      `}
      >
        {/* Left Column (Desktop Only) */}
        {step === "form" && (
          <div className="hidden sm:block w-[320px] flex-shrink-0">
            {renderProductInfo()}
          </div>
        )}

        {/* Right Column / Main Content */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          {step === "form" ? renderFormHTML() : renderSuccessHTML()}
        </div>
      </div>
    </div>
  );
};

export default SendInquiryModal;
