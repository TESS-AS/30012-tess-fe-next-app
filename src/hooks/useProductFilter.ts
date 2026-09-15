import { useCallback, useEffect, useState, useRef } from "react";

import { normalizeFilterResponse } from "@/lib/category-utils";
import { deserializeFilters, serializeFilters } from "@/lib/utils";
import { loadFilterFamily } from "@/services/categories.service";
import { FilterCategory, FilterValues } from "@/types/filter.types";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { useProductInfiniteQuery } from "./useProductInfiniteQuery";

interface UseProductFilterProps {
	categoryNumber: string;
	categoryName?: string;
	query: string | null;
	onFiltersUpdate?: (filters: FilterCategory[]) => void;
	onCategoriesUpdate?: (categories: any[]) => void;
}

export function useProductFilter({
	categoryNumber: initialCategoryNumber,
	query,
	onFiltersUpdate,
	onCategoriesUpdate,
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
		(filters: FilterValues[], categoryOverride?: string) => {
			const effectiveCategoryNumber = categoryOverride ?? categoryNumber;

			// Optimistic local updates so chips + sidebar react immediately
			setCurrentFilters(filters?.length > 0 ? filters : null);

			const newSelectedFilters: Record<string, string[]> = {};
			filters.forEach((filter) => {
				newSelectedFilters[filter.key] = filter.values;
			});
			setSelectedFilters(newSelectedFilters);

			// Sync filters into URL
			const params = new URLSearchParams(searchParams.toString());
			if (Object.keys(newSelectedFilters).length > 0) {
				const filtersString = serializeFilters(newSelectedFilters);
				params.set("filters", filtersString);
			} else {
				params.delete("filters");
			}

			const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
			router.replace(newUrl, { scroll: false });

			// Fire-and-forget: refresh filterFamily + products in background
			(async () => {
				if (onFiltersUpdate || onCategoriesUpdate) {
					try {
						const result = await loadFilterFamily({
							categoryNumber: effectiveCategoryNumber || undefined,
							searchTerm: query || undefined,
							language: "no",
							filters,
						});

						if (Array.isArray(result?.filters) && onFiltersUpdate) {
							const normalized = normalizeFilterResponse(result.filters);
							onFiltersUpdate(normalized);
						}

						if (Array.isArray(result?.categories) && onCategoriesUpdate) {
							onCategoriesUpdate(result.categories);
						}
					} catch (err) {
						console.error("Failed to reload filters/categories", err);
					}
				}

				try {
					await refetch();
				} catch (err) {
					console.error("Failed to refetch products after filter change", err);
				}
			})();
		},
		[
			refetch,
			searchParams,
			pathname,
			router,
			onFiltersUpdate,
			onCategoriesUpdate,
			categoryNumber,
			query,
		],
	);

	const handleCategoryChange = useCallback(
		async (
			newCategoryNumber: string,
			newCategoryName: string,
			setFiltersFn: (filters: FilterCategory[]) => void,
		) => {
			// If a category is selected, switch context to that category
			if (newCategoryNumber) {
				setCategoryNumber(newCategoryNumber);
				setSelectedFilters({
					category: [newCategoryName],
				});
				setCurrentFilters(null);

				try {
					const result = await loadFilterFamily({
						categoryNumber: newCategoryNumber,
						searchTerm: query,
						language: "no",
						filters: [],
					});

					const normalized = normalizeFilterResponse(result?.filters ?? []);
					setFiltersFn(normalized);

					if (Array.isArray(result?.categories) && onCategoriesUpdate) {
						onCategoriesUpdate(result.categories);
					}
				} catch (err) {
					console.error("Failed to load filters for category", err);
				}
				return;
			}

			// If the category is deselected, revert back to the page's initial categoryNumber
			const fallbackCategoryNumber = initialCategoryNumber || "";
			setCategoryNumber(fallbackCategoryNumber);

			// Remove the "category" filter from selectedFilters/currentFilters
			setSelectedFilters((prev) => {
				const next = { ...prev };
				delete next.category;
				return next;
			});
			setCurrentFilters((prev) => {
				if (!prev) return null;
				const withoutCategory = prev.filter((f) => f.key !== "category");
				return withoutCategory.length > 0 ? withoutCategory : null;
			});

			try {
				const result = await loadFilterFamily({
					categoryNumber: fallbackCategoryNumber || undefined,
					searchTerm: query,
					language: "no",
					filters: [],
				});

				const normalized = normalizeFilterResponse(result?.filters ?? []);
				setFiltersFn(normalized);

				if (Array.isArray(result?.categories) && onCategoriesUpdate) {
					onCategoriesUpdate(result.categories);
				}
			} catch (err) {
				console.error("Failed to reload filters for fallback category", err);
			}
		},
		[query, categoryNumber, initialCategoryNumber, onCategoriesUpdate],
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
		(key: string, value: string) => {
			const newFiltersForKey =
				selectedFilters[key]?.filter((v) => v !== value) ?? [];

			const updatedSelectedFilters: Record<string, string[]> = {
				...selectedFilters,
				[key]: newFiltersForKey,
			};

			if (newFiltersForKey.length === 0) {
				delete updatedSelectedFilters[key];
			}

			const filterArray: FilterValues[] = Object.entries(updatedSelectedFilters)
				.filter(([, vals]) => vals.length > 0)
				.map(([k, vals]) => ({
					key: k,
					values: vals,
				}));

			let nextCategoryNumber = categoryNumber;

			// When the category filter is cleared, fall back to the
			// original categoryNumber from the page (if any), instead
			// of removing category context entirely.
			if (key === "category" && newFiltersForKey.length === 0) {
				nextCategoryNumber = initialCategoryNumber || "";
				setCategoryNumber(nextCategoryNumber);
			}

			// Delegate to the same optimistic handler used by sidebar
			handleFilterChange(filterArray, nextCategoryNumber);
		},
		[
			handleFilterChange,
			selectedFilters,
			categoryNumber,
			initialCategoryNumber,
		],
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
