"use client";

import { ProductGrid } from "@/components/products/product-grid";
import { Category } from "@/types/categories.types";
import { IProduct } from "@/types/product.types";
import { useParams } from "next/navigation";
import { formatUrlToDisplayName } from "@/utils/string-utils";

import { FilterCategory } from "../ui/filter";
import { Breadcrumb } from "../ui/breadcrumb";

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
	const params = useParams();
	const category = params.category as string;
	const subcategory = params.subcategory as string;

	const breadcrumbItems = [
		{
			href: `/${category}`,
			label: formatUrlToDisplayName(category),
		},
		...(subcategory
			? [
					{
						href: `/${category}/${subcategory}`,
						label: formatUrlToDisplayName(subcategory),
					},
			  ]
			: []),
	];

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
			<div className="mb-6">
				<Breadcrumb items={breadcrumbItems} />
				<h1 className="mt-4 text-3xl font-bold text-gray-900">{title}</h1>
			</div>
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
