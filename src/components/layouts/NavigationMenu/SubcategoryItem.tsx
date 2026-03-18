import { getCategoryImage } from "@/lib/category-utils";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";
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
						className={cn(
							"text-md hover:underline",
							hasChildren ? "font-bold" : "font-medium text-gray-700",
						)}
					>
						{subcategory.name}
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
