import CategoryContent from "@/components/category/category-content";
import { fetchCategories, findSubCategoryByName } from "@/lib/category-utils";
import { searchProducts } from "@/services/product.service";
import { formatUrlToDisplayName } from "@/utils/string-utils";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { loadFiltersBasedOnCategory } from "@/services/categories.service";

interface SubCategoryPageProps {
	params: Promise<{
		subcategory: string;
	}>;
}

async function getProductsForSubCategory(categoryNumber: string) {
    try {
        return await searchProducts(
            1,          // page
            9,          // pageSize
            null,       // no searchTerm
            categoryNumber,
            null        // no filters
        );
    } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products");
    }
}

async function getFiltersForCategory(categoryId: string) {
    try {
        return await loadFiltersBasedOnCategory(categoryId);
    } catch (error) {
        console.error("Error fetching filters:", error);
        throw new Error("Failed to fetch filters");
    }
}

export default async function SubCategoryPage({
	params,
}: SubCategoryPageProps) {
	try {
		const { subcategory } = await params;
		const locale = await getLocale();
		const formattedSubCategory = formatUrlToDisplayName(subcategory);

		const categories = await fetchCategories(locale);
		const subCategoryData = await findSubCategoryByName(
			categories,
			formattedSubCategory,
		);

		if (!subCategoryData) {
			return notFound();
		}

		const { product } = subCategoryData.groupId
			? await getProductsForSubCategory(subCategoryData.groupId)
			: { product: [] };

		const filters = await getFiltersForCategory(subCategoryData.groupId);

		return (
			<CategoryContent
				products={product}
				categoryData={subCategoryData}
				filters={filters}
			/>
		);
	} catch (error) {
		console.error("Error in SubCategoryPage:", error);
		throw error;
	}
}
