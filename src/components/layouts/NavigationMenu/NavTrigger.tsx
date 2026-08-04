import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";

export function NavTrigger({
	category,
	isActive,
	isCurrent,
	isFirst,
	isTight,
	onToggle,
}: {
	category: Category;
	isActive: boolean;
	isCurrent?: boolean;
	isFirst: boolean;
	isTight: boolean;
	onToggle: () => void;
}) {
	const highlighted = isActive || isCurrent;
	return (
		<button
			type="button"
			aria-expanded={isActive}
			aria-haspopup="true"
			aria-current={isCurrent ? "page" : undefined}
			onClick={onToggle}
			className={cn(
				"group relative inline-flex h-9 items-center justify-center rounded-none py-2 text-sm font-medium whitespace-nowrap",
				isTight ? "gap-0.5 px-1" : "gap-1 px-4",
				"transition-all duration-150 ease-out",
				"hover:font-extrabold hover:text-[#009640]",
				"outline-none focus-visible:ring-0 focus-visible:outline-none",
				isFirst && "pl-0",
				highlighted && "font-extrabold",
			)}>
			<span className="px-1">{category.name}</span>
			{highlighted && (
				<span
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute bottom-0 h-[6px] right-5",
						isFirst ? "left-1" : "left-5",
					)}
					style={{ backgroundColor: "#00B84C" }}
				/>
			)}
		</button>
	);
}
