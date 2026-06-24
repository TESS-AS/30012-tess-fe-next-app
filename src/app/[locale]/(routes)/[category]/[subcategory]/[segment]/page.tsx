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
import { FilterCategory } from "@/types/filter.types";
import { useLocale } from "next-intl";

interface SegmentPageProps {
	params: Promise<{
		category: string;
		subcategory: string;
		segment: string;
	}>;
}

export default function SegmentPage({ params }: SegmentPageProps) {
	const { category, subcategory, segment } = use(params);
	const locale = useLocale();

	const { categories } = useCategories();

	const [filters, setFilters] = useState<FilterCategory[]>([]);
	const [categoryFilters, setCategoryFilters] = useState<any[]>([]);
	const [categoryData, setCategoryData] = useState<Category | null>(null);

	const formattedSubCategory = useMemo(
		() => formatUrlToDisplayName(subcategory),
		[subcategory],
	);
	const formattedSegment = useMemo(
		() => (segment ? formatUrlToDisplayName(segment) : undefined),
		[segment],
	);

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
			.catch((error: any) => {
				console.error("Error loading filters:", error);
				setCategoryFilters([]);
				setFilters([]);
			});
	}, [categories, formattedSubCategory, formattedSegment, locale]);

	return (
		<CategoryContent
			categoryData={categoryData || undefined}
			filters={filters}
			categoryFilters={categoryFilters}
			segment={segment}
		/>
	);
}
