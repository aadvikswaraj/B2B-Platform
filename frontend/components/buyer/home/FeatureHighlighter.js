import React from "react";
import { MdVerified, MdSecurity } from "react-icons/md";
import { HiOutlineLightningBolt } from "react-icons/hi";

const FEATURES = [
  {
    title: "Verified Suppliers",
    desc: "Trade with confidence using our verified merchant network.",
    icon: <MdVerified className="w-6 h-6" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Secure Payments",
    desc: "Your funds are protected until you confirm product delivery.",
    icon: <MdSecurity className="w-6 h-6" />,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Smart RFQ",
    desc: "Get multiple competitive quotes within 24 hours.",
    icon: <HiOutlineLightningBolt className="w-6 h-6" />,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export default function FeatureHighlighter() {
  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
            >
              <div
                className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${f.bg} ${f.color}`}
              >
                {f.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
