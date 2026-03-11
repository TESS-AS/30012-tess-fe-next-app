"use client";

import ProductVariantTable from "@/components/checkout/product-variant-table";
import { useTranslations } from "next-intl";

interface ProductDetailsTableProps {
	variants: Array<{ itemNumber?: string }>;
	columnAttributes?: Record<string, unknown> | null;
	loadingAttributes?: boolean;
	productNumber?: string;
	locale: string;
	selectedItemNumber?: string;
	onSelectVariant?: (itemNumber: string) => void;
	onWarehouseChange?: (itemNumber: string, warehouseNumber: string) => void;
	onQuantityChange?: (itemNumber: string, quantity: number) => void;
}

export function ProductDetailsTable({
	variants,
	columnAttributes,
	loadingAttributes = false,
	productNumber,
	locale,
	selectedItemNumber,
	onSelectVariant,
	onWarehouseChange,
	onQuantityChange,
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
				<>
					<ProductVariantTable
						variants={variants as any}
						productNumber={productNumber || ""}
						hasSearch
						hasQuantity
						hasAddToCart
						selectedItemNumber={selectedItemNumber}
						onSelectVariant={onSelectVariant}
						columnAttributes={columnAttributes ?? undefined}
						loadingAttributes={loadingAttributes}
						onWarehouseChange={onWarehouseChange}
						onQuantityChange={onQuantityChange}
					/>
					<p className="mt-5 flex items-center gap-2 text-sm font-light text-[#5A615D]">
						<span className="flex h-3 w-3 items-center justify-center rounded-full bg-green-900 text-[10px] text-white">
							i
						</span>
						<span>{t("stockInfo")}</span>
					</p>
				</>
			) : (
				<p className="text-gray-500">{t("noVariants")}</p>
			)}
		</div>
	);
}
