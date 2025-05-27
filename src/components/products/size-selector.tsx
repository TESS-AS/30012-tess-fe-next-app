"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Size {
	value: string;
	label: string;
	inStock?: boolean;
}

interface SizeSelectorProps {
	sizes: Size[];
	selectedSize?: string;
	onSelect: (size: string) => void;
	className?: string;
}

export function SizeSelector({
	sizes,
	selectedSize,
	onSelect,
	className,
}: SizeSelectorProps) {
	return (
		<div className={cn("flex flex-wrap gap-2", className)}>
			{sizes.map((size) => (
				<Button
					key={size.value}
					onClick={() => onSelect(size.value)}
					disabled={!size.inStock}
					variant={selectedSize === size.value ? "default" : "outline"}
					className={cn(
						"h-10 min-w-[2.5rem] px-3",
						!size.inStock && "opacity-50",
					)}>
					{size.label}
				</Button>
			))}
		</div>
	);
}
