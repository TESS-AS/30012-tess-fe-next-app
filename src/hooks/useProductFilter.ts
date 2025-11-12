import { useCallback, useEffect, useState } from "react";

import { FilterCategory } from "@/components/ui/filter";
import { loadFilterParents } from "@/services/categories.service";
import {
	CategoryFilterResponseItem,
	FilterResponseItem,
	FilterValues,
} from "@/types/filter.types";

import { useProductInfiniteQuery } from "./useProductInfiniteQuery";

interface UseProductFilterProps {
	categoryNumber: string;
	categoryName?: string;
	query: string | null;
}

export function useProductFilter({
	categoryNumber: initialCategoryNumber,
	query,
}: UseProductFilterProps) {
	const [categoryNumber, setCategoryNumber] = useState(initialCategoryNumber);
	const [currentFilters, setCurrentFilters] = useState<FilterValues[] | null>(
		null,
	);
	const [selectedFilters, setSelectedFilters] = useState<
		Record<string, string[]>
	>({});
	const [sort, setSort] = useState<string | null>(null);

	const {
		products,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		refetch,
	} = useProductInfiniteQuery({
		categoryNumber,
		query,
		filters: currentFilters,
		sort,
		enabled: !!categoryNumber || !!query,
	});

	const loadMore = useCallback(async () => {
		if (!hasNextPage || isFetchingNextPage) return;
		await fetchNextPage();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleFilterChange = useCallback(
		async (filters: FilterValues[]) => {
			setCurrentFilters(filters?.length > 0 ? filters : null);

			// Update selected filters state
			const newSelectedFilters: Record<string, string[]> = {};
			filters.forEach((filter) => {
				newSelectedFilters[filter.key] = filter.values;
			});
			setSelectedFilters(newSelectedFilters);

			// React Query will automatically refetch when filters change
			await refetch();
		},
		[refetch],
	);

	const handleCategoryChange = useCallback(
		async (
			newCategoryNumber: string,
			newCategoryName: string,
			setFiltersFn: (filters: FilterCategory[]) => void,
		) => {
			setCategoryNumber(newCategoryNumber);
			setSelectedFilters({
				category: [newCategoryName],
			});
			setCurrentFilters(null);

			try {
				const result = await loadFilterParents({
					categoryNumber: newCategoryNumber,
					searchTerm: query,
				});

				if (!Array.isArray(result))
					throw new Error("Expected result to be array");

				const normalized = result
					.map((item: any) => {
						if ("filters" in item) {
							return {
								category: item.category,
								categoryNumber: item.categoryNumber,
								filters: item.filters.map((f: any) => ({
									key: f.key,
									values: [{ value: f.key, productcount: f.productCount }],
								})),
							};
						}
						console.warn("Unexpected item in filter response", item);
						return null;
					})
					.filter(Boolean);

				setFiltersFn(normalized as any);
			} catch (err) {
				console.error("Failed to load parent filters", err);
			}
		},
		[query, categoryNumber],
	);

	const handleSortChange = useCallback(
		async (newSort: string) => {
			setSort(newSort === " " ? null : newSort);
			// React Query will automatically refetch when sort changes
			await refetch();
		},
		[refetch],
	);

	const removeFilter = useCallback(
		async (key: string, value: string) => {
			const newFilters = selectedFilters[key].filter((v) => v !== value);

			const updatedSelectedFilters = {
				...selectedFilters,
				[key]: newFilters,
			};

			if (newFilters.length === 0) {
				delete updatedSelectedFilters[key];
			}

			const filterArray: FilterValues[] = Object.entries(updatedSelectedFilters)
				.filter(([, vals]) => vals.length > 0)
				.map(([k, vals]) => ({
					key: k,
					values: vals,
				}));

			if (key === "category" && newFilters.length === 0) {
				setCategoryNumber("");
			}

			await handleFilterChange(filterArray);
		},
		[handleFilterChange, selectedFilters],
	);

	useEffect(() => {
		if (!query) return;

		setCategoryNumber("");
		setSelectedFilters({});
		setCurrentFilters(null);
	}, [query]);

	return {
		products,
		isLoading,
		isFetchingNextPage,
		hasMore: hasNextPage ?? false,
		handleFilterChange,
		handleSortChange,
		loadMore,
		selectedFilters,
		removeFilter,
		handleCategoryChange,
	};
}
