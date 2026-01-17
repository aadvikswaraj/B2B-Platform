"use client";
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Alert({
  type = "info",
  message,
  onDismiss,
  duration = 5000, // ms
}) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [canHover, setCanHover] = useState(false);

  const remainingRef = useRef(duration);
  const intervalRef = useRef(null);

  const ICONS = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  };

  const Icon = ICONS[type] || ICONS.info;

  // Detect if the device supports hover (desktop-like)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(!!mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

  // Interval-based timer for progress
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isPaused) {
      const tickMs = 100; // update every 100ms
      intervalRef.current = setInterval(() => {
        remainingRef.current = Math.max(0, remainingRef.current - tickMs);
        const pct = (remainingRef.current / duration) * 100;
        setProgress(pct);

        if (remainingRef.current <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          handleClose();
        }
      }, tickMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  const handleClose = () => onDismiss();

  const colors = {
    success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    error: "bg-red-50 text-red-800 ring-red-200",
    warning: "bg-yellow-50 text-amber-800 ring-amber-200",
    info: "bg-sky-50 text-sky-800 ring-sky-200",
  };

  const progressBarBg = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      // Pause on hover only when device supports hover
      onMouseEnter={() => {
        if (canHover) setIsPaused(true);
      }}
      onMouseLeave={() => {
        if (canHover) setIsPaused(false);
      }}
      className={clsx(
        "w-full sm:max-w-sm transform transition duration-200 ease-out ring-1 ring-inset shadow-lg rounded-xl overflow-hidden",
        colors[type]
      )}
    >
      <div className="flex gap-3 p-3 items-center">
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-9 w-9 rounded-lg bg-white/80 flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{message}</p>
        </div>

        <div className="flex-shrink-0 ml-2">
          <button
            onClick={handleClose}
            aria-label="Dismiss"
            className="p-1 rounded-md text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10 relative">
        <div
          className={clsx(
            "absolute left-0 top-0 h-full rounded",
            progressBarBg[type]
          )}
          style={{ width: `${progress}%`, transition: "width 120ms linear" }}
        />
      </div>
    </div>
  );
}
