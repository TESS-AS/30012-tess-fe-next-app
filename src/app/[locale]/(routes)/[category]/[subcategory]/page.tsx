"use client";

import { useEffect, useMemo, useState, use } from "react";

import CategoryContent from "@/components/category/category-content";
import type { FilterCategory } from "@/components/ui/filter";
import { useCategories } from "@/lib/CategoriesProvider";
import {
	findSubCategoryRecursive,
	normalizeFilterResponse,
} from "@/lib/category-utils";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadFilterParents } from "@/services/categories.service";
import type { Category } from "@/types/categories.types";
import { useLocale } from "next-intl";

interface SubCategoryPageProps {
	params: Promise<{
		subcategory: string;
	}>;
}

export default function SubCategoryPage({ params }: SubCategoryPageProps) {
	const { subcategory } = use(params);
	const locale = useLocale();

	const { categories } = useCategories();

	const [filters, setFilters] = useState<FilterCategory[]>([]);
	const [categoryData, setCategoryData] = useState<Category | null>(null);

	const formattedSubCategory = useMemo(
		() => formatUrlToDisplayName(subcategory),
		[subcategory],
	);

	useEffect(() => {
		if (!categories) return;

		const subCategoryData = findSubCategoryRecursive(
			categories,
			formattedSubCategory,
		);

		setCategoryData(subCategoryData);

		const categoryNumber = subCategoryData?.groupId || null;

		loadFilterParents({
			categoryNumber,
			searchTerm: null,
			language: locale,
		})
			.then((filtersResponse) => {
				const mappedFilters = normalizeFilterResponse(filtersResponse);
				setFilters(mappedFilters);
			})
			.catch((error) => {
				console.error("Error loading filters:", error);
				setFilters([]);
			});
	}, [categories, formattedSubCategory, locale]);

	return (
		<CategoryContent
			categoryData={categoryData || undefined}
			filters={filters}
		/>
	);
}
