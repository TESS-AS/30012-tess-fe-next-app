import type { FilterCategory } from "@/components/ui/filter";
import { formatUrlToDisplayName, mapCategoryTree } from "@/lib/utils";
import axiosInstance from "@/services/axiosServer";
import { searchProducts } from "@/services/product.service";
import { Category, RawCategory } from "@/types/categories.types";
import { FilterValues } from "@/types/filter.types";

export async function fetchCategories(locale: string) {
	try {
		const response = await axiosInstance.get<RawCategory[]>("/categories");

		const categories = response.data.map((node) =>
			mapCategoryTree(node, locale),
		);

		return categories;
	} catch (error) {
		console.error("Error fetching categories:", error);
		throw error;
	}
}

export async function findCategoryByName(categories: Category[], name: string) {
	return categories?.find(
		(cat) => cat?.name?.toLowerCase() === name.toLowerCase(),
	);
}

//Old Category Lookup: non-path sensitive (aka lookup on name)
export function findSubCategoryRecursive(
	categories: Category[],
	subcategoryName: string,
	segmentName?: string,
): Category | null {
	for (const category of categories) {
		if (formatUrlToDisplayName(category.slug) === subcategoryName) {
			if (!segmentName) return category;

			// Try to find segment in this category's subcategories
			const deeper = findSubCategoryRecursive(
				category.subcategories || [],
				segmentName,
			);
			if (deeper) return deeper;
			return category;
		}

		// Search deeper if subcategories exist
		if (category.subcategories?.length) {
			const found = findSubCategoryRecursive(
				category.subcategories,
				subcategoryName,
				segmentName,
			);
			if (found) return found;
		}
	}
	return null;
}

//new category lookup: path sensitive, forces match per slug, we send in top to bottom slugs, so
//first top category, then subcategory, then segment, we can also only send 2 first  or just the main cat
export function findCategoryByPath(
	categories: Category[],
	slugs: string[],
): Category | null {
	let current: Category | null = null;
	let level = categories;

	for (const slug of slugs) {
		current = level.find((c) => c.slug === slug) ?? null;
		if (!current) return null;
		level = current.subcategories || [];
	}

	return current;
}



export async function fetchProducts(
	categoryNumber: string | null,
	searchTerm: string | null,
) {
	try {
		const response = await searchProducts(
			1, // page
			9, // pageSize
			searchTerm,
			categoryNumber,
			null, // no filters
		);
		return response.product;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
}

/**
 * Normalizes the filter response from loadFilterParents into FilterCategory format
 * Handles both SearchFilterResponseItem and CategoryFilterResponseItem response types
 */
export function normalizeFilterResponse(
	filtersResponse: any[],
): FilterCategory[] {
	const result: FilterCategory[] = [];

	for (const item of filtersResponse) {
		// Handle SearchFilterResponseItem (has categoryFilters and filter)
		if ("categoryFilters" in item && "filter" in item) {
			result.push({
				category: item.category,
				filters: (item.filter as { key: string; productCount: number }[]).map(
					(f) => ({
						key: f.key,
						values: [
							{
								value: f.key,
								productcount: f.productCount,
							},
						],
					}),
				) as unknown as FilterValues[],
			});
			continue;
		}
		// Handle CategoryFilterResponseItem (has filters and categoryNumber)
		if ("filters" in item) {
			result.push({
				category: item.category,
				categoryNumber: item.categoryNumber,
				filters: (item.filters as { key: string; productCount: number }[]).map(
					(f) => ({
						key: f.key,
						values: [
							{
								value: f.key,
								productcount: f.productCount,
							},
						],
					}),
				) as unknown as FilterValues[],
			});
			continue;
		}
		// Unknown format, log warning and skip
		console.warn("Unexpected item in filter response", item);
	}

	return result;
}

/**
 * Gets the image URL for a category from mediaId or image property
 */
export function getCategoryImage(category: Category): string | null {
	if (
		(category as any).mediaId &&
		Array.isArray((category as any).mediaId) &&
		(category as any).mediaId.length > 0
	) {
		const media = (category as any).mediaId[0];
		if (media?.url) return media.url;
	}

	if (category.image) return category.image;

	return null;
}

/**
 * Gets the count of subcategories for a category
 */
export function getSubcategoryCount(category: Category): number {
	return category.subcategories?.length || 0;
}
