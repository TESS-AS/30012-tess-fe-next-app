"use client";

export interface StepHeaderProps {
	step: number;
	title: string;
	isComplete?: boolean;
	onClick: () => void;
}

export const StepHeader = ({
	step,
	title,
	isComplete,
	onClick,
}: StepHeaderProps) => (
	<button
		type="button"
		onClick={onClick}
		className="flex w-full items-center gap-4 border-b p-4 text-left">
		<div
			className={`flex h-6 w-6 items-center justify-center rounded-full ${
				isComplete ? "bg-green-500" : "bg-black"
			} text-sm font-medium text-white`}>
			{step}
		</div>
		<h2 className="font-medium">{title}</h2>
	</button>
);
