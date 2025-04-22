"use client";

import { ProductGrid } from "@/components/products/product-grid";
import { Category } from "@/types/categories.types";
import { IProduct } from "@/types/product.types";

import { FilterCategory } from "../ui/filter";

interface CategoryContentProps {
	products: IProduct[];
	categoryData?: Category;
	filters: FilterCategory[];
}

export default function CategoryContent({
	products,
	categoryData,
	filters,
}: CategoryContentProps) {
	if (!categoryData) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-gray-500">Category not found</div>
			</div>
		);
	}
	const title = categoryData?.name || "Products";

	return (
		<div className="py-8">
			<h1 className="mb-6 text-3xl font-bold text-gray-900">{title}</h1>
			{products?.length > 0 ? (
				<ProductGrid
					filters={filters}
					initialProducts={products}
					categoryNumber={categoryData.groupId}
				/>
			) : (
				<div className="text-center text-gray-500">
					No products found in this category
				</div>
			)}
		</div>
	);
}
