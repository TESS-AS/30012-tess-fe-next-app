import { useCallback, useEffect, useState } from "react";

import { FilterCategory } from "@/components/ui/filter";
import { loadFilterParents } from "@/services/categories.service";
import { searchProducts } from "@/services/product.service";
import {
	CategoryFilterResponseItem,
	FilterResponseItem,
	FilterValues,
} from "@/types/filter.types";
import { IProduct } from "@/types/product.types";

interface UseProductFilterProps {
	categoryNumber: string;
	query: string | null;
}

export function useProductFilter({
	categoryNumber: initialCategoryNumber,
	query,
}: UseProductFilterProps) {
	const [categoryNumber, setCategoryNumber] = useState(initialCategoryNumber);
	const [products, setProducts] = useState<IProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [currentFilters, setCurrentFilters] = useState<FilterValues[] | null>(
		null,
	);
	const [selectedFilters, setSelectedFilters] = useState<
		Record<string, string[]>
	>({});
	const [sort, setSort] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function fetchInitialProducts() {
			try {
				const response = await searchProducts(
					1,
					9,
					query,
					categoryNumber,
					currentFilters,
					sort,
				);

				if (isMounted) {
					setProducts(response.product || []);
					setHasMore(response.product && response.product.length === 9);
					setIsLoading(false);
				}
			} catch (err) {
				console.error("Error fetching initial products:", err);
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		setIsLoading(true);
		setCurrentPage(1);
		fetchInitialProducts();

		return () => {
			isMounted = false;
		};
	}, [categoryNumber, query, currentFilters, sort]);

	const loadMore = useCallback(async () => {
		if (!hasMore || isLoading) return;

		try {
			setIsLoading(true);
			const nextPage = currentPage + 1;
			const response = await searchProducts(
				nextPage,
				9,
				query,
				categoryNumber,
				currentFilters,
				sort,
			);

			if (response.product && response.product.length > 0) {
				setProducts((prev) => [...prev, ...response.product]);
				setCurrentPage(nextPage);
				setHasMore(response.product.length === 9);
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error("Error loading more products:", error);
		} finally {
			setIsLoading(false);
		}
	}, [
		categoryNumber,
		currentFilters,
		currentPage,
		hasMore,
		isLoading,
		query,
		sort,
	]);

	const handleFilterChange = useCallback(
		async (filters: FilterValues[]) => {
			try {
				setIsLoading(true);
				setCurrentFilters(filters);
				setCurrentPage(1);

				// Update selected filters state
				const newSelectedFilters: Record<string, string[]> = {};
				filters.forEach((filter) => {
					newSelectedFilters[filter.key] = filter.values;
				});
				setSelectedFilters(newSelectedFilters);

				const response = await searchProducts(
					1,
					9,
					query,
					categoryNumber,
					filters?.length > 0 ? filters : null,
					sort,
				);

				setProducts(response.product || []);
				setHasMore(response.product && response.product.length === 9);
			} catch (error) {
				console.error("Error applying filters:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[categoryNumber, query, sort],
	);

	const handleCategoryChange = useCallback(
		async (
			newCategoryNumber: string,
			setFiltersFn: (filters: FilterCategory[]) => void,
		) => {
			setCategoryNumber(newCategoryNumber);
			setCurrentPage(1);
			setProducts([]);
			setSelectedFilters({});
			setCurrentFilters(null);

			try {
				const result = await loadFilterParents({
					categoryNumber: newCategoryNumber,
					searchTerm: query,
				});

				const normalized = result.map((item: CategoryFilterResponseItem) => ({
					category: item.category,
					categoryNumber: item.categoryNumber,
					filters: item.filters.map((f) => ({
						key: f.key,
						values: [
							{
								value: f.key,
								productcount: f.productCount,
							},
						],
					})),
				}));

				setFiltersFn(normalized);
			} catch (err) {
				console.error("Failed to load parent filters", err);
			}
		},
		[query],
	);

	const handleSortChange = useCallback(
		async (newSort: string) => {
			try {
				setIsLoading(true);
				setSort(newSort);
				setCurrentPage(1);

				const response = await searchProducts(
					1,
					9,
					query,
					categoryNumber,
					currentFilters,
					newSort,
				);

				setProducts(response.product || []);
				setHasMore(response.product && response.product.length === 9);
			} catch (error) {
				console.error("Error sorting products:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[categoryNumber, query, currentFilters],
	);

	const removeFilter = useCallback(
		async (key: string, value: string) => {
			const newFilters = selectedFilters[key].filter((v) => v !== value);
			const filterArray: FilterValues[] = Object.entries({
				...selectedFilters,
				[key]: newFilters,
			})
				.filter(([, vals]) => vals.length > 0)
				.map(([k, vals]) => ({
					key: k,
					values: vals,
				}));

			await handleFilterChange(filterArray);
		},
		[handleFilterChange, selectedFilters],
	);

	return {
		products,
		isLoading,
		hasMore,
		handleFilterChange,
		handleSortChange,
		loadMore,
		selectedFilters,
		removeFilter,
		handleCategoryChange,
	};
}
