import { useState } from "react";

export function useOrderStepper(initialStep = 0) {
	const [currentStep, setCurrentStep] = useState(initialStep);
	const goToNext = () => setCurrentStep((prev) => prev + 1);
	const goToPrev = () => setCurrentStep((prev) => Math.max(0, prev - 1));

	return { currentStep, setCurrentStep, goToNext, goToPrev };
}
