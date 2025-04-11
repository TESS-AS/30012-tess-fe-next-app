import { ProductActions } from "@/components/products/product-actions";
import { ProductGallery } from "@/components/products/product-gallery";
import { RelatedProducts } from "@/components/products/related-products";
import { mockProducts } from "@/mocks/mockProducts";
import { getTranslations } from "next-intl/server";

interface Params {
	category: string;
	product: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function ProductPage({
	params,
}: {
	params: Promise<Params>;
}) {
	const t = await getTranslations();
	const { category, product } = await params;

	// Simulate API delay for testing loader state
	await delay(1000);

	const productData = mockProducts.find((p) => p.id === product);

	if (!productData) {
		return <div>{t("product.notFound")}</div>;
	}

	const productImages = [
		{
			id: "1",
			url: productData.image,
			alt: productData.name,
		},
		{
			id: "2",
			url: productData.image,
			alt: `${productData.name} - View 2`,
		},
		{
			id: "3",
			url: productData.image,
			alt: `${productData.name} - View 3`,
		},
	];

	return (
		<div className="container mx-auto space-y-12 px-4 py-8">
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				{/* Product Gallery */}
				<ProductGallery images={productImages} />

				{/* Product Info */}
				<div className="flex flex-col gap-6">
					<div>
						<h1 className="text-2xl font-bold">{productData.name}</h1>
						<p className="text-muted-foreground mt-1 text-sm capitalize">
							{category}
						</p>
					</div>

					<p className="text-primary text-xl font-semibold">
						${productData.price.toFixed(2)}
					</p>

					{/* Product Actions */}
					<ProductActions productId={productData.id} />

					{/* Product Description */}
					<div className="prose max-w-none">
						<h2 className="text-lg font-semibold">
							{t("product.productDescription")}
						</h2>
						<p className="text-muted-foreground">{productData.description}</p>
					</div>
				</div>
			</div>

			{/* Related Products */}
			<RelatedProducts
				currentProductId={productData.id}
				category={category}
				maxItems={4}
			/>
		</div>
	);
}
