import CategoryContent from "@/components/category/category-content";
import { fetchCategories, fetchProducts } from "@/lib/category-utils";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadFiltersBasedOnCategory } from "@/services/categories.service";
import { getLocale } from "next-intl/server";
import { getSeoMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ category: string; locale: string }>;
}) {
	const { category, locale } = await params;
	const t = await getTranslations({ locale, namespace: "category" });

	return await getSeoMetadata({
		title: category,
		description: t("viewAll"),
		path: `/category/${category}`,
		locale,
	});
}

interface CategoryPageProps {
	params: Promise<{
		category: string;
	}>;
	searchParams: Promise<{
		query?: string;
	}>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
	try {
		const { category } = await params;
		const { query } = await searchParams;
		const locale = await getLocale();
		const formattedCategory = formatUrlToDisplayName(category);

        console.log(query,"qokla query")

		const categories = await fetchCategories(locale);

		const categoryData = categories.find(
			(cat) => formatUrlToDisplayName(cat.slug) === formattedCategory,
		);

		// Only throw if we have neither category nor query
		// if (!categoryData && !query) {
		// 	throw new Error("Neither category nor search query found");
		// }

		const [filters, products] = await Promise.all([
			// Only fetch filters if we have a category
			categoryData 
				? loadFiltersBasedOnCategory(categoryData.groupId, null)
				: loadFiltersBasedOnCategory(null, query),
			// Fetch products based on either search query or category
			query
				? fetchProducts(null, query)
				: fetchProducts(categoryData?.groupId || null, null)
		]);

        console.log(products,"qokla products")

		return (
			<CategoryContent
				products={products}
				categoryData={categoryData}
				filters={filters}
                query={query}
			/>
		);
	} catch (error) {
		console.error("Error in CategoryPage:", error);
		throw error;
	}
}
