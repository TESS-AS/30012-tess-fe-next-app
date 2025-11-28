import { useCallback, useEffect, useState, useRef } from "react";

import { FilterCategory } from "@/components/ui/filter";
import { deserializeFilters, serializeFilters } from "@/lib/utils";
import { loadFilterParents } from "@/services/categories.service";
import {
	CategoryFilterResponseItem,
	FilterResponseItem,
	FilterValues,
} from "@/types/filter.types";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

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
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const hasInitialized = useRef(false);

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

			const params = new URLSearchParams(searchParams.toString());
			if (Object.keys(newSelectedFilters).length > 0) {
				const filtersString = serializeFilters(newSelectedFilters);
				params.set("filters", filtersString);
			} else {
				params.delete("filters");
			}

			const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
			router.replace(newUrl, { scroll: false });

			// React Query will automatically refetch when filters change
			await refetch();
		},
		[refetch, searchParams, pathname, router],
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
			const sortValue = newSort === " " ? null : newSort;
			setSort(sortValue);

			const params = new URLSearchParams(searchParams.toString());
			if (sortValue) {
				params.set("sort", sortValue);
			} else {
				params.delete("sort");
			}

			const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
			router.replace(newUrl, { scroll: false });

			await refetch();
		},
		[refetch, searchParams, pathname, router],
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
		const filtersParam = searchParams.get("filters");
		const sortParam = searchParams.get("sort");

		if (filtersParam) {
			const restoredFilters = deserializeFilters(filtersParam);
			setSelectedFilters(restoredFilters);

			const filterArray: FilterValues[] = Object.entries(restoredFilters)
				.filter(([, vals]) => vals.length > 0)
				.map(([k, vals]) => ({
					key: k,
					values: vals,
				}));

			setCurrentFilters(filterArray.length > 0 ? filterArray : null);
		} else if (hasInitialized.current) {
			setSelectedFilters({});
			setCurrentFilters(null);
		}

		if (sortParam) {
			setSort(sortParam);
		} else if (hasInitialized.current) {
			setSort(null);
		}

		if (!hasInitialized.current) {
			hasInitialized.current = true;
		}
	}, [searchParams]); // Use searchParams object directly - React will handle changes

	useEffect(() => {
		if (initialCategoryNumber) {
			setCategoryNumber(initialCategoryNumber);
		}
	}, [initialCategoryNumber]);

	useEffect(() => {
		if (query) {
			setCategoryNumber("");
			setCurrentFilters(null);
		}
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
