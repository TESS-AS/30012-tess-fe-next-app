import CategoryContent from "@/components/category/category-content";
import { fetchCategories } from "@/lib/category-utils";
import { getSeoMetadata } from "@/lib/seo";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadFilters } from "@/services/categories.service";
import { searchProducts } from "@/services/product.service";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ category: string; locale: string }>;
}) {
	const { category, locale } = await params;
	const t = await getTranslations({ locale, namespace: "Category" });

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

export default async function CategoryPage({
	params,
	searchParams,
}: CategoryPageProps) {
	try {
		const { category } = await params;
		const { query } = await searchParams;
		const locale = await getLocale();
		console.log(locale,"qokla locale")
		const formattedCategory = formatUrlToDisplayName(category);

		const categories = await fetchCategories(locale);

		const categoryData = categories.find(
			(cat) => formatUrlToDisplayName(cat.slug) === formattedCategory,
		);

		const categoryNumber = categoryData?.groupId || null;

		const filters = await loadFilters({
			categoryNumber,
			searchTerm: query || null,
			language: locale,
		});

		return (
			<CategoryContent
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
