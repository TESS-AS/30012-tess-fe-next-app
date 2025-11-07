// app/[locale]/[category]/[product]/page.tsx
import { getSeoMetadata } from "@/lib/seo";
import { mockProducts } from "@/mocks/mockProducts";
import { productFetch } from "@/services/product.service";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { ProductPageClient } from "./product-page-client";

export async function generateMetadata({
	params,
}: {
	params: Promise<Params>;
}) {
	const { locale, category, product } = await params;
	const t = await getTranslations({ locale, namespace: "Product" });

	const productData = mockProducts.find((p) => p.id === product);

	if (!productData) {
		return getSeoMetadata({
			title: t("notFound"),
			description: t("notFound"),
			path: `/${category}/${product}`,
			locale,
		});
	}

	return getSeoMetadata({
		title: productData.name,
		description: productData.description,
		path: `/${category}/${product}`,
		image: productData.image,
		locale,
	});
}

interface Params {
	locale: string;
	category: string;
	subcategory: string;
	product: string;
	segment: string;
}

async function getProducts(productId: string) {
	try {
		return await productFetch(productId);
	} catch (error) {
		console.error("Error fetching product:", error);
		return [];
	}
}

export default async function ProductPage({
	params,
	searchParams,
}: {
	params: Promise<Params>;
	searchParams: Promise<{ itemNumber?: string }>;
}) {
	const locale = await getLocale();
	const { category, subcategory, product, segment } = await params;
	const { itemNumber } = await searchParams;

	const _productData = await getProducts(product);
	const [productData] = _productData;

	if (!productData) {
		return notFound();
	}

	const t = await getTranslations({ locale, namespace: "Product" });

	return (
		<ProductPageClient
			locale={locale}
			category={category}
			segment={segment}
			productData={productData}
			preselectedItemNumber={itemNumber}
		/>
	);
}
