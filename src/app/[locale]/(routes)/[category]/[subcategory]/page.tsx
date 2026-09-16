"use client";

import { useEffect, useState, use } from "react";

import CategoryContent from "@/components/category/category-content";
import { useCategories } from "@/lib/CategoriesProvider";
import { findCategoryBySlugPath } from "@/lib/category-utils";
import type { Category } from "@/types/categories.types";

interface SubCategoryPageProps {
	params: Promise<{
		category: string;
		subcategory: string;
	}>;
}

export default function SubCategoryPage({ params }: SubCategoryPageProps) {
	const { category, subcategory } = use(params);

	const { categories } = useCategories();

	const [categoryData, setCategoryData] = useState<Category | null>(null);

	useEffect(() => {
		if (!categories) return;

		// Descend through any assortment wrappers so the path resolves for
		// customer-specific catalogs (see findCategoryBySlugPath).
		const subCategoryData = findCategoryBySlugPath(categories, [
			category,
			subcategory,
		]);
		setCategoryData(subCategoryData);
	}, [categories, category, subcategory]);

	return <CategoryContent categoryData={categoryData || undefined} />;
}
