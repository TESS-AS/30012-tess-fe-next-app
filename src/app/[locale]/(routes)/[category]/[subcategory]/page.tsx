import CategoryContent from "@/components/category/category-content";
import { fetchCategories, findSubCategoryRecursive } from "@/lib/category-utils";
import { loadFiltersBasedOnCategory } from "@/services/categories.service";
import { searchProducts } from "@/services/product.service";
import { useStore } from "@/store/store";
import { formatUrlToDisplayName } from "@/utils/string-utils";
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

async function getProductsForSubCategory(
	categoryNumber: string,
	filters: any = null,
) {
	try {
		const response = await searchProducts(
			1, // page
			12, // pageSize
			null, // no searchTerm
			categoryNumber,
			filters, // no filters
		);
		return response.product;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
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

		const [filters, product] = await Promise.all([
			(async () => {
				console.time('filters-load');
				const result = await loadFiltersBasedOnCategory(subCategoryData.groupId);
				console.timeEnd('filters-load');
				return result;
			})(),
			(async () => {
				console.time('products-fetch');
				const result = await getProductsForSubCategory(subCategoryData.groupId);
				console.timeEnd('products-fetch');
				return result;
			})(),
		]);


		return (

			<CategoryContent
				products={product}
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
