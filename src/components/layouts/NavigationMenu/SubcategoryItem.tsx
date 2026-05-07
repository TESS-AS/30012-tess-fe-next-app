import { getCategoryImage } from "@/lib/category-utils";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { MAX_SUBCATEGORY_CHILDREN } from "./constants";

export function SubcategoryItem({
	subcategory,
	parentSlug,
	onClose,
}: {
	subcategory: Category;
	parentSlug: string;
	onClose: () => void;
}) {
	const image = getCategoryImage(subcategory);
	const hasChildren =
		Array.isArray(subcategory.subcategories) && subcategory.subcategories.length > 0;
	const indentClass = "pl-16";

	return (
		<li>
			<div className="relative mb-2">
				{image && (
					<img
						src={image}
						alt={subcategory.name}
						className="absolute top-0 left-0 h-12 w-12 object-contain"
					/>
				)}
				<div className={indentClass}>
					<Link
						onClick={onClose}
						href={`/${parentSlug}/${subcategory.slug}`}
						className="text-md group inline-flex items-center gap-1 font-bold hover:underline"
					>
						{subcategory.name}
						<ChevronRight
							strokeWidth={2.5}
							className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-1"
						/>
					</Link>
				</div>
			</div>
			{hasChildren && (
				<ul className={cn("space-y-1", indentClass)}>
					{subcategory.subcategories!
						.slice(0, MAX_SUBCATEGORY_CHILDREN)
						.map((child) => (
							<li key={child.slug}>
								<Link
									onClick={onClose}
									href={`/${parentSlug}/${subcategory.slug}/${child.slug}`}
									className="hover:text-foreground text-md font-medium text-gray-700 transition-colors"
								>
									{child.name}
								</Link>
							</li>
						))}
				</ul>
			)}
		</li>
	);
}
