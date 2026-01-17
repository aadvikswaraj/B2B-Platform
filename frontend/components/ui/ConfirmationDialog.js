"use client";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";

// Icons for different variants
const ICONS = {
  danger: ExclamationTriangleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
  primary: InformationCircleIcon, // Default icon for basic/primary
};

const COLORS = {
  danger: "text-rose-600",
  warning: "text-amber-600",
  info: "text-blue-600",
  primary: "text-indigo-600",
};

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "basic", // 'basic', 'danger', 'verification'
  variant: propVariant, // optional override
  verificationText: propVerificationText, // optional override
  loading = false,
  trigger,
}) {
  const [mounted, setMounted] = useState(false);
  const [typedVerification, setTypedVerification] = useState("");

  // Determine configuration based on type
  const config = useMemo(() => {
    switch (type) {
      case "danger":
        return { variant: "danger", verificationText: null };
      case "verification":
        return { variant: "danger", verificationText: "DELETE" }; // Default to DELETE but can override
      case "basic":
      default:
        return { variant: "primary", verificationText: null };
    }
  }, [type]);

  // Props override defaults
  const variant = propVariant || config.variant;
  const verificationText =
    propVerificationText !== undefined
      ? propVerificationText
      : config.verificationText;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setTypedVerification("");
    }
  }, [open]);

  const canConfirm = useMemo(() => {
    if (loading) return false;
    if (verificationText) {
      return typedVerification === verificationText;
    }
    return true;
  }, [loading, verificationText, typedVerification]);

  if (!mounted) return null;

  // Ideally trigger handling would go here if we were wrapping the button,
  // but for now we follow the existing pattern of controlled components (open/onClose passed in).

  if (!open) return null;

  const Icon = ICONS[variant] || ICONS.danger;
  const iconColor = COLORS[variant] || COLORS.danger;

  return createPortal(
    <div className="fixed inset-0 z-[200]">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={loading ? undefined : onClose}
      />
      <div className="absolute inset-0 z-[201] flex items-end sm:items-center sm:justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="w-full sm:max-w-lg rounded-xl bg-white shadow-2xl ring-1 ring-black/5 flex flex-col transform transition-all">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div
                className={clsx(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-50",
                  iconColor
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {title}
                </h3>
                {description && (
                  <div className="mt-2 text-sm text-gray-500">
                    {description}
                  </div>
                )}
                {children && <div className="mt-4">{children}</div>}

                {verificationText && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type{" "}
                      <span className="font-bold select-all">
                        {verificationText}
                      </span>{" "}
                      to confirm
                    </label>
                    <input
                      type="text"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      value={typedVerification}
                      onChange={(e) => setTypedVerification(e.target.value)}
                      placeholder={verificationText}
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-5 py-4 bg-gray-50 rounded-b-xl flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === "danger" ? "danger" : "primary"}
              onClick={onConfirm}
              disabled={!canConfirm}
              loading={loading}
              className="w-full sm:w-auto"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
