"use client";

import { useEffect } from "react";

import { useCategories } from "@/lib/CategoriesProvider";
import type { ProductCategoryNode } from "@/lib/product-breadcrumbs";
import { useNavMenuStore } from "@/stores/useNavMenuStore";
import type { Category } from "@/types/categories.types";

function subtreeHasAnySlug(category: Category, slugs: Set<string>): boolean {
	if (slugs.has(category.slug)) return true;
	return (
		category.subcategories?.some((c) => subtreeHasAnySlug(c, slugs)) ?? false
	);
}

function resolveTopLevelSlug(
	navTopLevels: Category[] | null | undefined,
	productCategories: ProductCategoryNode[] | null | undefined,
): string | null {
	if (!navTopLevels?.length || !productCategories?.length) return null;

	const productSlugs = new Set<string>();
	for (const node of productCategories) {
		if (!Array.isArray(node.slug)) continue;
		for (const s of node.slug) {
			if (typeof s === "string" && s) productSlugs.add(s);
		}
	}
	if (productSlugs.size === 0) return null;

	for (const top of navTopLevels) {
		if (subtreeHasAnySlug(top, productSlugs)) return top.slug;
	}
	return null;
}

/**
 * Product pages call this with the product's `categories` array so the
 * header nav can persistently highlight the correct top-level category.
 * URL-based matching alone isn't enough for `/produkt/:id` search-result
 * links (middleware rewrites those with `__default` for category/subcategory).
 */
export function useSyncProductTopLevelNav(
	productCategories: ProductCategoryNode[] | null | undefined,
) {
	const { categories } = useCategories();
	const setProductTopLevelSlug = useNavMenuStore(
		(s) => s.setProductTopLevelSlug,
	);

	useEffect(() => {
		const slug = resolveTopLevelSlug(categories, productCategories);
		setProductTopLevelSlug(slug);
		return () => setProductTopLevelSlug(null);
	}, [categories, productCategories, setProductTopLevelSlug]);
}
