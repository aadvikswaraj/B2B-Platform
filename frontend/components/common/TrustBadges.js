"use client";

import {
  ShieldCheckIcon,
  CheckBadgeIcon,
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  GlobeAltIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

// Predefined badge types
const BADGE_CONFIGS = {
  verified: {
    icon: ShieldCheckIcon,
    label: "Verified Supplier",
    color: "emerald",
    description: "Verified business identity",
  },
  goldSupplier: {
    icon: StarIcon,
    label: "Gold Supplier",
    color: "amber",
    description: "Premium membership",
  },
  tradeAssurance: {
    icon: CheckBadgeIcon,
    label: "Trade Assurance",
    color: "blue",
    description: "Secure payments & shipping",
  },
  onTimeDelivery: {
    icon: TruckIcon,
    label: "On-time Delivery",
    color: "indigo",
    description: "98%+ on-time rate",
  },
  fastResponse: {
    icon: ClockIcon,
    label: "Fast Response",
    color: "violet",
    description: "Replies within 24h",
  },
  securePayments: {
    icon: CurrencyDollarIcon,
    label: "Secure Payments",
    color: "teal",
    description: "Protected transactions",
  },
  iso9001: {
    icon: DocumentCheckIcon,
    label: "ISO 9001",
    color: "slate",
    description: "Quality certified",
  },
  ceCertified: {
    icon: DocumentCheckIcon,
    label: "CE Certified",
    color: "slate",
    description: "European standard",
  },
  globalExporter: {
    icon: GlobeAltIcon,
    label: "Global Exporter",
    color: "sky",
    description: "Ships worldwide",
  },
  manufacturer: {
    icon: BuildingOffice2Icon,
    label: "Manufacturer",
    color: "orange",
    description: "Direct from factory",
  },
};

const colorClasses = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
};

const iconColorClasses = {
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  blue: "text-blue-500",
  indigo: "text-indigo-500",
  violet: "text-violet-500",
  teal: "text-teal-500",
  slate: "text-slate-500",
  sky: "text-sky-500",
  orange: "text-orange-500",
};

// Single badge component
export function TrustBadge({
  type,
  showLabel = true,
  size = "md",
  showDescription = false,
}) {
  const config = BADGE_CONFIGS[type];
  if (!config) return null;

  const Icon = config.icon;
  const sizes = {
    sm: { icon: "h-3.5 w-3.5", text: "text-[10px]", padding: "px-2 py-1" },
    md: { icon: "h-4 w-4", text: "text-xs", padding: "px-2.5 py-1.5" },
    lg: { icon: "h-5 w-5", text: "text-sm", padding: "px-3 py-2" },
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses[config.color]} ${sizes[size].padding} transition-all duration-200 hover:shadow-sm`}
      title={config.description}
    >
      <Icon
        className={`${sizes[size].icon} ${iconColorClasses[config.color]} flex-shrink-0`}
      />
      {showLabel && (
        <span className={`${sizes[size].text} font-medium whitespace-nowrap`}>
          {config.label}
        </span>
      )}
      {showDescription && (
        <span className={`${sizes[size].text} text-gray-500 ml-1`}>
          — {config.description}
        </span>
      )}
    </div>
  );
}

// Badge group component
export default function TrustBadges({
  badges = ["verified", "tradeAssurance", "onTimeDelivery"],
  certifications = [],
  layout = "horizontal", // 'horizontal' | 'vertical' | 'grid'
  size = "md",
  showLabels = true,
  maxVisible = 4,
  className = "",
}) {
  const allBadges = [
    ...badges,
    ...certifications
      .map((cert) => {
        const certLower = cert.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (certLower.includes("iso9001")) return "iso9001";
        if (certLower.includes("ce")) return "ceCertified";
        return null;
      })
      .filter(Boolean),
  ];

  const visibleBadges = allBadges.slice(0, maxVisible);
  const hiddenCount = allBadges.length - maxVisible;

  const layoutClasses = {
    horizontal: "flex flex-wrap items-center gap-2",
    vertical: "flex flex-col gap-2",
    grid: "grid grid-cols-2 gap-2",
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {visibleBadges.map((badge, index) => (
        <TrustBadge
          key={`${badge}-${index}`}
          type={badge}
          size={size}
          showLabel={showLabels}
        />
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}

// Compact verification strip for headers
export function VerificationStrip({
  isVerified = true,
  transactionLevel,
  yearsInBusiness,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {isVerified && (
        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
          <ShieldCheckIcon className="h-4 w-4" />
          Verified
        </span>
      )}
      {transactionLevel && (
        <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
          <StarIcon className="h-4 w-4 fill-amber-400" />
          {transactionLevel} Supplier
        </span>
      )}
      {yearsInBusiness && (
        <span className="inline-flex items-center gap-1 text-gray-600">
          <BuildingOffice2Icon className="h-4 w-4 text-gray-400" />
          {yearsInBusiness}+ Years
        </span>
      )}
    </div>
  );
}
