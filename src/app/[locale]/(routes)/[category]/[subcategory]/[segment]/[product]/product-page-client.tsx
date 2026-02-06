"use client";

import { useState, useEffect } from "react";

import { ProductBreadcrumbs } from "@/components/products/product-breadcrumbs";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductInfo } from "@/components/products/product-info";
import { useGetColumnAttributes } from "@/hooks/useGetColumnAttributes";
import { useProductFetch } from "@/hooks/useProductFetch";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";

// Lazy load heavy components (variant table, related products) to reduce product page bundle
const ProductDetailsTable = dynamic(
	() =>
		import("@/components/products/product-table-details").then((m) => ({
			default: m.ProductDetailsTable,
		})),
	{ ssr: true, loading: () => <div className="min-h-[200px] animate-pulse rounded-lg bg-gray-100" /> },
);

const RelatedProducts = dynamic(
	() =>
		import("@/components/products/related-products").then((m) => ({
			default: m.RelatedProducts,
		})),
	{ ssr: false, loading: () => <div className="min-h-[280px]" /> },
);

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

	const firstVariant = productData?.items?.[0]?.itemNumber;
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
		productData?.items?.find(
			(item: { itemNumber?: string }) => item.itemNumber === selectedItemNumber,
		) ?? null;

	// Handle loading state
	if (isLoading) {
		return (
			<div className="container mx-auto flex min-h-screen items-center justify-center px-4">
				<Loader2 className="text-primary h-8 w-8 animate-spin" />
			</div>
		);
	}

	// Handle error state or no product found
	if (error || !productData) {
		notFound();
	}

	const getProductImages = () => {
		// Variant-level mediaId from columnAttributes (per itemNumber) – API returns array per variant
		const selectedItem =
			selectedItemNumber && columnAttributes?.[selectedItemNumber];
		const selectedMedia =
			selectedItem && !Array.isArray(selectedItem)
				? selectedItem.mediaId
				: undefined;
		if (selectedMedia && Array.isArray(selectedMedia) && selectedMedia.length > 0) {
			return selectedMedia;
		}
		const firstItem = firstVariant && columnAttributes?.[firstVariant];
		const firstMedia =
			firstItem && !Array.isArray(firstItem) ? firstItem.mediaId : undefined;
		if (firstMedia && Array.isArray(firstMedia) && firstMedia.length > 0) {
			return firstMedia;
		}
		// Product-level mediaId from columnAttributes – API returns single object
		const productMedia = columnAttributes?.productData?.mediaId;
		if (productMedia) {
			return Array.isArray(productMedia)
				? productMedia
				: [productMedia as { url: string; thumbnail_url?: string }];
		}
		// Fallback to product fetch mediaId
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
						gtin={
							(() => {
								const item =
									selectedItemNumber &&
									columnAttributes?.[selectedItemNumber];
								if (item && !Array.isArray(item) && "GTIN" in item)
									return item.GTIN ?? null;
								return selectedVariant?.gtin ?? null;
							})()
						}
						imageUrl={
							productImages?.[0]?.url ||
							(productImages?.[0] as { thumbnail_url?: string } | undefined)
								?.thumbnail_url ||
							undefined
						}
						application={
							locale === "en"
								? productData.applicationEn
								: productData.applicationNo
						}
						locale={locale}
						selectedItemNumber={selectedItemNumber}
						columnAttributes={columnAttributes ?? undefined}
						variants={productData.items ?? []}
						selectedWarehouse={selectedWarehouse[selectedItemNumber || ""]}
						onWarehouseChange={handleWarehouseChange}
					/>

					{/*<ProductVariantInfo*/}
					{/*	locale={locale}*/}
					{/*	variants={productData.items}*/}
					{/*	selectedItemNumber={selectedItemNumber}*/}
					{/*	onSelectVariant={setSelectedItemNumber}*/}
					{/*	variantData={variantData}*/}
					{/*	isLoading={isLoadingVariant}*/}
					{/*	productNumber={productData.productNumber}*/}
					{/*	itemVariantCount={productData.itemVariantCount}*/}
					{/*	selectedWarehouse={selectedWarehouse[selectedItemNumber || ""]}*/}
					{/*	columnAttributes={columnAttributes ?? undefined}*/}
					{/*/>*/}
				</div>
			</div>

			<div className="mb-1">
				{productData.items && productData.items.length > 0 && (
					<ProductDetailsTable
						variants={productData.items}
						columnAttributes={columnAttributes ?? undefined}
						productNumber={productData.productNumber}
						locale={locale}
						selectedItemNumber={selectedItemNumber}
						onSelectVariant={setSelectedItemNumber}
						onWarehouseChange={handleWarehouseChange}
					/>
				)}
			</div>

			<RelatedProducts
				products={[]}
				category={category}
			/>
		</div>
	);
}
