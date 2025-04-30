import CategoryContent from "@/components/category/category-content";
import { fetchCategories, fetchProducts, findSubCategoryRecursive } from "@/lib/category-utils";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadFiltersBasedOnCategory } from "@/services/categories.service";
import { getLocale } from "next-intl/server";
import { getSeoMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; subcategory: string }>;
}) {
	const { locale, subcategory } = await params;
	const t = await getTranslations({ locale, namespace: "category" });

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
		segment?: string;
	}>;
	searchParams: Promise<{
		segment?: string;
	}>;
}

export default async function SubCategoryPage({
	params,
	searchParams,
}: SubCategoryPageProps) {
	try {
		const { subcategory } = await params;
		const { segment } = await searchParams;
		const locale = await getLocale();
		
		const formattedSubCategory = formatUrlToDisplayName(subcategory);
		const formattedSegment = segment ? formatUrlToDisplayName(segment) : undefined;

		const categories = await fetchCategories(locale);
		const subCategoryData = findSubCategoryRecursive(
			categories,
			formattedSubCategory,
			formattedSegment
		);

		if (!subCategoryData) {
			throw new Error("Subcategory not found");
		}

        console.log(subCategoryData.groupId,"qokla")
		const [filters, products] = await Promise.all([
			(async () => {
				console.time('filters-load');
				const result = await loadFiltersBasedOnCategory(subCategoryData.groupId);
				console.timeEnd('filters-load');
				return result;
			})(),
			(async () => {
				console.time('products-fetch');
				const result = await fetchProducts(subCategoryData.groupId, null);
				console.timeEnd('products-fetch');
				return result;
			})(),
		]);
		console.log(segment,"qokla segment")
        console.log(filters,products,"qokla products")


		return (

			<CategoryContent
				products={products}
				categoryData={subCategoryData}
				filters={filters}
				segment={segment}
			/>
		)

	} catch (error) {
		console.error("Error in SubCategoryPage:", error);
		throw error;
	}
}
