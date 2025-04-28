import CategoryContent from "@/components/category/category-content";
import { fetchCategories, fetchProducts, findSubCategoryRecursive } from "@/lib/category-utils";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadFiltersBasedOnCategory } from "@/services/categories.service";
import { searchProducts } from "@/services/product.service";
import { getLocale } from "next-intl/server";

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
		const [filters, product] = await Promise.all([
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


		return (

			<CategoryContent
				products={product}
				categoryData={subCategoryData}
				filters={filters}
				query={segment}
			/>
		)

	} catch (error) {
		console.error("Error in SubCategoryPage:", error);
		throw error;
	}
}
