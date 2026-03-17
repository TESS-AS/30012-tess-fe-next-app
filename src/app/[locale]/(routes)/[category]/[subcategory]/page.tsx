"use client";

import { useEffect, useMemo, useState, use } from "react";

import CategoryContent from "@/components/category/category-content";
import { useCategories } from "@/lib/CategoriesProvider";
import {
	findCategoryByPath,
	normalizeFilterResponse,
} from "@/lib/category-utils";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadFilterFamily } from "@/services/categories.service";
import type { Category } from "@/types/categories.types";
import type { FilterCategory } from "@/types/filter.types";
import { useLocale } from "next-intl";

interface SubCategoryPageProps {
	params: Promise<{
		category: string;
		subcategory: string;
	}>;
}

export default function SubCategoryPage({ params }: SubCategoryPageProps) {
	const { category, subcategory } = use(params);
	const locale = useLocale();

	const { categories } = useCategories();

	const [filters, setFilters] = useState<FilterCategory[]>([]);
	const [categoryFilters, setCategoryFilters] = useState<any[]>([]);
	const [categoryData, setCategoryData] = useState<Category | null>(null);

	const formattedSubCategory = useMemo(
		() => formatUrlToDisplayName(subcategory),
		[subcategory],
	);

	useEffect(() => {
		if (!categories) return;

		const subCategoryData = findCategoryByPath(categories, [
			category,
			subcategory,
		]);

		setCategoryData(subCategoryData);

		const categoryNumber = subCategoryData?.groupId || null;

		loadFilterFamily({
			categoryNumber,
			searchTerm: null,
			language: locale,
			filters: [],
		})
			.then((response) => {
				if (!response) {
					setCategoryFilters([]);
					setFilters([]);
					return;
				}

				const categoryFiltersArray = Array.isArray(response.categories)
					? response.categories
					: [];
				setCategoryFilters(categoryFiltersArray);

				const mappedFilters = normalizeFilterResponse(response.filters ?? []);
				setFilters(mappedFilters);
			})
			.catch((error) => {
				console.error("Error loading filters:", error);
				setCategoryFilters([]);
				setFilters([]);
			});
	}, [categories, formattedSubCategory, locale]);

	return (
		<CategoryContent
			categoryData={categoryData || undefined}
			filters={filters}
			categoryFilters={categoryFilters}
		/>
	);
}
