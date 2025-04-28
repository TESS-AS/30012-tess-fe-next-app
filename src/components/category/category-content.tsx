"use client";

import { Category } from "@/types/categories.types";
import { IProduct } from "@/types/product.types";
import { FilterCategory } from "../ui/filter";
import { Breadcrumb } from "../ui/breadcrumb";
import { ProductGrid } from "@/components/products/product-grid";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

interface CategoryContentProps {
	products: IProduct[];
	categoryData?: Category;
	filters: FilterCategory[];
	query?: string;
}

export default function CategoryContent({
	products,
	categoryData,
	filters,
	query,
}: CategoryContentProps) {
	const breadcrumbs = useBreadcrumbs(query);

	return (
		<div className="py-8">
			<div className="mb-6">
				<Breadcrumb items={breadcrumbs} />
			</div>
			{products?.length > 0 ? (
				<ProductGrid
					filters={filters}
					initialProducts={products}
					categoryNumber={categoryData?.groupId || ""}
					query={query || null}
				/>
			) : (
				<div className="text-center text-gray-500">
					No products found in this category
				</div>
			)}
		</div>
	);
}
