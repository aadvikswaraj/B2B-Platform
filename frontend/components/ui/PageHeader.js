import Link from "next/link";
import Button from "./Button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

// Reusable page header with back link, title, optional badge and primary action.
// Also renders a mobile action bar fixed at the bottom.
export default function PageHeader({
  backHref,
  backLabel = "Back",
  title,
  subtitle,
  badge,
  primaryLabel,
  primaryIcon: PrimaryIcon,
  onPrimary,
  primaryDisabled,
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>{backLabel}</span>
            </Link>
          )}
          <div className="space-y-0.5">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-500 max-w-prose">{subtitle}</p>
            )}
          </div>
          {badge && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 border border-gray-200">
              {badge}
            </span>
          )}
        </div>
        {primaryLabel && (
          <div className="hidden sm:flex items-center gap-2">
            <Button
              onClick={onPrimary}
              disabled={primaryDisabled}
              icon={PrimaryIcon}
              size="sm"
            >
              {primaryLabel}
            </Button>
          </div>
        )}
      </div>
      {primaryLabel && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur px-4 py-3 flex items-center justify-end gap-3">
          <Button
            size="xs"
            onClick={onPrimary}
            disabled={primaryDisabled}
            icon={PrimaryIcon}
          >
            {primaryLabel}
          </Button>
        </div>
      )}
    </>
  );
}
