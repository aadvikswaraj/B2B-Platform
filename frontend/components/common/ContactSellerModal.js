"use client";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PhoneIcon, EnvelopeIcon, XMarkIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import CatalogAPI from "@/utils/api/catalog";

export default function ContactSellerModal({ isOpen, onClose, sellerId, initialData }) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (isOpen && sellerId && !initialData) {
      setLoading(true);
      CatalogAPI.sellerContact(sellerId)
        .then((resData) => {
             if(resData.success){
                 setData(resData.data);
             } else {
                 setError(resData.message || "Failed to load info");
             }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else if (initialData) {
      setData(initialData);
    }
  }, [isOpen, sellerId, initialData]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "phone") {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-0 text-center sm:items-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full opacity-0 sm:translate-y-0 sm:scale-95"
              enterTo="translate-y-0 opacity-100 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0 opacity-100 sm:scale-100"
              leaveTo="translate-y-full opacity-0 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white text-left shadow-xl transition-all w-full sm:max-w-md">
                <div className="absolute right-4 top-4">
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 pt-10 sm:pt-6">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Seller</h3>
                        <p className="text-gray-500">Get in touch directly with the seller</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-4">{error}</div>
                    ) : (
                        <div className="space-y-4">
                            {/* Seller Name */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-sm text-gray-500 mb-1">Seller Name</div>
                                <div className="font-semibold text-gray-900">{data?.name || data?.companyName || "N/A"}</div>
                            </div>

                            {/* Phone */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                                <div>
                                     <div className="text-sm text-gray-500 mb-1">Phone Number</div>
                                     <div className="font-semibold text-gray-900">{data?.phone || "N/A"}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => copyToClipboard(data?.phone, "phone")}
                                        className="p-2 text-primary-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Copy Phone"
                                    >
                                        {copiedPhone ? <ClipboardDocumentCheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                                <div>
                                     <div className="text-sm text-gray-500 mb-1">Email Address</div>
                                     <div className="font-semibold text-gray-900 break-all">{data?.email || "N/A"}</div>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(data?.email, "email")}
                                    className="p-2 text-primary-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Copy Email"
                                >
                                    {copiedEmail ? <ClipboardDocumentCheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 mt-4 grid grid-cols-1 sm:grid-cols-1 gap-3">
                                <a 
                                    href={`tel:${data?.phone}`} 
                                    className="sm:hidden flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all active:scale-[0.98] shadow-lg shadow-green-200"
                                >
                                    <PhoneIcon className="h-5 w-5" />
                                    Call Now
                                </a>
                                
                                <button
                                    onClick={onClose}
                                    className="hidden sm:block w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
