"use client";
import { useState, useId } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export function Tabs({ tabs, activeTab = 0, onChange, equalWidth = false }) {
  // Resolve the active index based on whether activeTab is a key/id or an index
  const activeIndex = tabs.findIndex((t, i) => {
    // Check if activeTab matches the key, id, or index
    const tabKey = t.key || t.id;
    return tabKey === activeTab || i === activeTab;
  });

  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <div className="w-full">
      {equalWidth ? (
        <div className="mb-4 rounded-full border border-gray-200 overflow-hidden bg-white">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, tabs.length)}, minmax(0, 1fr))`,
            }}
          >
            {tabs.map((t, i) => (
              <button
                key={t.key || t.id || i}
                type="button"
                onClick={() => {
                  if (!t.disabled) {
                    onChange?.(t.key || t.id || i);
                  }
                }}
                className={clsx(
                  "w-full rounded-full px-2.5 py-2.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  i === safeIndex
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:text-gray-500",
                  t.disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                {t.icon && <t.icon className="h-4 w-4 inline mr-1" />} {t.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="flex overflow-x-auto scrollbar-hide gap-1 border-b border-gray-200 dark:border-gray-700 mb-4 -mx-1 px-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {tabs.map((t, i) => (
            <button
              key={t.key || t.id || i}
              type="button"
              onClick={() => {
                onChange?.(t.key || t.id || i);
              }}
              className={clsx(
                "relative px-4 py-2 text-sm font-medium rounded-t-md transition flex-shrink-0 whitespace-nowrap",
                i === safeIndex
                  ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              {t.icon && <t.icon className="h-4 w-4 inline mr-1" />} {t.label}
            </button>
          ))}
        </div>
      )}
      <div>{tabs[safeIndex]?.content}</div>
    </div>
  );
}

export function StepTabs({ steps, active, onStep }) {
  return (
    <ol
      className="flex gap-2 overflow-x-auto no-scrollbar py-1 pr-2 -ml-1"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {steps.map((s, i) => {
        const status =
          i < active ? "completed" : i === active ? "active" : "upcoming";
        return (
          <li key={s.key || i} className="flex-shrink-0">
            <button
              type="button"
              aria-current={status === "active" ? "step" : undefined}
              onClick={() => onStep?.(i)}
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium border transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
                status === "active" &&
                  "bg-indigo-600 border-indigo-600 text-white shadow-sm",
                status === "completed" &&
                  "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-50",
                status === "upcoming" &&
                  "bg-white border-gray-300 text-gray-600 hover:bg-gray-50",
              )}
            >
              {status === "completed" ? (
                <CheckIcon className="h-3.5 w-3.5" />
              ) : (
                <span className="font-semibold">{i + 1}</span>
              )}
              <span className="truncate max-w-[7rem] sm:max-w-none">
                {s.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
