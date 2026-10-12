"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type ConfiguratorStepperProps = {
	steps: string[];
	currentStep: number;
	onStepClick?: (stepIndex: number) => void;
};

export function ConfiguratorStepper({
	steps,
	currentStep,
	onStepClick,
}: ConfiguratorStepperProps) {
	return (
		<nav
			aria-label="Slangekonfigurator steg"
			className="w-full px-4 py-8 md:px-8">
			<ol className="relative mx-auto flex max-w-3xl items-start justify-between">
				{/* Connector line behind the circles */}
				<div
					aria-hidden
					className="absolute top-4 right-[16.67%] left-[16.67%] h-px bg-[#C1C4C2]"
				/>

				{steps.map((step, index) => {
					const isActive = index === currentStep;
					const isCompleted = index < currentStep;
					const isClickable = !!onStepClick && index <= currentStep;

					return (
						<li
							key={step}
							className="relative z-10 flex w-1/3 flex-col items-center text-center">
							<button
								type="button"
								disabled={!isClickable}
								onClick={() => onStepClick?.(index)}
								className={cn(
									"flex flex-col items-center gap-2",
									isClickable ? "cursor-pointer" : "cursor-default",
								)}>
								<span
									className={cn(
										"flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white",
										isActive || isCompleted
											? "bg-[#009640]"
											: "bg-[#A8ADA9]",
									)}>
									{isCompleted ? (
										<Check
											className="h-4 w-4"
											strokeWidth={3}
										/>
									) : (
										index + 1
									)}
								</span>
								<span
									className={cn(
										"text-sm font-medium",
										isActive
											? "text-[#009640]"
											: isCompleted
												? "text-[#009640]"
												: "text-[#0F1912]",
									)}>
									{step}
								</span>
							</button>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
