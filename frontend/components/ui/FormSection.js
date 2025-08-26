import React from "react";
import clsx from 'clsx';

const FormSection = ({ title, description, children, className, icon:Icon, actions }) => {
  return (
    <section className={clsx("relative group rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm ring-1 ring-transparent hover:ring-indigo-100 transition", className)}>
      <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-indigo-50/60 via-transparent to-transparent" />
      <div className="relative p-4 sm:p-6">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
              <span className="truncate">{title}</span>
            </h2>
            {description && <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed max-w-prose">{description}</p>}
          </div>
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </header>
        <div className="space-y-5">{children}</div>
      </div>
    </section>
  );
};

export default FormSection;
