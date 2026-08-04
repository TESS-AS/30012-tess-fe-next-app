import React from "react";

import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface QuantityButtonsProps {
	quantity: number;
	onIncrease: (e: React.MouseEvent) => void;
	onDecrease: (e: React.MouseEvent) => void;
	allowInput?: boolean;
	onQuantityChange?: (quantity: number) => void;
	isLoading?: boolean;
	disabled?: boolean;
	min?: number;
	max?: number;
	step?: number;
	className?: string;
	buttonClassName?: string;
	quantityClassName?: string;
	/** Unit label shown next to the number (e.g. "STK", "MTR"). Rendered inside the field group. */
	unit?: string;
}

const QuantityButtons = ({
	quantity,
	onIncrease,
	onDecrease,
	allowInput = false,
	onQuantityChange,
	isLoading = false,
	disabled = false,
	min = 0,
	max,
	step = 1,
	className,
	buttonClassName,
	quantityClassName,
	unit,
}: QuantityButtonsProps) => {
	const [inputValue, setInputValue] = React.useState<string>(String(quantity));

	React.useEffect(() => {
		setInputValue(String(quantity));
	}, [quantity]);

	const isDecrementDisabled = disabled || isLoading || quantity <= min;
	const isIncrementDisabled =
		disabled || isLoading || (max !== undefined && quantity >= max);

	const commitInput = () => {
		if (!onQuantityChange) {
			setInputValue(String(quantity));
			return;
		}

		const trimmed = inputValue.trim();
		if (trimmed.length === 0) {
			setInputValue(String(quantity));
			return;
		}

		const parsed = Number(trimmed);
		if (!Number.isFinite(parsed)) {
			setInputValue(String(quantity));
			return;
		}

		const safeStep = step > 0 ? step : 1;
		const floor = Math.max(min, safeStep);
		const snapped = Math.round(parsed / safeStep) * safeStep;
		const next = Math.max(
			floor,
			max !== undefined ? Math.min(max, snapped) : snapped,
		);
		onQuantityChange(next);
	};

	return (
		<div
			className={cn(
				"inline-flex h-8 shrink-0 items-stretch overflow-hidden rounded-md border border-[#D3D3D3] bg-[#F5F5F5]",
				className,
			)}>
			<button
				type="button"
				disabled={isDecrementDisabled}
				className={cn(
					"flex h-full min-w-[32px] items-center justify-center border-r border-[#D3D3D3] bg-[#F5F5F5] text-gray-800 transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-[#F5F5F5]",
					buttonClassName,
				)}
				onClick={(e) => {
					e.stopPropagation();
					onDecrease(e);
				}}>
				{isLoading ? (
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
				) : (
					<Minus
						className="h-4 w-4"
						strokeWidth={2}
					/>
				)}
			</button>
			{allowInput ? (
				<label className="flex h-full items-center justify-center gap-1 border-r border-[#D3D3D3] bg-white px-3">
					<input
						type="number"
						inputMode="numeric"
						disabled={disabled || isLoading}
						min={min}
						max={max}
						step={step}
						value={inputValue}
						onChange={(e) => {
							e.stopPropagation();
							setInputValue(e.target.value);
						}}
						onBlur={commitInput}
						onKeyDown={(e) => {
							e.stopPropagation();
							if (e.key === "Enter") {
								commitInput();
								(e.target as HTMLInputElement).blur();
							}
						}}
						className={cn(
							"w-[28px] bg-white p-0 text-right text-sm font-medium text-gray-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
							quantityClassName,
						)}
					/>
					{unit && (
						<span className="text-sm font-medium text-gray-900">{unit}</span>
					)}
				</label>
			) : (
				<span
					className={cn(
						"flex min-w-[2.5rem] items-center justify-center gap-1 border-r border-[#D3D3D3] bg-white px-2 text-sm font-medium text-gray-900",
						quantityClassName,
					)}>
					{quantity}
					{unit && <span>{unit}</span>}
				</span>
			)}
			<button
				type="button"
				disabled={isIncrementDisabled}
				className={cn(
					"flex h-full min-w-[32px] items-center justify-center bg-[#F5F5F5] text-gray-800 transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-[#F5F5F5]",
					buttonClassName,
				)}
				onClick={(e) => {
					e.stopPropagation();
					onIncrease(e);
				}}>
				{isLoading ? (
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
				) : (
					<Plus
						className="h-4 w-4"
						strokeWidth={2}
					/>
				)}
			</button>
		</div>
	);
};

export default QuantityButtons;
