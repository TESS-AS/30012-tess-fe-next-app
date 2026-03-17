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
	className?: string;
	buttonClassName?: string;
	quantityClassName?: string;
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
	className,
	buttonClassName,
	quantityClassName,
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

		const next = Math.max(
			min,
			max !== undefined ? Math.min(max, parsed) : parsed,
		);
		onQuantityChange(next);
	};

	return (
		<div
			className={cn(
				"inline-flex h-8 items-stretch overflow-hidden rounded-md border border-[#D3D3D3] bg-[#F5F5F5]",
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
				<input
					type="number"
					inputMode="numeric"
					disabled={disabled || isLoading}
					min={min}
					max={max}
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
						"h-full w-[70px] border-r border-[#D3D3D3] bg-white text-center text-sm font-medium text-gray-900 outline-none",
						quantityClassName,
					)}
				/>
			) : (
				<span
					className={cn(
						"flex min-w-[2.5rem] items-center justify-center border-r border-[#D3D3D3] bg-white px-2 text-sm font-medium text-gray-900",
						quantityClassName,
					)}>
					{quantity}
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
