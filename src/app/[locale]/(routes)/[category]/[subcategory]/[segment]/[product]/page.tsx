import ProductVariantTable from "@/components/checkout/product-variant-table";
import { ProductActions } from "@/components/products/product-actions";
import { ProductBreadcrumbs } from "@/components/products/product-breadcrumbs";
import { ProductDetails } from "@/components/products/product-details";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductInfo } from "@/components/products/product-info";
import { RelatedProducts } from "@/components/products/related-products";
import { Separator } from "@/components/ui/separator";
import { getSeoMetadata } from "@/lib/seo";
import { mockProducts } from "@/mocks/mockProducts";
import { productFetch } from "@/services/product.service";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

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
}: {
	params: Promise<Params>;
}) {
	const locale = await getLocale();
	const { category, product, segment } = await params;

	const _productData = await getProducts(product);

	const [productData] = _productData;

	console.log("Product Data:", productData);
	if (!productData) {
		return notFound();
	}

	const productImages = Array.isArray(productData.mediaId)
		? productData.mediaId
		: [productData.mediaId];

	// Get localized content
	const localizedContent = {
		name:
			locale === "en" ? productData.productNameEn : productData.productName,
		description:
			locale === "en" ? productData.shortDescEn : productData.shortDescNo,
		technicalInfo:
			locale === "en"
				? productData.technicalInfoEn
				: productData.technicalInfoNo,
		application:
			locale === "en" ? productData.applicationEn : productData.applicationNo,
		users: locale === "en" ? productData.usersEn : productData.usersNo,
		remarks: locale === "en" ? productData.remarksEn : productData.remarksNo,
	};


	return (
		<div className="container mx-auto space-y-12 px-4 py-8">
			<ProductBreadcrumbs
				segment={segment}
				productName={localizedContent.name}
			/>
			<div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
				<ProductGallery images={productImages} />

				<div className="flex flex-col gap-4">
					<ProductInfo
						name={localizedContent.name}
						category={category}
						price={productData.price}
					/>

					<ProductActions 
						items={productData.items} 
						productNumber={productData.product_number}
					/>

					<ProductDetails
						description={localizedContent.description}
						attributes={productData.attributes}
						technicalInfo={localizedContent.technicalInfo}
						application={localizedContent.application}
						users={localizedContent.users}
						remarks={localizedContent.remarks}
					/>
				</div>
			</div>
			<ProductVariantTable
				variants={productData.items}
				productNumber={productData.productNumber}
			/>

			{/* Related Products */}
			{productData.productToProductReference.length > 0 && (
				<div>
					<Separator className="my-8" />
					<RelatedProducts
						products={productData.productToProductReference}
						category={category}
					/>
				</div>
			)}
		</div>
	);
}
