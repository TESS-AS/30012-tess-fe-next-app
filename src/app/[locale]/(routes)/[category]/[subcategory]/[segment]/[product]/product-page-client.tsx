"use client";

import { useState, useEffect } from "react";

import { ProductBreadcrumbs } from "@/components/products/product-breadcrumbs";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductInfo } from "@/components/products/product-info";
import { ProductStockStatus } from "@/components/products/product-stock-status";
import { ProductDetailsTable } from "@/components/products/product-table-details";
import { ProductVariantInfo } from "@/components/products/product-variant-info";
import { RelatedProducts } from "@/components/products/related-products";
import { Separator } from "@/components/ui/separator";
import { useGetVariantInfo } from "@/hooks/useGetVariantInfo";
import { useTranslations } from "next-intl";

interface Props {
	locale: string;
	category: string;
	segment: string;
	productData: any;
	preselectedItemNumber?: string;
	preselectedSapNumber?: string;
}

export function ProductPageClient({
	locale,
	category,
	segment,
	productData,
	preselectedItemNumber,
	preselectedSapNumber,
}: Props) {
	const t = useTranslations("Product");

	const getInitialItemNumber = () => {
		// Priority: SAP number first, then item number
		if (preselectedSapNumber) {
			const itemBySap = productData.items?.find(
				(item: any) =>
					item.sapNumber === preselectedSapNumber ||
					item.itemNumber?.toString() === preselectedSapNumber,
			);
			if (itemBySap) {
				return itemBySap.itemNumber;
			}
		}
		if (preselectedItemNumber) {
			const itemExists = productData.items?.some(
				(item: any) => item.itemNumber === preselectedItemNumber,
			);
			if (itemExists) {
				return preselectedItemNumber;
			}
		}
		return productData.items[0]?.itemNumber;
	};

	const [selectedItemNumber, setSelectedItemNumber] = useState(
		getInitialItemNumber(),
	);

	useEffect(() => {
		if (preselectedSapNumber) {
			const itemBySap = productData.items?.find(
				(item: any) =>
					item.sapNumber === preselectedSapNumber ||
					item.itemNumber?.toString() === preselectedSapNumber,
			);
			if (itemBySap) {
				setSelectedItemNumber(itemBySap.itemNumber);
				return;
			}
		}
		if (preselectedItemNumber) {
			const itemExists = productData.items?.some(
				(item: any) => item.itemNumber === preselectedItemNumber,
			);
			if (itemExists) {
				setSelectedItemNumber(preselectedItemNumber);
			}
		}
	}, [preselectedItemNumber, preselectedSapNumber, productData.items]);

	const { data: variantData, isLoading } = useGetVariantInfo(
		productData.items,
		selectedItemNumber,
	);

	const selectedVariant =
		variantData?.itemVariants?.find(
			(v: any) => v.itemNumber === selectedItemNumber,
		) || null;

	const productImages = Array.isArray(productData.mediaId)
		? productData.mediaId
		: [productData.mediaId];

	console.log(productData, "dataaa");

	return (
		<div className="container mx-auto space-y-12 px-4 pt-8 pb-0">
			<ProductBreadcrumbs
				segment={segment}
				productName={
					locale === "en" ? productData.productNameEn : productData.productName
				}
			/>

			<div className="mb-0 grid grid-cols-12 gap-x-8 gap-y-2">
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
						gtin={selectedVariant?.gtin ?? "-"}
						imageUrl={
							productImages?.[0]?.url ||
							productImages?.[0]?.thumbnail_url ||
							undefined
						}
						application={
							locale === "en"
								? productData.applicationEn
								: productData.applicationNo
						}
						variantData={variantData}
						locale={locale}
					/>

					<ProductStockStatus
						name={
							locale === "en"
								? productData.applicationEn
								: productData.applicationNo
						}
						availability="På hovedlager"
					/>

					<Separator className="mt-3" />

					<ProductVariantInfo
						locale={locale}
						variants={productData.items}
						selectedItemNumber={selectedItemNumber}
						onSelectVariant={setSelectedItemNumber}
						variantData={variantData}
						isLoading={isLoading}
						productNumber={productData.productNumber}
						itemVariantCount={productData.itemVariantCount}
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
				products={variantData?.itemRelatedProducts ?? []}
				category={category}
			/>
		</div>
	);
}
