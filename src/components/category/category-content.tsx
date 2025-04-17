"use client";

import { useEffect, useState } from "react";

import { ProductGrid } from "@/components/products/product-grid";
import {
    loadProductsByCategory,
    loadProductsBySubCategory,
} from "@/services/product.service";
import { useStore } from "@/store/store";
import { Category } from "@/types/categories.types";
import { IProduct } from "@/types/product.types";
import { formatUrlToDisplayName } from "@/utils/string-utils";

interface CategoryContentProps {
    category: string;
    isCategoryPage?: boolean;
}

export default function CategoryContent({
    category,
    isCategoryPage,
}: CategoryContentProps) {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { categories } = useStore();
    const formattedCategory = formatUrlToDisplayName(category);

    const categoryData = categories.find(
        (cat: Category) => cat.name.toLowerCase() === formattedCategory.toLowerCase()
    );

    const subCategoryData = categories
        .flatMap((cat: Category) => cat.subcategories || [])
        .find(
            (subCat: Category) =>
                subCat.name.toLowerCase() === formattedCategory.toLowerCase()
        );

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setError(null);
                let fetchedProducts: IProduct[] = [];

                if (categoryData?.groupId) {
                    fetchedProducts = await loadProductsByCategory(categoryData.groupId);
                } else if (subCategoryData?.groupId) {
                    fetchedProducts = await loadProductsBySubCategory(subCategoryData.groupId);
                } else {
                    throw new Error("No valid category or subcategory found");
                }

                setProducts(fetchedProducts);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load products");
            }
        };

        fetchProducts();
    }, [categoryData, subCategoryData]);

    if (error) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    const title = categoryData?.name || subCategoryData?.name || "Products";

    return (
        <div className="py-8">
            <h1 className="mb-6 text-3xl font-bold text-gray-900">{title}</h1>
            {products.length > 0 ? (
                <ProductGrid initialProducts={products} />
            ) : (
                <div className="text-center text-gray-500">
                    No products found in this category
                </div>
            )}
        </div>
    );
}
