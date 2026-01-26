"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

/**
 * Reusable profile section card component
 * Features: title, description, collapsible on mobile, edit button
 */
export default function ProfileSection({
  title,
  description,
  icon: Icon,
  children,
  collapsible = false,
  defaultOpen = true,
  actions,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section
      className={clsx(
        "rounded-2xl bg-white shadow-sm border border-gray-100",
        "hover:shadow-md transition-shadow duration-200",
        className,
      )}
    >
      {/* Section Header */}
      <div
        className={clsx(
          "flex items-center justify-between gap-3 px-5 py-4 sm:px-6",
          collapsible && "cursor-pointer select-none",
          !isOpen && "border-b-0",
        )}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {title}
            </h3>
            {description && (
              <p className="mt-0.5 text-sm text-gray-500 truncate">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions}
          {collapsible && (
            <ChevronDownIcon
              className={clsx(
                "h-5 w-5 text-gray-400 transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          )}
        </div>
      </div>

      {/* Section Content */}
      <div
        className={clsx(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
          <div className="border-t border-gray-100 pt-5">{children}</div>
        </div>
      </div>
    </section>
  );
}
