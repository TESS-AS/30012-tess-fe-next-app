import { mapCategoryTree } from "@/lib/utils";
import axiosInstance from "@/services/axiosServer";
import { Category, RawCategory } from "@/types/categories.types";
import { formatUrlToDisplayName } from "@/utils/string-utils";

// Cache for categories with TTL
let categoriesCache: {
	data: Category[] | null;
	timestamp: number;
	locale: string;
} = {
	data: null,
	timestamp: 0,
	locale: '',
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function fetchCategories(locale: string) {
	// Check if we have valid cached data
	const now = Date.now();
	if (
		categoriesCache.data &&
		categoriesCache.locale === locale &&
		now - categoriesCache.timestamp < CACHE_TTL
	) {
		return categoriesCache.data;
	}

	try {
		const response = await axiosInstance.get<RawCategory[]>("/categories", {
			headers: {
				"Accept-Language": locale,
			},
		});

		const categories = response.data.map((node) => mapCategoryTree(node, locale));

		// Update cache
		categoriesCache = {
			data: categories,
			timestamp: now,
			locale,
		};

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

export function findSubCategoryRecursive(
	categories: Category[],
	subcategoryName: string,
	segmentName?: string
): Category | null {
	for (const category of categories) {
		if (formatUrlToDisplayName(category.slug) === subcategoryName) {
			if (!segmentName) return category;

			// Try to find segment in this category's subcategories
			const deeper = findSubCategoryRecursive(
				category.subcategories || [],
				segmentName
			);
			if (deeper) return deeper;
			return category;
		}

		// Search deeper if subcategories exist
		if (category.subcategories?.length) {
			const found = findSubCategoryRecursive(
				category.subcategories,
				subcategoryName,
				segmentName
			);
			if (found) return found;
		}
	}
	return null;
}