import { formatUrlToDisplayName, mapCategoryTree } from "@/lib/utils";
import axiosInstance from "@/services/axiosServer";
import { searchProducts } from "@/services/product.service";
import { Category, RawCategory } from "@/types/categories.types";
import type { FilterCategory } from "@/types/filter.types";
import { FilterDefinition, FilterValues } from "@/types/filter.types";

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

/**
 * Normalize a URL slug segment to the same form `mapCategoryTree` produces.
 * Idempotent on already-slugged input.
 *
 * Centralizing this kept getting requested ("fix Norwegian chars once and for
 * all"). Every slug-builder in the codebase performs these same six
 * transliterations + the same character whitelist — match that exactly here.
 */
export function toCategorySlug(text: string): string {
	if (!text) return "";
	return text
		.toLowerCase()
		.replace(/å/g, "a")
		.replace(/ø/g, "o")
		.replace(/æ/g, "ae")
		.normalize("NFKD")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * Find a category in the user's tree by a URL slug path.
 *
 * Two extras over `findCategoryByPath`:
 *
 * 1. Slug-normalizes each input via `toCategorySlug`, so a manually-typed
 *    URL like `/fottøy` resolves the same as the canonical `/fottoy`.
 *
 * 2. Transparent wrapper descent. Customer-assortment users get a tree like
 *    `[ { slug: "bane-nor-katalog", subcategories: [ { slug: "fottoy", ... } ] } ]`.
 *    The product breadcrumb correctly skips the assortment wrapper and
 *    generates `/fottoy` as the back-link — but the category route only saw
 *    the wrapper at top level and gave up. This helper descends through
 *    non-matching ancestors so the URL resolves regardless of how many
 *    wrapper levels sit above the real category.
 *
 * The first loop is exact match at the current level; the second loop is the
 * transparent skip (try the same target one level deeper for every node).
 */
export function findCategoryBySlugPath(
	categories: Category[],
	slugs: string[],
): Category | null {
	if (slugs.length === 0) return null;
	const target = slugs.map(toCategorySlug).filter((s) => s.length > 0);
	if (target.length === 0) return null;

	function descend(level: Category[], path: string[]): Category | null {
		const [head, ...rest] = path;
		if (!head) return null;
		for (const cat of level) {
			if (cat.slug === head) {
				if (rest.length === 0) return cat;
				const sub = descend(cat.subcategories || [], rest);
				if (sub) return sub;
			}
		}
		// No match at this level — try one level deeper with the same target.
		// Lets a URL `/fottoy` resolve when the user's tree wraps it in an
		// assortment node.
		for (const cat of level) {
			if (cat.subcategories?.length) {
				const sub = descend(cat.subcategories, path);
				if (sub) return sub;
			}
		}
		return null;
	}

	return descend(categories, target);
}

/**
 * Finds a category by groupId (categoryNumber) recursively in the category tree
 */
export function findCategoryByGroupId(
	categories: Category[],
	groupId: string,
): Category | null {
	for (const category of categories) {
		if (category.groupId === groupId) {
			return category;
		}
		if (category.subcategories?.length) {
			const found = findCategoryByGroupId(category.subcategories, groupId);
			if (found) return found;
		}
	}
	return null;
}

/**
 * Builds the URL path from a category by traversing up the tree
 * Returns an array of slugs from root to the target category
 */
export function buildCategoryPath(
	categories: Category[],
	targetCategory: Category,
	path: string[] = [],
): string[] | null {
	// Check if target is at current level
	for (const category of categories) {
		if (category.groupId === targetCategory.groupId) {
			return [...path, category.slug];
		}
		// Search in subcategories
		if (category.subcategories?.length) {
			const result = buildCategoryPath(category.subcategories, targetCategory, [
				...path,
				category.slug,
			]);
			if (result) return result;
		}
	}
	return null;
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
		const buildFilterDefinitions = (filters: any[]): FilterDefinition[] => {
			return filters.map((f: any) => {
				// New /filterFamily format is expected to already contain values + optional slider.
				const values: any[] =
					Array.isArray(f.values) && f.values.length > 0
						? f.values
						: [
								{
									value: f.key,
									productcount: f.productCount ?? 0,
								},
							];

				return {
					key: f.key,
					values,
					slider: f.slider,
				};
			});
		};

		// New /filterFamily "filters" shape: flat list of { key, attributeIdentifier, children: [{ val, count }] }
		if ("key" in item && "children" in item && !("filters" in item)) {
			const filters: FilterDefinition[] = filtersResponse.map((f: any) => ({
				key: f.key,
				values: (f.children ?? []).map((c: any) => ({
					value: c.val,
					type: "",
					productcount: c.count,
				})),
				slider: f.slider,
			}));

			result.push({
				category: item.category ?? "Attributes",
				filters,
			});
			break;
		}

		// Legacy SearchFilterResponseItem: has categoryFilters and filter[]
		if ("categoryFilters" in item && "filter" in item) {
			result.push({
				category: item.category,
				filters: buildFilterDefinitions(item.filter ?? []),
			});
			continue;
		}

		// CategoryFilterResponseItem or unified /filterFamily item: has filters[] and categoryNumber
		if ("filters" in item) {
			result.push({
				category: item.category,
				categoryNumber: item.categoryNumber,
				filters: buildFilterDefinitions(item.filters ?? []),
			});
			continue;
		}

		// Unknown format, log warning and skip
		console.warn("Unexpected item in filterFamily response", item);
	}

	return result;
}

/**
 * Gets the image URL for a category from mediaId or image property
 * Returns imageGray by default (for hover effect, use imageGreen)
 */
export function getCategoryImage(category: Category): string | null {
	// Prefer imageGray as default (for initial display)
	if (category.imageGray) return category.imageGray;

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
