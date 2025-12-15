"use client";

import ProductVariantTable from "@/components/checkout/product-variant-table";
import { useGetColumnAttributes } from "@/hooks/useGetColumnAttributes";
import { useTranslations } from "next-intl";

interface ProductDetailsTableProps {
	variantData: any;
	productNumber?: string;
	locale: string;
	selectedItemNumber?: string;
	onSelectVariant?: (itemNumber: string) => void;
	onWarehouseChange?: (itemNumber: string, warehouseNumber: string) => void;
}

export function ProductDetailsTable({
	variantData,
	productNumber,
	locale,
	selectedItemNumber,
	onSelectVariant,
	onWarehouseChange,
}: ProductDetailsTableProps) {
	const t = useTranslations("Product");

	const firstVariant = variantData?.itemVariants?.[0]?.itemNumber;

	const { data: columnAttributes, isLoading: loadingAttributes } =
		useGetColumnAttributes(firstVariant);

	const variantCount = variantData.itemVariants?.length || 0;

	return (
		<div
			id="product-table-details"
			className="w-full py-5">
			{variantCount > 0 && (
				<h2 className="mb-6 text-xl">
					<span className="font-semibold"> Tilgjengelige varianter </span> (
					{variantCount})
				</h2>
			)}
			{variantData.itemVariants?.length ? (
				<ProductVariantTable
					variants={variantData.itemVariants}
					productNumber={productNumber || ""}
					hasSearch
					selectedItemNumber={selectedItemNumber}
					onSelectVariant={onSelectVariant}
					columnAttributes={columnAttributes ?? undefined}
					loadingAttributes={loadingAttributes}
					onWarehouseChange={onWarehouseChange}
				/>
			) : (
				<p className="text-gray-500">{t("noVariants")}</p>
			)}
		</div>
	);
}
