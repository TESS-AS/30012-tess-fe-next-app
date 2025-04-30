import { useCallback, useEffect, useState } from "react";
import { searchProducts } from "@/services/product.service";
import { FilterValues } from "@/types/filter.types";
import { IProduct } from "@/types/product.types";

interface UseProductFilterProps {
	initialProducts: IProduct[];
	categoryNumber: string;
	query: string | null;
}

export function useProductFilter({
	initialProducts,
	categoryNumber,
	query,
}: UseProductFilterProps) {
	const [products, setProducts] = useState<IProduct[]>(initialProducts);
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [currentFilters, setCurrentFilters] = useState<FilterValues[] | null>(null);
	const [sort, setSort] = useState<string | null>(null);

	// 👇 NEW: Refetch on categoryNumber or query change
	useEffect(() => {
		async function refetch() {
			setIsLoading(true);
			setCurrentPage(1);
			setHasMore(true);
			try {
				const response = await searchProducts(
					1,
					9,
					query,
					categoryNumber,
					currentFilters,
					sort,
				);
				setProducts(response.product || []);
			} catch (err) {
				console.error("Error refetching on category/query change:", err);
			} finally {
				setIsLoading(false);
			}
		}

		refetch();
	}, [categoryNumber, query]);

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
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error("Error loading more products:", error);
		} finally {
			setIsLoading(false);
		}
	}, [categoryNumber, currentFilters, currentPage, hasMore, isLoading, query, sort]);

	const handleFilterChange = useCallback(
		async (filters: FilterValues[]) => {
			try {
				setIsLoading(true);
				setCurrentFilters(filters);
				setCurrentPage(1);
				setHasMore(true);

				const response = await searchProducts(
					1,
					9,
					query,
					categoryNumber,
					filters?.length > 0 ? filters : null,
					sort,
				);

				setProducts(response.product || []);
			} catch (error) {
				console.error("Error applying filters:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[categoryNumber, query, sort],
	);

	const handleSortChange = useCallback(
		async (newSort: string) => {
			setSort(newSort);
			setCurrentPage(1);
			setHasMore(true);

			try {
				setIsLoading(true);

				const response = await searchProducts(
					1,
					9,
					query,
					categoryNumber,
					currentFilters,
					newSort,
				);

				setProducts(response.product || []);
			} catch (error) {
				console.error("Error sorting products:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[categoryNumber, query, currentFilters],
	);

	return {
		products,
		isLoading,
		hasMore,
		handleFilterChange,
		handleSortChange,
		loadMore,
	};
}
