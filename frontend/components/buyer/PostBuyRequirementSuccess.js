"use client";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { CheckCircleIcon, ClockIcon, BellIcon } from "@heroicons/react/24/outline";

export default function PostBuyRequirementSuccess({ open, onClose, requirement }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Requirement Posted Successfully!"
      size="md"
      actions={
        <Button size="sm" onClick={onClose}>Got it</Button>
      }
    >
      <div className="space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-100 p-3">
            <CheckCircleIcon className="h-12 w-12 text-emerald-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            We're Finding Suppliers for You
          </h3>
          <p className="text-sm text-gray-600">
            Your requirement for <span className="font-medium text-gray-900">{requirement?.productName}</span> has been posted successfully.
          </p>
        </div>

        {/* Requirement Summary */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Quantity</span>
            <span className="font-medium text-gray-900">
              {requirement?.quantity} {requirement?.unit}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="text-xs text-gray-600 mb-1">Description</div>
            <p className="text-sm text-gray-900 line-clamp-2">{requirement?.description}</p>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">What happens next?</h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-indigo-100 p-2">
                  <BellIcon className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Suppliers Notified</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  Verified suppliers matching your requirement will be notified immediately.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-indigo-100 p-2">
                  <ClockIcon className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Receive Quotes</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  You'll start receiving quotes within 24-48 hours via email and notifications.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-indigo-100 p-2">
                  <CheckCircleIcon className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Compare & Choose</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  Review quotes, compare prices, and connect with the best suppliers.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700">
          💡 <span className="font-medium">Tip:</span> Check your email and notifications regularly to not miss any quotes from suppliers.
        </div>
      </div>
    </Modal>
  );
}
