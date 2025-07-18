import CategoryContent from "@/components/category/category-content";
import {
	fetchCategories,
	fetchProducts,
	findSubCategoryRecursive,
} from "@/lib/category-utils";
import { getSeoMetadata } from "@/lib/seo";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadFilterParents, loadFilters } from "@/services/categories.service";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; subcategory: string }>;
}) {
	const { locale, subcategory } = await params;
	const t = await getTranslations({ locale, namespace: "Category" });

	return await getSeoMetadata({
		title: `${subcategory}`,
		description: t("viewAll"),
		path: `/subcategory/${subcategory}`,
		locale,
	});
}

interface SubCategoryPageProps {
	params: Promise<{
		subcategory: string;
	}>;
}

export default async function SubCategoryPage({
	params,
}: SubCategoryPageProps) {
	try {
		const { subcategory } = await params;
		const locale = await getLocale();

		const formattedSubCategory = formatUrlToDisplayName(subcategory);

		const categories = await fetchCategories(locale);
		const subCategoryData = findSubCategoryRecursive(
			categories,
			formattedSubCategory,
		);

		if (!subCategoryData) {
			throw new Error("Subcategory not found");
		}

		const categoryNumber = subCategoryData?.groupId || null;

		const filters = await loadFilterParents({
			categoryNumber,
			searchTerm: null,
			language: "no",
		});

		return (
			<CategoryContent
				categoryData={subCategoryData}
				filters={filters}
			/>
		);
	} catch (error) {
		console.error("Error in SubCategoryPage:", error);
		throw error;
	}
}
