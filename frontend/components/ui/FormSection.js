import React from "react";
import clsx from "clsx";

const FormSection = ({
  title,
  description,
  children,
  className,
  icon: Icon,
  actions,
}) => {
  return (
    <section
      className={clsx(
        "rounded-xl border border-gray-200 bg-white/80 shadow-sm",
        className,
      )}
    >
      <div className="p-4 sm:p-6">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
              <span className="truncate">{title}</span>
            </h2>
            {description && (
              <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed max-w-prose">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
        <div className="space-y-5">{children}</div>
      </div>
    </section>
  );
};

export default FormSection;
