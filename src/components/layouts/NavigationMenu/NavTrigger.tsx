import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";

import { BRAND_GREEN } from "./constants";

export function NavTrigger({
	category,
	isActive,
	isFirst,
	isTight,
	onToggle,
}: {
	category: Category;
	isActive: boolean;
	isFirst: boolean;
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
				"group inline-flex h-9 items-center justify-center rounded-none py-2 text-sm font-medium whitespace-nowrap",
				isTight ? "gap-0.5 px-1" : "gap-1 px-4",
				"transition-all duration-150 ease-out",
				"hover:font-extrabold hover:text-[#009640]",
				"outline-none focus-visible:ring-0 focus-visible:outline-none",
				isFirst && "pl-0",
				isActive && "font-extrabold text-[#009640]",
			)}
			style={isActive ? { color: BRAND_GREEN } : undefined}>
			<span
				className={cn(
					"border-b-2 border-transparent px-1 group-hover:border-[#009640]",
					isActive && "border-[#009640]",
				)}
				style={isActive ? { borderBottomColor: BRAND_GREEN } : undefined}>
				{category.name}
			</span>
		</button>
	);
}
