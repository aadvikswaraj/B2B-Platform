"use client";

import React from "react";

/**
 * RegistrationStepper
 * Props:
 * - steps: [{ id, name, description?, locked?, autoComplete? }]
 * - currentStepId: string
 * - onStep: (id: string) => void
 */
export default function RegistrationStepper({ steps = [], currentStepId, onStep }) {
	const currentIndex = steps.findIndex((s) => s.id === currentStepId);

	const isStepComplete = (idx) => idx < currentIndex || steps[idx]?.autoComplete;

	const canClick = (idx) => {
		const step = steps[idx];
		if (!step) return false;
		const complete = isStepComplete(idx);
		// Allow clicking current or completed (including autoComplete) even if locked
		if (complete || step.id === currentStepId) return true;
		// Allow advancing to immediate next if current step is autoComplete
		if (idx === currentIndex + 1 && steps[currentIndex]?.autoComplete) return true;
		// Otherwise blocked if locked or future
		if (step.locked) return false;
		return idx <= currentIndex;
	};

	if (!steps?.length) return null;

	return (
		<div className="mb-5">
			{/* Desktop: horizontal tabs */}
			<div className="hidden lg:block">
				<ol className="flex items-center gap-2 overflow-x-auto rounded-lg border border-gray-200 bg-white p-2">
					{steps.map((step, idx) => {
						const active = step.id === currentStepId;
						const complete = isStepComplete(idx);
						return (
							<li key={step.id} className="min-w-0">
								<button
									type="button"
									disabled={!canClick(idx)}
									onClick={() => canClick(idx) && onStep?.(step.id)}
									className={`group flex items-center gap-2 rounded-md px-3 py-2 transition ${
										active
											? "bg-blue-600 text-white shadow"
											: complete
											? "bg-blue-50 text-blue-700 hover:bg-blue-100"
											: "text-gray-600 hover:bg-gray-50"
									} ${!canClick(idx) ? "opacity-60 cursor-not-allowed" : ""}`}
									aria-current={active ? "step" : undefined}
							 >
									<span
										className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
											active
												? "bg-white/20"
												: complete
												? "bg-blue-100 text-blue-700"
												: "bg-gray-100 text-gray-600"
										}`}
									>
										{complete ? (
											<svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M5 11l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										) : (
											idx + 1
										)}
									</span>
									<span className="truncate text-sm font-medium">{step.name}</span>
								</button>
							</li>
						);
					})}
				</ol>
			</div>

			{/* Mobile: simple pills */}
			<div className="lg:hidden">
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
					{steps.map((s, i) => {
						const active = s.id === currentStepId;
						const complete = isStepComplete(i);
						return (
							<button
								key={s.id}
								type="button"
								onClick={() => canClick(i) && onStep?.(s.id)}
								disabled={!canClick(i)}
								className={`rounded-md px-2 py-2 text-[11px] font-medium transition ${
									active
										? "bg-blue-600 text-white shadow"
										: complete
										? "bg-blue-50 text-blue-700"
										: "bg-white text-gray-600 border border-gray-200"
								} ${!canClick(i) ? "opacity-60" : ""}`}
							>
								<div className="flex items-center justify-center gap-1">
									<span>{i + 1}</span>
									<span className="truncate">{s.name}</span>
								</div>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

