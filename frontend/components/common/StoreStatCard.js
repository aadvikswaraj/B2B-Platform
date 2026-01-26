"use client";

import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/20/solid";

export default function StoreStatCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  trendDirection,
  variant = "default",
  size = "md",
  className = "",
}) {
  const variants = {
    default: "bg-white border border-gray-100",
    gradient:
      "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100",
    dark: "bg-gray-900 text-white border-gray-800",
    highlight:
      "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100",
  };

  const sizes = {
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const valueSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  };

  const getTrendColor = () => {
    if (trendDirection === "up") return "text-emerald-600";
    if (trendDirection === "down") return "text-rose-600";
    return "text-gray-500";
  };

  return (
    <div
      className={`rounded-xl shadow-sm ${variants[variant]} ${sizes[size]} ${className} transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Label */}
          <p
            className={`text-xs font-medium truncate ${variant === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            {label}
          </p>

          {/* Value */}
          <p
            className={`${valueSizes[size]} font-bold mt-1 ${variant === "dark" ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </p>

          {/* Subtext or Trend */}
          {(subtext || trend) && (
            <div className="flex items-center gap-1 mt-1">
              {trend && (
                <span
                  className={`inline-flex items-center text-xs font-medium ${getTrendColor()}`}
                >
                  {trendDirection === "up" && (
                    <ArrowUpIcon className="h-3 w-3" />
                  )}
                  {trendDirection === "down" && (
                    <ArrowDownIcon className="h-3 w-3" />
                  )}
                  {trend}
                </span>
              )}
              {subtext && (
                <span
                  className={`text-xs ${variant === "dark" ? "text-gray-500" : "text-gray-400"}`}
                >
                  {subtext}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={`flex-shrink-0 p-2 rounded-lg ${
              variant === "dark"
                ? "bg-gray-800"
                : variant === "gradient"
                  ? "bg-indigo-100"
                  : variant === "highlight"
                    ? "bg-amber-100"
                    : "bg-gray-100"
            }`}
          >
            <Icon
              className={`${iconSizes[size]} ${
                variant === "dark"
                  ? "text-gray-300"
                  : variant === "gradient"
                    ? "text-indigo-600"
                    : variant === "highlight"
                      ? "text-amber-600"
                      : "text-gray-600"
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Compact horizontal variant for inline display
export function StoreStatInline({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
      {Icon && <Icon className="h-4 w-4 text-indigo-600 flex-shrink-0" />}
      <span className="text-xs text-gray-500">{label}:</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
