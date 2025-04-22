import { ProductActions } from "@/components/products/product-actions";
import { ProductDetails } from "@/components/products/product-details";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductInfo } from "@/components/products/product-info";
import { RelatedProducts } from "@/components/products/related-products";
import { Separator } from "@/components/ui/separator";
import { productFetch } from "@/services/product.service";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

interface Params {
	category: string;
	product: string;
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
	const { category, product } = await params;

	const _productData = await getProducts(product);

	const [productData] = _productData;

	if (!productData) {
		return notFound();
	}

	const productImages = Array.isArray(productData.media_id)
		? productData.media_id
		: [productData.media_id];

	// Get localized content
	const localizedContent = {
		name:
			locale === "en" ? productData.product_name_en : productData.product_name,
		description:
			locale === "en" ? productData.short_desc_en : productData.short_desc_no,
		technicalInfo:
			locale === "en"
				? productData.technical_info_en
				: productData.technical_info_no,
		application:
			locale === "en" ? productData.application_en : productData.application_no,
		users: locale === "en" ? productData.users_en : productData.users_no,
		remarks: locale === "en" ? productData.remarks_en : productData.remarks_no,
	};

	return (
		<div className="container mx-auto space-y-12 px-4 py-8">
			<div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
				{/* Product Gallery */}
				<ProductGallery images={productImages} />

				{/* Product Info */}
				<div className="flex flex-col gap-4">
					<ProductInfo
						name={localizedContent.name}
						category={category}
						price={productData.price}
					/>

					<ProductActions items={productData.items} />

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

			{/* Related Products */}
			{productData.product_to_product_reference.length > 0 && (
				<div>
					<Separator className="my-8" />
					<RelatedProducts
						products={productData.product_to_product_reference}
						category={category}
					/>
				</div>
			)}
		</div>
	);
}
