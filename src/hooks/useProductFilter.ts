import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import { normalizeFilterResponse } from "@/lib/category-utils";
import { deserializeFilters, serializeFilters } from "@/lib/utils";
import { loadFilterFamily } from "@/services/categories.service";
import { FilterCategory, FilterValues } from "@/types/filter.types";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { useCategoryMultiSelect } from "./useCategoryMultiSelect";
import { useProductInfiniteQuery } from "./useProductInfiniteQuery";

/** Display-ready category pill used by product-grid's removable-chip UI. */
export interface CategoryChipData {
	id: string;
	name: string;
}

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

	// PBI2940: multi-select category selection is delegated to a dedicated
	// hook that owns the `Set<string>` + URL sync. This module orchestrates
	// the seeding (from `/searchList`'s `flag: true` rows) and the chip data
	// (which needs `inferredCategories` for display names) — both live here
	// because the composing hook has both concerns in scope.
	const {
		selectedIds: selectedCategoryIds,
		selectedIdsArray: selectedCategoryIdsArray,
		toggle: toggleCategory,
		remove: removeCategory,
		setAll: setAllCategories,
	} = useCategoryMultiSelect();

	const {
		products,
		categories: inferredCategories,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		refetch,
	} = useProductInfiniteQuery({
		// When the user has an explicit multi-selection, send it. Otherwise
		// fall back to the single-category context from the page's URL slug.
		categoryNumber:
			selectedCategoryIdsArray.length > 0
				? selectedCategoryIdsArray
				: categoryNumber,
		query,
		filters: currentFilters,
		sort,
		enabled: !!categoryNumber || !!query,
	});

	// Memoized chip data joining `selectedCategoryIds` with the latest
	// `inferredCategories` for display names. Rebuilds only when either the
	// set or the name catalogue changes — untouched between unrelated
	// renders. Falls back to id-as-name if BE hasn't returned a match yet.
	const selectedCategoryChips = useMemo<CategoryChipData[]>(() => {
		if (selectedCategoryIds.size === 0) return [];
		const byId = new Map<string, string>();
		for (const c of inferredCategories) {
			if (c.categoryNumber) byId.set(c.categoryNumber, c.nameNo);
		}
		return selectedCategoryIdsArray.map((id) => ({
			id,
			name: byId.get(id) ?? id,
		}));
	}, [inferredCategories, selectedCategoryIds.size, selectedCategoryIdsArray]);

	// One-shot seed per query: adopt BE's `flag: true` rows as the initial FE
	// selection, but only if the user hasn't already made a choice (URL
	// param) and we haven't already seeded for this query. Once the user
	// interacts, explicit choices win — BE never re-scopes their selection.
	const seededForQueryRef = useRef<string | null>(null);
	useEffect(() => {
		if (seededForQueryRef.current === query) return;
		if (!inferredCategories.length) return;
		const hasFlagData = inferredCategories.some(
			(c) => c.flag !== undefined,
		);
		if (!hasFlagData) return;

		seededForQueryRef.current = query;

		if (selectedCategoryIds.size > 0) return; // URL already told us

		const flaggedIds = inferredCategories
			.filter((c) => c.flag === true && !!c.categoryNumber)
			.map((c) => c.categoryNumber);
		if (flaggedIds.length === 0) return;

		setAllCategories(flaggedIds);
	}, [
		inferredCategories,
		query,
		selectedCategoryIds,
		setAllCategories,
	]);

	// PBI2940: forward BE-inferred categories from /searchList to consumers
	// via the `onCategoriesUpdate` callback. This is now the single source for
	// the sidebar category list (parent pages no longer preload it), so we
	// forward whenever categories are present — with or without `flag` data.
	// The seed effect above still short-circuits when no flags are set, so
	// flagless browse responses correctly leave `selectedCategoryIds` empty.
	useEffect(() => {
		if (!onCategoriesUpdate) return;
		if (!inferredCategories.length) return;
		onCategoriesUpdate(inferredCategories);
	}, [inferredCategories, onCategoriesUpdate]);

	// PBI2940: narrow the attribute-filter sidebar when the category selection
	// changes (either from BE-flag seeding or from a user checkbox toggle).
	// Fires `loadFilterFamily` with the currently-selected category IDs so BE
	// returns only the attribute filter options that produce hits within those
	// categories — removing the "select filter → blank page" dead-end for
	// options that only exist in unselected categories.
	//
	// Deduplication via a canonical-key ref: identical consecutive fires are
	// skipped, which also elides the first mount when the URL had no
	// pre-selection (both current and last-fired keys are ""). Aborted with
	// a cancelled-flag on unmount / dep change to prevent stale results
	// overwriting a newer response.
	const lastCategoryFilterKeyRef = useRef<string | null>(null);
	useEffect(() => {
		if (!onFiltersUpdate) return;
		if (!query && !categoryNumber) return;

		const catKey = selectedCategoryIdsArray.join(",");
		if (lastCategoryFilterKeyRef.current === catKey) return;
		lastCategoryFilterKeyRef.current = catKey;

		let cancelled = false;
		void (async () => {
			try {
				const result = await loadFilterFamily({
					categoryNumber: catKey || categoryNumber || undefined,
					searchTerm: query || undefined,
					language: "no",
					filters: currentFilters ?? [],
				});
				if (cancelled) return;
				// BE (`/proxy/filter`) returns EITHER a bare filters array OR a
				// wrapped `{ filters: [...], categories: [...] }` object depending
				// on the code path. Read both shapes so the sidebar narrows
				// regardless of which one BE ships on any given request.
				const filtersArray = Array.isArray(result)
					? result
					: Array.isArray(result?.filters)
						? result.filters
						: null;
				if (filtersArray) {
					onFiltersUpdate(normalizeFilterResponse(filtersArray));
				}
			} catch (err) {
				if (cancelled) return;
				console.error(
					"Failed to reload attribute filters after category change",
					err,
				);
			}
		})();

		return () => {
			cancelled = true;
		};
		// Deliberately excluding `currentFilters` — filter changes have their
		// own reload path via `handleFilterChange` and shouldn't double-fetch
		// here. Same for `onFiltersUpdate` (stable setState from parent).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCategoryIdsArray, query, categoryNumber]);

	// Reset the dedup key when the query changes so a fresh search always
	// triggers one filter reload once its categories have been seeded.
	useEffect(() => {
		lastCategoryFilterKeyRef.current = null;
	}, [query]);

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

			// Fire-and-forget: refresh filterFamily + products in background.
			// Categories deliberately NOT updated from `loadFilterFamily` — the
			// /searchList refetch below returns fresh categories with `flag`,
			// and overwriting them with the flagless /filter shape would strip
			// the pre-filtered highlighting mid-interaction.
			(async () => {
				if (onFiltersUpdate) {
					try {
						const result = await loadFilterFamily({
							categoryNumber: effectiveCategoryNumber || undefined,
							searchTerm: query || undefined,
							language: "no",
							filters,
						});

						if (Array.isArray(result?.filters)) {
							const normalized = normalizeFilterResponse(result.filters);
							onFiltersUpdate(normalized);
						}
					} catch (err) {
						console.error("Failed to reload filters", err);
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

					// Categories intentionally NOT forwarded from /filter — the
					// authoritative source is /searchList's response (with `flag`),
					// forwarded via the useEffect below. Overwriting here would drop
					// the pre-filtered highlighting.
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

				// Categories intentionally NOT forwarded from /filter — the
				// authoritative source is /searchList's response (with `flag`),
				// forwarded via the useEffect at the top of this hook. Firing
				// onCategoriesUpdate with the flagless /filter shape here would
				// silently strip `flag: true` from the sidebar checkboxes.
			} catch (err) {
				console.error("Failed to reload filters for fallback category", err);
			}
		},
		[query, categoryNumber, initialCategoryNumber],
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
		inferredCategories,
		// PBI2940 category multi-select surface — consumers use these to
		// drive the sidebar checkboxes and the top-of-page removable chips.
		selectedCategoryIds,
		selectedCategoryChips,
		toggleCategory,
		removeCategory,
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
