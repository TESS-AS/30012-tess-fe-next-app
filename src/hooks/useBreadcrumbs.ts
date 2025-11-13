"use client";
import { useCategories } from "@/lib/CategoriesProvider";
import { findSubCategoryRecursive } from "@/lib/category-utils";
import { formatUrlToDisplayName } from "@/lib/utils";
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
	const { categories } = useCategories();

	// Find category names from categories data to preserve Norwegian characters
	const getCategoryName = (slug: string): string => {
		if (!categories || !slug) return formatUrlToDisplayName(slug);
		
		// Try to find the category by matching slug directly
		const found = categories.find((cat) => cat.slug === slug);
		if (found) return found.name;
		
		// Fallback to formatted display name
		return formatUrlToDisplayName(slug);
	};

	const getSubCategoryName = (categorySlug: string, subcategorySlug: string): string => {
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

	const breadcrumbs: BreadcrumbItem[] = [
		{
			href: `/${category}`,
			label: getCategoryName(category),
		},
		...(subcategory && subcategory !== "__default"
			? [
					{
						href: `/${category}/${subcategory}`,
						label: getSubCategoryName(category, subcategory),
					},
				]
			: []),
		...(segment && segment !== "__default"
			? [
					{
						href: `/${category}/${subcategory}/${segment}`,
						label: getSegmentName(category, subcategory, segment),
					},
				]
			: []),
		...(productName
			? [
					{
						href: "#",
						label: productName,
						current: true,
					},
				]
			: []),
	];

	return breadcrumbs;
}
