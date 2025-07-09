import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface QuantityButtonsProps {
	quantity: number;
	onIncrease: (e: React.MouseEvent) => Promise<void>;
	onDecrease: (e: React.MouseEvent) => Promise<void>;
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
	isLoading = false,
	disabled = false,
	min = 0,
	max,
	className,
	buttonClassName,
	quantityClassName,
}: QuantityButtonsProps) => {
	const isDecrementDisabled = disabled || isLoading || quantity <= min;
	const isIncrementDisabled =
		disabled || isLoading || (max !== undefined && quantity >= max);

	return (
		<div className={cn("flex items-center gap-1", className)}>
			<Button
				size="icon"
				variant="outline"
				disabled={isDecrementDisabled}
				className={cn("h-6 w-6 bg-[#E8EAE9]", buttonClassName)}
				onClick={(e) => {
					e.stopPropagation();
					onDecrease(e);
				}}>
				{isLoading ? (
					<div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
				) : (
					<Minus className="h-4 w-4" />
				)}
			</Button>
			<span className={cn("w-6 text-center font-bold", quantityClassName)}>
				{quantity}
			</span>
			<Button
				size="icon"
				variant="outline"
				disabled={isIncrementDisabled}
				className={cn("h-6 w-6 bg-[#E8EAE9]", buttonClassName)}
				onClick={(e) => {
					e.stopPropagation();
					onIncrease(e);
				}}>
				{isLoading ? (
					<div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
				) : (
					<Plus className="h-4 w-4" />
				)}
			</Button>
		</div>
	);
};

export default QuantityButtons;
