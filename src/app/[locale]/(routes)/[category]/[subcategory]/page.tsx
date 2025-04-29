import { ProductGrid } from "@/components/products/product-grid";
import { getSeoMetadata } from "@/lib/seo";
import { mockProducts } from "@/mocks/mockProducts";
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

export default async function SubCategoryPage({
	params,
}: {
	params: Promise<{ subcategory: string }>;
}) {
	const { subcategory } = await params;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-8 text-2xl font-bold capitalize">{subcategory}</h1>
			<ProductGrid initialProducts={mockProducts} />
		</div>
	);
}
