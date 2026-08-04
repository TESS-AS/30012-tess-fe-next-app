import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";
import Link from "next/link";

export function NavLink({
	category,
	isCurrent,
	isFirst,
	isTight,
}: {
	category: Category;
	isCurrent?: boolean;
	isFirst: boolean;
	isTight: boolean;
}) {
	return (
		<Link
			href={`/${category.slug}`}
			aria-current={isCurrent ? "page" : undefined}
			className={cn(
				"group relative inline-flex h-9 items-center justify-center rounded-none py-2 text-sm font-medium whitespace-nowrap",
				isTight ? "gap-0.5 px-1" : "gap-1 px-4",
				"transition-all duration-150 ease-out",
				"hover:font-extrabold hover:text-[#009640]",
				"outline-none focus-visible:ring-0 focus-visible:outline-none",
				isFirst && "pl-0",
				isCurrent && "font-extrabold",
			)}
		>
			<span className="px-1">{category.name}</span>
			{isCurrent && (
				<span
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute bottom-0 h-[6px] right-5",
						isFirst ? "left-1" : "left-5",
					)}
					style={{ backgroundColor: "#00B84C" }}
				/>
			)}
		</Link>
	);
}
