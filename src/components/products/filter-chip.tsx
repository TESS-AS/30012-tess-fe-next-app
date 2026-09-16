"use client";

import { memo } from "react";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { X } from "lucide-react";

/**
 * Single removable filter/category pill. Extracted so the top-of-page filter
 * bar has one visual primitive instead of two copy-pasted blocks (was inlined
 * in `product-grid.tsx` for regular filters + range filters). Wrapped in
 * `React.memo` so re-renders of the parent don't re-render every chip when
 * only one changed.
 */
interface FilterChipProps {
	label: string;
	value: string;
	onRemove: () => void;
}

export const FilterChip = memo(function FilterChip({
	label,
	value,
	onRemove,
}: FilterChipProps) {
	return (
		<div className="bg-primary/10 flex items-center gap-1 rounded-md px-3 py-1 text-sm">
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="flex items-center gap-1">
							<span className="text-md max-w-[100px] truncate">{label}:</span>
							<span className="max-w-[100px] truncate">{value}</span>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							{label}: {value}
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<button
				type="button"
				onClick={onRemove}
				aria-label={`Fjern ${label}: ${value}`}
				className="hover:bg-primary/20 ml-1 rounded-md p-0.5">
				<X className="h-3 w-3" />
			</button>
		</div>
	);
});
