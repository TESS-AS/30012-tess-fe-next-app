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
		<div className="flex items-center gap-1 rounded-full border border-[#009640] bg-[#F0FAF4] px-2 py-0.5 text-[11px] leading-[16.5px] font-medium text-[#005222]">
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="flex items-center gap-1">
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
				className="ml-0.5 rounded-sm hover:bg-[#009640]/10">
				<X
					className="h-2.5 w-2.5"
					strokeWidth={3}
				/>
			</button>
		</div>
	);
});
