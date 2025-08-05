"use client";

import { useEffect, useMemo, useState } from "react";

import CategoryContent from "@/components/category/category-content";
import type { FilterCategory } from "@/components/ui/filter";
import { useCategories } from "@/lib/CategoriesProvider";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadFilterParents } from "@/services/categories.service";
import type { Category } from "@/types/categories.types";
import { useLocale } from "next-intl";

export default function CategoryPage({ params, searchParams }: any) {
	const { category } = params;
	const { query } = searchParams;
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

		const matchedCategory = categories.find(
			(cat) => formatUrlToDisplayName(cat.slug) === formattedCategory,
		);

		setCategoryData(matchedCategory || null);

		const categoryNumber = matchedCategory?.groupId || null;

		loadFilterParents({
			categoryNumber,
			searchTerm: query || null,
			language: locale,
		})
			.then((filtersResponse) => {
				const categoryFilters =
					Array.isArray(filtersResponse) &&
					"categoryFilters" in filtersResponse[0]
						? filtersResponse[0].categoryFilters
						: [];
				setCategoryFilters(categoryFilters);

				const mappedFilters: any[] = filtersResponse.map((item: any) => {
					if ("categoryFilters" in item && "filter" in item) {
						return {
							category: item.category,
							filters: (
								item.filter as { key: string; productCount: number }[]
							).map((f) => ({
								key: f.key,
								values: [
									{
										value: f.key,
										productcount: f.productCount,
									},
								],
							})),
						};
					} else {
						return {
							category: item.category,
							categoryNumber: item.categoryNumber,
							filters: (
								item.filters as { key: string; productCount: number }[]
							).map((f) => ({
								key: f.key,
								values: [
									{
										value: f.key,
										productcount: f.productCount,
									},
								],
							})),
						};
					}
				});

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
