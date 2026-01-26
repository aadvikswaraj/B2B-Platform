"use client";
import ProgressSteps from "./ProgressSteps";
import Image from "next/image";

export default function CheckoutLayout({ stepId, children, summary }) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            aria-label="Globomart Home"
          >
            <Image
              src="/logo/logo-s-1.png"
              alt="Globomart"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        <ProgressSteps current={stepId} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <main className="lg:col-span-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </main>

          <aside className="lg:col-span-4 lg:sticky lg:top-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {summary}

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center gap-4 grayscale opacity-60">
              {/* Add icons here if needed */}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">
                Secure SSL Encrypted Transaction
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
