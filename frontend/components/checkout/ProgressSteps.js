"use client";
import { Check } from "lucide-react";

export const steps = [
  { id: "shipping", label: "Shipping" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
];

export default function ProgressSteps({ current }) {
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <div className="w-full py-4 mb-8">
      <div className="relative flex items-center justify-between max-w-[300px] sm:max-w-[400px] mx-auto">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2" />

        {/* Progress Bar Fill */}
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-500 ease-in-out"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((s, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div
              key={s.id}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : isCurrent
                        ? "bg-white border-blue-600 text-blue-600 shadow-md ring-4 ring-blue-50"
                        : "bg-white border-slate-300 text-slate-400"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>

              <span
                className={`
                  absolute top-10 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300
                  ${isCurrent ? "text-blue-600" : isCompleted ? "text-slate-900" : "text-slate-400"}
                `}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
