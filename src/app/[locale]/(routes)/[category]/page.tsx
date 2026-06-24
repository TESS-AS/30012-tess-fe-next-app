"use client";

import { useEffect, useMemo, useState, use } from "react";

import CategoryContent from "@/components/category/category-content";
import { useCategories } from "@/lib/CategoriesProvider";
import {
	findCategoryBySlugPath,
	normalizeFilterResponse,
} from "@/lib/category-utils";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadFilterFamily } from "@/services/categories.service";
import type { Category } from "@/types/categories.types";
import type { FilterCategory } from "@/types/filter.types";
import { notFound } from "next/navigation";
import { useLocale } from "next-intl";

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
	const locale = useLocale();

	const { categories } = useCategories();

	const [filters, setFilters] = useState<FilterCategory[]>([]);
	const [categoryFilters, setCategoryFilters] = useState<any[]>([]);
	const [categoryData, setCategoryData] = useState<Category | null>(null);

	const formattedCategory = useMemo(
		() => formatUrlToDisplayName(category),
		[category],
	);

	useEffect(() => {
		if (!categories) return;

		// Walk the user's tree (which may wrap real categories in an
		// assortment node for customer-specific catalogs) so `/fottoy` still
		// resolves to the right category even when it sits below a wrapper.
		const matchedCategory = findCategoryBySlugPath(categories, [category]);

		setCategoryData(matchedCategory || null);

		const categoryNumber = matchedCategory?.groupId || null;

		loadFilterFamily({
			categoryNumber,
			searchTerm: query || null,
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
	}, [categories, formattedCategory, query, locale]);

	return (
		<CategoryContent
			categoryData={categoryData as Category}
			categoryFilters={categoryFilters}
			filters={filters}
			query={query}
		/>
	);
}
