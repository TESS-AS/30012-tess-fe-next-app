import Image from "next/image";
import React from "react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex items-center justify-between w-full py-6">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1 last:flex-none">
          <button
            onClick={() => onStepClick(index)}
            className={`flex items-center text-[#003D1A] focus:outline-none transition-colors cursor-pointer ${index === currentStep
                ? "text-[#003D1A] font-[900]"
                : index < currentStep
                  ? "text-[#009640]"
                  : "text-[#8A8F8C]"
              }`}
          >
            {index < currentStep ? <Image src="/icons/check-filled.svg" alt="checked" width={16} height={16} className="mr-2" /> : ''}
            {step}
          </button>
          {index < steps.length - 1 && (
            <div className="h-px bg-[#E5E7E5] flex-1 mx-4"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
