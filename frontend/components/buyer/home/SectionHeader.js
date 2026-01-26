import React from "react";
import Link from "next/link";

export default function SectionHeader({
  title,
  linkText = "View more",
  linkHref = "/search",
}) {
  return (
    <div className="flex items-center justify-between mb-4 mt-8 px-1">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
        {title}
      </h2>
      {linkText && (
        <Link
          href={linkHref}
          className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1 group"
        >
          {linkText}
          <span className="group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </Link>
      )}
    </div>
  );
}
