import CategoryContent from "@/components/category/category-content";
import {
	fetchCategories,
	findSubCategoryRecursive,
} from "@/lib/category-utils";
import { getSeoMetadata } from "@/lib/seo";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadFilters } from "@/services/categories.service";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; segment: string }>;
}) {
	const { locale, segment } = await params;
	const t = await getTranslations({ locale, namespace: "Category" });

	return await getSeoMetadata({
		title: `${segment}`,
		description: t("viewAll"),
		path: `/segment/${segment}`,
		locale,
	});
}

interface SegmentPageProps {
	params: Promise<{
		category: string;
		subcategory: string;
		segment: string;
	}>;
}

export default async function SegmentPage({ params }: SegmentPageProps) {
	try {
		const { category, subcategory, segment } = await params;
		const locale = await getLocale();

		const formattedSubCategory = formatUrlToDisplayName(subcategory);
		const formattedSegment = segment
			? formatUrlToDisplayName(segment)
			: undefined;

		const categories = await fetchCategories(locale);
		console.log(categories, "qokla categories");
		console.log(formattedSubCategory, "qokla formattedSubCategory");

		const subCategoryData = findSubCategoryRecursive(
			categories,
			formattedSubCategory,
			formattedSegment,
		);
		console.log(subCategoryData, "qokla subcat");

		if (!subCategoryData) {
			throw new Error("Segment not found");
		}

		const categoryNumber = subCategoryData?.groupId || null;

		const filters = await loadFilters({
			categoryNumber,
			searchTerm: null,
			language: locale,
		});

		return (
			<CategoryContent
				categoryData={subCategoryData}
				filters={filters}
				segment={segment}
			/>
		);
	} catch (error) {
		console.error("Error in SegmentPage:", error);
		throw error;
	}
}
