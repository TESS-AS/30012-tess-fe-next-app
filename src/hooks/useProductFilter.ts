import { useCallback, useState } from "react";

import { FilterValues } from "@/types/filter.types";
import { Product } from "@/types/store.types";

export function useProductFilter(initialProducts: Product[]) {
	const [filteredProducts, setFilteredProducts] = useState(initialProducts);

	const filterProducts = useCallback(
		(filters: FilterValues) => {
			return initialProducts.filter((product) => {
				// Search filter
				if (
					filters.search &&
					!product.name.toLowerCase().includes(filters.search.toLowerCase())
				) {
					return false;
				}

				// Price range filter
				if (filters.minPrice && product.price < parseFloat(filters.minPrice)) {
					return false;
				}
				if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) {
					return false;
				}

				// Category filter
				if (filters.category && product.category !== filters.category) {
					return false;
				}

				return true;
			});
		},
		[initialProducts],
	);

	const handleFilterChange = useCallback(
		(filters: FilterValues) => {
			const filtered = filterProducts(filters);
			if (filtered) {
				setFilteredProducts(filtered);
			}
		},
		[filterProducts],
	);

	return {
		filteredProducts,
		handleFilterChange,
	};
}
