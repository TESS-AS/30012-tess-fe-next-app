import CategoryContent from "@/components/category/category-content";
import { fetchCategories } from "@/lib/category-utils";
import { loadFiltersBasedOnCategory } from "@/services/categories.service";
import { searchProducts } from "@/services/product.service";
import { useStore } from "@/store/store";
import { formatUrlToDisplayName } from "@/utils/string-utils";
import { getLocale } from "next-intl/server";

interface CategoryPageProps {
	params: {
		category: string;
	};
}

async function getProductsForCategory(categoryNumber: string) {
	try {
		const response = await searchProducts(
			1, // page
			12, // pageSize
			null, // no searchTerm
			categoryNumber,
			null, // no filters
		);
		console.timeEnd('backend-products-fetch');
		return response.product;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
}

export default async function CategoryPage({ params }: CategoryPageProps) {
	try {
		const { category } = params;
		const locale = await getLocale();
		const formattedCategory = formatUrlToDisplayName(category);

		const categories = await fetchCategories(locale);

		const categoryData = categories.find(
			(cat) => formatUrlToDisplayName(cat.slug) === formattedCategory,
		);

		if (!categoryData) {
			throw new Error("Category not found");
		}

		// Load filters and products in parallel
		const [filters, product] = await Promise.all([
			(async () => {
				const result = await loadFiltersBasedOnCategory(categoryData.groupId);
				return result;
			})(),
			(async () => {
				const result = await getProductsForCategory(categoryData.groupId);
				return result;
			})(),
		]);


		return (
			<CategoryContent
				products={product}
				categoryData={categoryData}
				filters={filters}
			/>
		);
	} catch (error) {
		console.error("Error in CategoryPage:", error);
		throw error;
	}
}
