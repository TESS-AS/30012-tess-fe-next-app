"use client";

import { IProduct } from "@/types/product.types";
import { searchProducts } from "@/services/product.service";
import { useCallback, useState } from "react";
import { FilterValues } from "@/types/filter.types";

interface UseProductFilterProps {
    initialProducts: IProduct[];
    categoryNumber: string;
}

export function useProductFilter({ initialProducts, categoryNumber }: UseProductFilterProps) {
    const [products, setProducts] = useState<IProduct[]>(initialProducts);
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterChange = useCallback(async (filters: FilterValues[]) => {
        try {
            setIsLoading(true);
            const response = await searchProducts(
                1,              // page
                9,              // pageSize
                null,           // searchTerm
                categoryNumber,
                filters?.length > 0 ? filters : null
            );
            setProducts(response.product || []);
        } catch (error) {
            console.error('Error applying filters:', error);
        } finally {
            setIsLoading(false);
        }
    }, [categoryNumber]);

    return {
        products,
        isLoading,
        handleFilterChange
    };
}
