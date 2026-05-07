import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";
import Link from "next/link";

export function NavLink({
	category,
	isFirst,
	isTight,
}: {
	category: Category;
	isFirst: boolean;
	isTight: boolean;
}) {
	return (
		<Link
			href={`/${category.slug}`}
			className={cn(
				"group inline-flex h-9 items-center justify-center rounded-none py-2 text-sm font-medium whitespace-nowrap",
				isTight ? "gap-0.5 px-1" : "gap-1 px-4",
				"transition-all duration-150 ease-out",
				"hover:font-extrabold hover:text-[#009640]",
				"outline-none focus-visible:ring-0 focus-visible:outline-none",
				isFirst && "pl-0",
			)}
		>
			<span className="border-b-2 border-transparent px-1 group-hover:border-[#009640]">
				{category.name}
			</span>
		</Link>
	);
}
