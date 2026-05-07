import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";

import { BRAND_GREEN } from "./constants";

export function NavTrigger({
	category,
	isActive,
	isFirst,
	isLast,
	isTight,
	onToggle,
}: {
	category: Category;
	isActive: boolean;
	isFirst: boolean;
	isLast: boolean;
	isTight: boolean;
	onToggle: () => void;
}) {
	return (
		<button
			type="button"
			aria-expanded={isActive}
			aria-haspopup="true"
			onClick={onToggle}
			className={cn(
				"inline-flex h-9 items-center justify-center rounded-none py-2 text-sm font-medium whitespace-nowrap",
				isTight ? "gap-0.5 px-1" : "gap-1 px-4",
				"border-b-2 border-transparent transition-all duration-150 ease-out",
				"hover:border-b-4 hover:border-[#009640] hover:font-extrabold hover:text-[#009640]",
				"outline-none focus-visible:ring-0 focus-visible:outline-none",
				isFirst && "pl-0",
				isLast && "pr-0",
				isActive && "border-b-4 border-[#009640] font-extrabold text-[#009640]",
			)}
			style={
				isActive
					? {
							color: BRAND_GREEN,
							borderBottomColor: BRAND_GREEN,
							borderBottomWidth: 4,
						}
					: undefined
			}>
			{category.name}
		</button>
	);
}
