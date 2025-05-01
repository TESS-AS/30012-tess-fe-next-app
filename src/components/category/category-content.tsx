"use client";

import { ProductGrid } from "@/components/products/product-grid";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";
import { Category } from "@/types/categories.types";
import { IProduct } from "@/types/product.types";

import { Breadcrumb } from "../ui/breadcrumb";
import { FilterCategory } from "../ui/filter";

interface CategoryContentProps {
	categoryData?: Category;
	filters: FilterCategory[];
	query?: string;
	segment?: string;
}

export default function CategoryContent({
	categoryData,
	filters,
	query,
	segment,
}: CategoryContentProps) {
	const breadcrumbs = useBreadcrumbs(segment);
	return (
		<div className="py-8">
			<div className="mb-6">
				<Breadcrumb items={breadcrumbs} />
			</div>
			<ProductGrid
				filters={filters}
				categoryNumber={categoryData?.groupId || ""}
				query={query || null}
			/>
		</div>
	);
}
