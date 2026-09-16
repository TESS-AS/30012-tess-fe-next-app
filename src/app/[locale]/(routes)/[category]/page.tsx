"use client";

import { useEffect, useState, use } from "react";

import CategoryContent from "@/components/category/category-content";
import { useCategories } from "@/lib/CategoriesProvider";
import { findCategoryBySlugPath } from "@/lib/category-utils";
import type { Category } from "@/types/categories.types";

interface CategoryPageProps {
	params: Promise<{ category: string }>;
	searchParams: Promise<{ query?: string }>;
}

export default function CategoryPage({
	params,
	searchParams,
}: CategoryPageProps) {
	const resolvedParams = use(params);
	const resolvedSearchParams = use(searchParams);
	const { category } = resolvedParams;
	const { query } = resolvedSearchParams;

	const { categories } = useCategories();

	const [categoryData, setCategoryData] = useState<Category | null>(null);

	useEffect(() => {
		if (!categories) return;

		// Walk the user's tree (which may wrap real categories in an
		// assortment node for customer-specific catalogs) so `/fottoy` still
		// resolves to the right category even when it sits below a wrapper.
		const matchedCategory = findCategoryBySlugPath(categories, [category]);
		setCategoryData(matchedCategory || null);
	}, [categories, category]);

	return (
		<CategoryContent
			categoryData={categoryData as Category}
			query={query}
		/>
	);
}
