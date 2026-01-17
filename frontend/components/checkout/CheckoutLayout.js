"use client";
import ProgressSteps from './ProgressSteps';
import Image from 'next/image';

export default function CheckoutLayout({ stepId, children, summary }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 pt-4 lg:pt-8 pb-6 lg:pb-10">
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2" aria-label="Globomart Home">
            <Image src="/logo/logo-s-1.png" alt="Globomart" width={120} height={40} className="h-8 w-auto" priority />
          </a>
        </div>
        <ProgressSteps current={stepId} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className="lg:col-span-8 space-y-6" aria-labelledby="checkout-step-heading">
            {children}
          </main>
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-4">{summary}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
