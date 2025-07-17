import CategoryContent from "@/components/category/category-content";
import { FilterCategory } from "@/components/ui/filter";
import { fetchCategories } from "@/lib/category-utils";
import { getSeoMetadata } from "@/lib/seo";
import { formatUrlToDisplayName } from "@/lib/utils";
import { loadFilterParents } from "@/services/categories.service";
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
		const formattedCategory = formatUrlToDisplayName(category);

		const categories = await fetchCategories(locale);
		const categoryData = categories.find(
			(cat) => formatUrlToDisplayName(cat.slug) === formattedCategory,
		);
		const categoryNumber = categoryData?.groupId || null;

		const filtersResponse = await loadFilterParents({
			categoryNumber,
			searchTerm: query || null,
			language: locale,
		});

		const categoryFilters =
			Array.isArray(filtersResponse) && "categoryFilters" in filtersResponse[0]
				? filtersResponse[0].categoryFilters
				: [];

		const filters: FilterCategory[] = filtersResponse.map((item: any) => {
			if ("categoryFilters" in item && "filter" in item) {
				return {
					category: item.category,
					filters: (item.filter as { key: string; productCount: number }[]).map(
						(f) => ({
							key: f.key,
							values: [
								{
									value: f.key,
									productcount: f.productCount,
								},
							],
						}),
					),
				};
			} else {
				return {
					category: item.category,
					categoryNumber: item.categoryNumber,
					filters: (item.filter as { key: string; productCount: number }[]).map(
						(f) => ({
							key: f.key,
							values: [
								{
									value: f.key,
									productcount: f.productCount,
								},
							],
						}),
					),
				};
			}
		});

		return (
			<CategoryContent
				categoryData={categoryData}
				categoryFilters={categoryFilters}
				filters={filters}
				query={query}
			/>
		);
	} catch (error) {
		console.error("Error in CategoryPage:", error);
		throw error;
	}
}
