"use client";

import { useState, useEffect } from "react";

import { ProductBreadcrumbs } from "@/components/products/product-breadcrumbs";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductInfo } from "@/components/products/product-info";
import { ProductDetailsTable } from "@/components/products/product-table-details";
import { ProductVariantInfo } from "@/components/products/product-variant-info";
import { RelatedProducts } from "@/components/products/related-products";
import { Separator } from "@/components/ui/separator";
import { useGetColumnAttributes } from "@/hooks/useGetColumnAttributes";
import { useGetVariantInfo } from "@/hooks/useGetVariantInfo";
import { useProductFetch } from "@/hooks/useProductFetch";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";

interface Props {
	locale: string;
	category: string;
	segment: string;
	productId: string;
	preselectedItemNumber?: string;
	preselectedSapNumber?: string;
}

export function ProductPageClient({
	locale,
	category,
	segment,
	productId,
	preselectedItemNumber,
	preselectedSapNumber,
}: Props) {
	const t = useTranslations("Product");
	const {
		data: productDataArray,
		isLoading,
		error,
	} = useProductFetch({
		productName: productId,
	});

	console.log(productDataArray, "productDataArray");

	// Extract the first product from the array (productFetch returns an array)
	const productData = productDataArray?.[0];

	const [selectedItemNumber, setSelectedItemNumber] = useState<
		string | undefined
	>(undefined);
	const [selectedWarehouse, setSelectedWarehouse] = useState<
		Record<string, string>
	>({});

	useEffect(() => {
		if (!productData?.items || productData.items.length === 0) return;

		// Priority: SAP number first, then item number, then first item
		if (preselectedSapNumber) {
			const itemBySap = productData.items.find(
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
			const itemExists = productData.items.some(
				(item: any) => item.itemNumber === preselectedItemNumber,
			);
			if (itemExists) {
				setSelectedItemNumber(preselectedItemNumber);
				return;
			}
		}
		// If no preselection and no current selection, select the first item
		if (!selectedItemNumber) {
			setSelectedItemNumber(productData.items[0]?.itemNumber);
		}
	}, [
		preselectedItemNumber,
		preselectedSapNumber,
		productData?.items,
		selectedItemNumber,
	]);

	const { data: variantData, isLoading: isLoadingVariant } = useGetVariantInfo(
		productData?.items || [],
		selectedItemNumber,
	);

	const firstVariant = variantData?.itemVariants?.[0]?.itemNumber;
	const { data: columnAttributes } = useGetColumnAttributes(firstVariant);

	const handleWarehouseChange = (
		itemNumber: string,
		warehouseNumber: string,
	) => {
		setSelectedWarehouse((prev) => ({
			...prev,
			[itemNumber]: warehouseNumber,
		}));
	};

	const selectedVariant =
		variantData?.itemVariants?.find(
			(v: any) => v.itemNumber === selectedItemNumber,
		) || null;

	// Handle loading state
	if (isLoading) {
		return (
			<div className="container mx-auto flex min-h-screen items-center justify-center px-4">
				<Loader2 className="text-primary h-8 w-8 animate-spin" />
			</div>
		);
	}

	console.log(productData, "productDataaa");

	// Handle error state or no product found
	if (error || !productData) {
		notFound();
	}

	const getProductImages = () => {
		if (variantData?.itemHeader?.itemImage) {
			const itemImage = variantData.itemHeader.itemImage;

			if (Array.isArray(itemImage)) {
				return itemImage.length > 0 ? itemImage : [];
			}

			if (itemImage && typeof itemImage === "object" && itemImage.url) {
				return [itemImage];
			}

			if (typeof itemImage === "string" && itemImage.trim() !== "") {
				return [
					{
						url: itemImage,
						filename: "",
						picture_type: "MainImage",
						thumbnail_url: itemImage,
					},
				];
			}
		}

		return Array.isArray(productData.mediaId)
			? productData.mediaId
			: productData.mediaId
				? [productData.mediaId]
				: [];
	};

	const productImages = getProductImages();

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
						selectedItemNumber={selectedItemNumber}
						shortDescription={
							variantData?.itemHeader?.extShortText?.[1]?.value_def
						}
					/>

					<Separator className="mt-3" />

					<ProductVariantInfo
						locale={locale}
						variants={productData.items}
						selectedItemNumber={selectedItemNumber}
						onSelectVariant={setSelectedItemNumber}
						variantData={variantData}
						isLoading={isLoadingVariant}
						productNumber={productData.productNumber}
						itemVariantCount={productData.itemVariantCount}
						selectedWarehouse={selectedWarehouse[selectedItemNumber || ""]}
						columnAttributes={columnAttributes ?? undefined}
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
						onWarehouseChange={handleWarehouseChange}
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
