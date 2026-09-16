"use client";

import { useEffect, useState, use } from "react";

import CategoryContent from "@/components/category/category-content";
import { useCategories } from "@/lib/CategoriesProvider";
import { findCategoryBySlugPath } from "@/lib/category-utils";
import type { Category } from "@/types/categories.types";

interface SegmentPageProps {
	params: Promise<{
		category: string;
		subcategory: string;
		segment: string;
	}>;
}

export default function SegmentPage({ params }: SegmentPageProps) {
	const { category, subcategory, segment } = use(params);

	const { categories } = useCategories();

	const [categoryData, setCategoryData] = useState<Category | null>(null);

	useEffect(() => {
		if (!categories) return;

		// Descend through any assortment wrappers so the path resolves for
		// customer-specific catalogs (see findCategoryBySlugPath).
		const subCategoryData = findCategoryBySlugPath(categories, [
			category,
			subcategory,
			segment,
		]);
		setCategoryData(subCategoryData);
	}, [categories, category, subcategory, segment]);

	return (
		<CategoryContent
			categoryData={categoryData || undefined}
			segment={segment}
		/>
	);
}
