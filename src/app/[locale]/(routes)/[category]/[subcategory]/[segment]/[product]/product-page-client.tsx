"use client";

import { useState } from "react";

import { ProductBreadcrumbs } from "@/components/products/product-breadcrumbs";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductInfo } from "@/components/products/product-info";
import { ProductStockStatus } from "@/components/products/product-stock-status";
import { ProductDetailsTable } from "@/components/products/product-table-details";
import { ProductVariantInfo } from "@/components/products/product-variant-info";
import { RelatedProducts } from "@/components/products/related-products";
import { useGetVariantInfo } from "@/hooks/useGetVariantInfo";
import { useTranslations } from "next-intl";

interface Props {
	locale: string;
	category: string;
	segment: string;
	productData: any;
}

export function ProductPageClient({
	locale,
	category,
	segment,
	productData,
}: Props) {
	const t = useTranslations("Product");
	const [selectedItemNumber, setSelectedItemNumber] = useState(
		productData.items[0]?.itemNumber,
	);

	const { data: variantData, isLoading } = useGetVariantInfo(
		productData.items,
		selectedItemNumber,
	);

	const productImages = Array.isArray(productData.mediaId)
		? productData.mediaId
		: [productData.mediaId];

	return (
		<div className="container mx-auto space-y-12 px-4 py-8">
			<ProductBreadcrumbs
				segment={segment}
				productName={
					locale === "en" ? productData.productNameEn : productData.productName
				}
			/>

			<div className="mb-5 grid grid-cols-12 gap-x-8 gap-y-2">
				<div className="col-span-12 md:col-span-4">
					<ProductGallery images={productImages} />
				</div>

				<div className="col-span-12 flex flex-col gap-2 md:col-span-8">
					<ProductInfo
						name={
							locale === "en"
								? productData.productNameEn
								: productData.productName
						}
						category={category}
						price={productData.price}
						productNumber={productData.productNumber}
						pdfUrl={productData.pdfUrl}
					/>

					<ProductStockStatus
						name={
							locale === "en"
								? productData.productNameEn
								: productData.productName
						}
						availability="På hovedlager"
					/>

					<ProductVariantInfo
						locale={locale}
						variants={productData.items}
						selectedItemNumber={selectedItemNumber}
						onSelectVariant={setSelectedItemNumber}
						variantData={variantData}
						isLoading={isLoading}
						productNumber={productData.productNumber}
					/>
				</div>
			</div>

			<div className="mb-1">
				{variantData && (
					<ProductDetailsTable
						variantData={variantData}
						locale={locale}
						selectedItemNumber={selectedItemNumber}
						onSelectVariant={setSelectedItemNumber}
					/>
				)}
			</div>

			<RelatedProducts
				products={productData.productToProductReference}
				category={category}
			/>
		</div>
	);
}
