import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";
import Link from "next/link";

export function NavLink({
	category,
	isFirst,
	isLast,
}: {
	category: Category;
	isFirst: boolean;
	isLast: boolean;
}) {
	return (
		<Link
			href={`/${category.slug}`}
			className={cn(
				"inline-flex h-9 w-max items-center justify-center gap-1 rounded-none px-4 py-2 text-sm font-medium",
				"border-b-2 border-transparent transition-all duration-150 ease-out",
				"hover:border-b-4 hover:border-[#009640] hover:font-extrabold hover:text-[#009640]",
				"outline-none focus-visible:ring-0 focus-visible:outline-none",
				isFirst && "pl-0",
				isLast && "pr-0",
			)}
		>
			{category.name}
		</Link>
	);
}
