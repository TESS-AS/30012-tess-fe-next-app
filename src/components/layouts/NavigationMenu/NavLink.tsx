import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";
import Link from "next/link";

export function NavLink({
	category,
	isLast,
}: {
	category: Category;
	isLast: boolean;
}) {
	return (
		<Link
			href={`/${category.slug}`}
			className={cn(
				"hover:bg-accent hover:text-accent-foreground text-md block rounded-md px-4 py-2 font-medium transition-colors",
				isLast && "pr-0",
			)}
		>
			{category.name}
		</Link>
	);
}
