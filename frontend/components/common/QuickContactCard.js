"use client";

import { useState, useMemo } from "react";
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export default function QuickContactCard({
  companyName = "Supplier",
  responseTime = "≤24h",
  workingHours = "Mon–Fri, 9AM–6PM",
  email,
  phone,
  onSubmit,
  className = "",
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (!formData.name.trim()) e.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Invalid email";
    if (formData.message.trim().length < 10) e.message = "Min 10 characters";
    return e;
  }, [formData]);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    try {
      await onSubmit?.(formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4">
        <h3 className="text-lg font-semibold text-white">
          Contact {companyName}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-indigo-100">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            Response: {responseTime}
          </span>
        </div>
      </div>

      {/* Quick Info */}
      <div className="border-b border-gray-100 px-4 py-3 space-y-2">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors"
          >
            <PhoneIcon className="h-4 w-4 text-gray-400" />
            {phone}
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors"
          >
            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
            {email}
          </a>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ClockIcon className="h-4 w-4 text-gray-400" />
          {workingHours}
        </div>
      </div>

      {/* Form or Success */}
      <div className="p-4">
        {submitted ? (
          <div className="text-center py-6">
            <CheckCircleIcon className="h-12 w-12 text-emerald-500 mx-auto" />
            <h4 className="mt-3 font-semibold text-gray-900">Message Sent!</h4>
            <p className="mt-1 text-sm text-gray-500">
              We'll respond within {responseTime}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setSubmitted(false)}
            >
              Send Another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <Input
                placeholder="Phone (optional)"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="text-sm"
              />
            </div>
            <div>
              <Textarea
                placeholder="Describe your requirements, quantity needed, destination... *"
                rows={3}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="text-sm"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!isValid || submitting}
            >
              {submitting ? (
                "Sending..."
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send Inquiry
                </>
              )}
            </Button>
          </form>
        )}
      </div>

      {/* Footer tip */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 flex items-start gap-2">
          <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span>
            Get pricing, samples, and shipping quotes. The more details you
            provide, the faster we can respond.
          </span>
        </p>
      </div>
    </div>
  );
}

// Compact inline contact buttons for mobile
export function ContactButtons({ onContact, onChat, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button onClick={onContact} size="sm" className="flex-1">
        <EnvelopeIcon className="h-4 w-4 mr-1" />
        Contact
      </Button>
      <Button onClick={onChat} variant="outline" size="sm" className="flex-1">
        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
        Chat
      </Button>
    </div>
  );
}
