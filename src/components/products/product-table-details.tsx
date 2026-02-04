"use client";

import ProductVariantTable from "@/components/checkout/product-variant-table";
import { useTranslations } from "next-intl";

interface ProductDetailsTableProps {
	variants: Array<{ itemNumber?: string }>;
	columnAttributes?: Record<string, unknown> | null;
	productNumber?: string;
	locale: string;
	selectedItemNumber?: string;
	onSelectVariant?: (itemNumber: string) => void;
	onWarehouseChange?: (itemNumber: string, warehouseNumber: string) => void;
}

export function ProductDetailsTable({
	variants,
	columnAttributes,
	productNumber,
	locale,
	selectedItemNumber,
	onSelectVariant,
	onWarehouseChange,
}: ProductDetailsTableProps) {
	const t = useTranslations("Product");
	const variantCount = variants?.length ?? 0;

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
			{variantCount > 0 ? (
				<ProductVariantTable
					variants={variants as any}
					productNumber={productNumber || ""}
					hasSearch
					selectedItemNumber={selectedItemNumber}
					onSelectVariant={onSelectVariant}
					columnAttributes={columnAttributes ?? undefined}
					loadingAttributes={false}
					onWarehouseChange={onWarehouseChange}
				/>
			) : (
				<p className="text-gray-500">{t("noVariants")}</p>
			)}
		</div>
	);
}
