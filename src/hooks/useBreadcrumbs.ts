"use client";
import { useState, useEffect, useRef } from "react";

import { useCategories } from "@/lib/CategoriesProvider";
import { findSubCategoryRecursive } from "@/lib/category-utils";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadCategoryTree } from "@/services/categories.service";
import { useParams } from "next/navigation";

interface BreadcrumbItem {
	href: string;
	label: string;
	current?: boolean;
}

export function useBreadcrumbs(query?: string | null, productName?: string) {
	const params = useParams();
	const category = params.category as string;
	const subcategory = params.subcategory as string;
	const segment = params.segment as string;
	const product = params.product as string;
	const { categories } = useCategories();

	// State to store resolved category tree (both slugs and names) when category is __default
	interface ResolvedCategory {
		slug: string;
		name: string;
	}
	const [resolvedCategoryTree, setResolvedCategoryTree] = useState<
		ResolvedCategory[] | null
	>(null);
	const fetchedProductRef = useRef<string | null>(null);

	// Always fetch category tree when we have a product number to get Norwegian names with special characters
	useEffect(() => {
		const fetchCategoryTree = async () => {
			// Fetch if we have a product number and haven't fetched for this product yet
			if (product && fetchedProductRef.current !== product) {
				fetchedProductRef.current = product;
				try {
					const categoryTree = await loadCategoryTree(product);
					if (categoryTree && categoryTree.length > 0) {
						// Extract both slugs and names from category tree (always use Norwegian)
						const resolved: ResolvedCategory[] = categoryTree
							.slice(0, 3)
							.map((cat: any) => {
								// Always use Norwegian name (preserve special characters: å, ø, æ)
								const name =
									cat.nameNo || cat.name_no || cat.nameEn || cat.name_en || "";

								// Convert to slug (same logic as categoryTreeToUrlPath)
								const slug = name
									.toLowerCase()
									.replace(/å/g, "a")
									.replace(/ø/g, "o")
									.replace(/æ/g, "ae")
									.replace(/Å/g, "a")
									.replace(/Ø/g, "o")
									.replace(/Æ/g, "ae")
									.normalize("NFKD")
									.replace(/\s+/g, "-")
									.replace(/[^a-z0-9-]/gi, "")
									.replace(/-+/g, "-")
									.replace(/^-|-$/g, "");

								return { slug, name };
							});
						setResolvedCategoryTree(resolved);
					} else {
						setResolvedCategoryTree([]);
					}
				} catch (error) {
					console.error("Error loading category tree for breadcrumbs:", error);
					setResolvedCategoryTree([]);
				}
			} else if (!product) {
				// Reset when product is not available
				fetchedProductRef.current = null;
				setResolvedCategoryTree(null);
			}
		};

		fetchCategoryTree();
	}, [product]);

	// Always prefer names from resolved category tree (they have Norwegian characters preserved)
	// Use slugs from resolved category tree if available, otherwise use URL params
	const effectiveCategory =
		resolvedCategoryTree && resolvedCategoryTree.length > 0
			? resolvedCategoryTree[0].slug
			: category !== "__default"
				? category
				: null;
	const effectiveSubcategory =
		resolvedCategoryTree && resolvedCategoryTree.length > 1
			? resolvedCategoryTree[1].slug
			: subcategory !== "__default"
				? subcategory
				: null;
	const effectiveSegment =
		resolvedCategoryTree && resolvedCategoryTree.length > 2
			? resolvedCategoryTree[2].slug
			: segment !== "__default"
				? segment
				: null;

	// Always use names from resolved category tree when available (preserves Norwegian characters: å, ø, æ)
	const effectiveCategoryName =
		resolvedCategoryTree && resolvedCategoryTree.length > 0
			? resolvedCategoryTree[0].name
			: null;
	const effectiveSubcategoryName =
		resolvedCategoryTree && resolvedCategoryTree.length > 1
			? resolvedCategoryTree[1].name
			: null;
	const effectiveSegmentName =
		resolvedCategoryTree && resolvedCategoryTree.length > 2
			? resolvedCategoryTree[2].name
			: null;

	// Find category names from categories data to preserve Norwegian characters
	const getCategoryName = (slug: string): string => {
		if (!categories || !slug) return formatUrlToDisplayName(slug);

		// Try to find the category by matching slug directly
		const found = categories.find((cat) => cat.slug === slug);
		if (found) return found.name;

		// Fallback to formatted display name
		return formatUrlToDisplayName(slug);
	};

	const getSubCategoryName = (
		categorySlug: string,
		subcategorySlug: string,
	): string => {
		if (!categories || !categorySlug || !subcategorySlug) {
			return formatUrlToDisplayName(subcategorySlug);
		}

		// Find parent category by slug
		const parentCategory = categories.find((cat) => cat.slug === categorySlug);
		if (!parentCategory) return formatUrlToDisplayName(subcategorySlug);

		// Try to find subcategory by slug first
		const foundBySlug = parentCategory.subcategories?.find(
			(sub) => sub.slug === subcategorySlug,
		);
		if (foundBySlug) return foundBySlug.name;

		// Fallback: find by formatted name (for backwards compatibility)
		const formattedSubCategory = formatUrlToDisplayName(subcategorySlug);
		const found = findSubCategoryRecursive(
			parentCategory.subcategories || [],
			formattedSubCategory,
		);

		return found?.name || formatUrlToDisplayName(subcategorySlug);
	};

	const getSegmentName = (
		categorySlug: string,
		subcategorySlug: string,
		segmentSlug: string,
	): string => {
		if (!categories || !categorySlug || !subcategorySlug || !segmentSlug) {
			return formatUrlToDisplayName(segmentSlug);
		}

		// Find parent category by slug
		const parentCategory = categories.find((cat) => cat.slug === categorySlug);
		if (!parentCategory) return formatUrlToDisplayName(segmentSlug);

		// Find subcategory first
		const subCategory = parentCategory.subcategories?.find(
			(sub) => sub.slug === subcategorySlug,
		);
		if (!subCategory) {
			// Fallback: try to find by formatted name
			const formattedSubCategory = formatUrlToDisplayName(subcategorySlug);
			const foundSub = findSubCategoryRecursive(
				parentCategory.subcategories || [],
				formattedSubCategory,
			);
			if (!foundSub) return formatUrlToDisplayName(segmentSlug);

			// Try to find segment in found subcategory
			const foundSegment = foundSub.subcategories?.find(
				(seg) => seg.slug === segmentSlug,
			);
			if (foundSegment) return foundSegment.name;

			// Fallback: find by formatted name
			const formattedSegment = formatUrlToDisplayName(segmentSlug);
			const found = findSubCategoryRecursive(
				foundSub.subcategories || [],
				formattedSegment,
			);
			return found?.name || formatUrlToDisplayName(segmentSlug);
		}

		// Try to find segment by slug
		const foundSegment = subCategory.subcategories?.find(
			(seg) => seg.slug === segmentSlug,
		);
		if (foundSegment) return foundSegment.name;

		// Fallback: find by formatted name
		const formattedSegment = formatUrlToDisplayName(segmentSlug);
		const found = findSubCategoryRecursive(
			subCategory.subcategories || [],
			formattedSegment,
		);

		return found?.name || formatUrlToDisplayName(segmentSlug);
	};

	const breadcrumbs: BreadcrumbItem[] = [];

	// Only add category if we have a valid one (not __default)
	if (effectiveCategory) {
		// Use name from resolved category tree if available, otherwise look it up
		const categoryLabel =
			effectiveCategoryName || getCategoryName(effectiveCategory);
		breadcrumbs.push({
			href: `/${effectiveCategory}`,
			label: categoryLabel,
		});
	}

	// Add subcategory if we have both category and subcategory
	if (effectiveCategory && effectiveSubcategory) {
		// Use name from resolved category tree if available, otherwise look it up
		const subcategoryLabel =
			effectiveSubcategoryName ||
			getSubCategoryName(effectiveCategory, effectiveSubcategory);
		breadcrumbs.push({
			href: `/${effectiveCategory}/${effectiveSubcategory}`,
			label: subcategoryLabel,
		});
	}

	// Add segment if we have category, subcategory, and segment
	if (effectiveCategory && effectiveSubcategory && effectiveSegment) {
		// Use name from resolved category tree if available, otherwise look it up
		const segmentLabel =
			effectiveSegmentName ||
			getSegmentName(effectiveCategory, effectiveSubcategory, effectiveSegment);
		breadcrumbs.push({
			href: `/${effectiveCategory}/${effectiveSubcategory}/${effectiveSegment}`,
			label: segmentLabel,
		});
	}

	// Add product name if provided
	if (productName) {
		breadcrumbs.push({
			href: "#",
			label: productName,
			current: true,
		});
	}

	return breadcrumbs;
}
