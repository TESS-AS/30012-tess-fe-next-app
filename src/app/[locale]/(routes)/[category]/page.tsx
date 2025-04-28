import { ProductGrid } from "@/components/products/product-grid";
import { getSeoMetadata } from "@/lib/seo";
import { mockProducts } from "@/mocks/mockProducts";
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

export default async function CategoryPage({
	params,
}: {
	params: Promise<{ category: string }>;
}) {
	const { category } = await params;

	return (
		<div className="py-8">
			<h1 className="mb-8 text-2xl font-bold capitalize">{category}</h1>
			<ProductGrid initialProducts={mockProducts} />
		</div>
	);
}
