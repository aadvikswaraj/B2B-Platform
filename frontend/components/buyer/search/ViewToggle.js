"use client";

import {
  Squares2X2Icon,
  ListBulletIcon,
  Bars3BottomLeftIcon,
} from "@heroicons/react/24/outline";

/**
 * ViewToggle - Toggle between Grid, List, and Compact view modes
 */
const ViewToggle = ({ value = "grid", onChange, showCompact = false }) => {
  const views = [
    { key: "grid", icon: Squares2X2Icon, label: "Grid" },
    { key: "list", icon: ListBulletIcon, label: "List" },
    ...(showCompact
      ? [{ key: "compact", icon: Bars3BottomLeftIcon, label: "Compact" }]
      : []),
  ];

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
      {views.map((view) => {
        const isActive = value === view.key;
        return (
          <button
            key={view.key}
            onClick={() => onChange(view.key)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
            title={view.label}
          >
            <view.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewToggle;
