import React from "react";

import Image from "next/image";

interface StepperProps {
	steps: string[];
	currentStep: number;
	onStepClick: (stepIndex: number) => void;
}

const Stepper: React.FC<StepperProps> = ({
	steps,
	currentStep,
	onStepClick,
}) => {
	return (
		<div className="flex w-full items-center justify-between py-6">
			{steps.map((step, index) => (
				<div
					key={index}
					className="flex flex-1 items-center last:flex-none">
					<button
						onClick={() => onStepClick(index)}
						className={`flex cursor-pointer items-center text-[#003D1A] transition-colors focus:outline-none ${
							index === currentStep
								? "font-[900] text-[#003D1A]"
								: index < currentStep
									? "text-[#009640]"
									: "text-[#8A8F8C]"
						}`}>
						{index < currentStep ? (
							<Image
								src="/icons/check-filled.svg"
								alt="checked"
								width={16}
								height={16}
								className="mr-2"
							/>
						) : (
							""
						)}
						{step}
					</button>
					{index < steps.length - 1 && (
						<div className="mx-4 h-px flex-1 bg-[#E5E7E5]"></div>
					)}
				</div>
			))}
		</div>
	);
};

export default Stepper;
