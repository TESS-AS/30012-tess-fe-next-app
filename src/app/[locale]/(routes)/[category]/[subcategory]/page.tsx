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
		console.time('backend-products-fetch');
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
		const startTime = Date.now();
		console.time('total-page-load');

		// 1. Initial data fetch
		console.time('params-and-locale');
		const { subcategory } = await params;
		const { segment } = await searchParams;
		const locale = await getLocale();
		const formattedSubCategory = formatUrlToDisplayName(subcategory);
		const formattedSegment = segment ? formatUrlToDisplayName(segment) : undefined;
		console.timeEnd('params-and-locale');
		console.log('Time since start:', Date.now() - startTime, 'ms');

		// 2. Categories fetch
		console.time('categories-fetch');
		const categories = await fetchCategories(locale);
		console.timeEnd('categories-fetch');
		console.log('Time since start:', Date.now() - startTime, 'ms');

		// 3. Find subcategory
		console.time('subcategory-find');
		const subCategoryData = findSubCategoryRecursive(
			categories,
			formattedSubCategory,
			formattedSegment
		);
		console.timeEnd('subcategory-find');
		console.log('Time since start:', Date.now() - startTime, 'ms');

		if (!subCategoryData) {
			throw new Error("Subcategory not found");
		}

		// 4. Parallel fetch of filters and products
		console.time('parallel-fetch');
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
		console.timeEnd('parallel-fetch');
		console.log('Time since start:', Date.now() - startTime, 'ms');

		console.timeEnd('total-page-load');
		const totalTime = Date.now() - startTime;
		console.log('Total backend time:', totalTime, 'ms');

		// Add client-side timing measurement
		const clientComponent = (
			<>
				<script dangerouslySetInnerHTML={{ __html: `
					performance.mark('client-render-start');
					document.addEventListener('DOMContentLoaded', () => {
						performance.mark('client-render-end');
						const measurement = performance.measure('client-render', 'client-render-start', 'client-render-end');
						console.log('Client-side render time:', measurement.duration, 'ms');
					});
				`}} />
				<CategoryContent
					products={product}
					categoryData={subCategoryData}
					filters={filters}
					segment={segment}
				/>
			</>
		);

		return clientComponent;

	} catch (error) {
		console.error("Error in SubCategoryPage:", error);
		throw error;
	}
}
