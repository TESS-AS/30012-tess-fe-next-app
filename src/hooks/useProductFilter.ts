"use client";

import { useCallback, useState } from "react";

import { searchProducts } from "@/services/product.service";
import { FilterValues } from "@/types/filter.types";
import { IProduct } from "@/types/product.types";

interface UseProductFilterProps {
	initialProducts: IProduct[];
	categoryNumber: string;
	query: string | null;
}

export function useProductFilter({ initialProducts, categoryNumber, query }: UseProductFilterProps) {
	const [products, setProducts] = useState<IProduct[]>(initialProducts);
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [currentFilters, setCurrentFilters] = useState<FilterValues[] | null>(null);

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
			);

			if (response.product && response.product.length > 0) {
				setProducts(prev => [...prev, ...response.product]);
				setCurrentPage(nextPage);
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error("Error loading more products:", error);
		} finally {
			setIsLoading(false);
		}
	}, [categoryNumber, currentFilters, currentPage, hasMore, isLoading]);

	const handleFilterChange = useCallback(
		async (filters: FilterValues[]) => {
			try {
				setIsLoading(true);
				setCurrentFilters(filters);
				setCurrentPage(1); // Reset to first page when filters change
				setHasMore(true); // Reset hasMore state

				const response = await searchProducts(
					1,
					9,
					query,
					categoryNumber,
					filters?.length > 0 ? filters : null,
				);

				setProducts(response.product || []);
			} catch (error) {
				console.error("Error applying filters:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[categoryNumber],
	);

	return {
		products,
		isLoading,
		hasMore,
		handleFilterChange,
		loadMore,
	};
}
