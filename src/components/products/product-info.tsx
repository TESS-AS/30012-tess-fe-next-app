"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { generateProductPdf } from "@/utils/generateProductPdf";
import { FileText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

interface ProductInfoProps {
	name: string;
	category: string;
	price?: number;
	pdfUrl?: string;
	productNumber?: string;
	gtin?: string | null;
	imageUrl?: string;
	application?: string;
	variantData?: any;
	locale: string;
}

export function ProductInfo({
	name,
	price,
	pdfUrl,
	productNumber,
	gtin,
	imageUrl,
	application,
	variantData,
	locale,
}: ProductInfoProps) {
	const t = useTranslations("Product");
	const { data: profile } = useGetProfileData();
	const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

	const handleDownloadPdf = async () => {
		if (!variantData) {
			toast(t("noDataAvailable"), {
				type: "warning",
				position: "bottom-right",
				autoClose: 2000,
			});
			return;
		}

		setIsGeneratingPdf(true);

		try {
			const filteredAttributes =
				variantData?.itemTechnicalSpec?.itemAttributes?.filter((attr: any) =>
					locale === "no"
						? attr.language === "Norwegian"
						: attr.language === "English",
				) ?? [];

			const specifications = filteredAttributes.map((attr: any) => ({
				name: attr.name || attr.name_key_language || "",
				value: attr.value_def || "-",
			}));

			let columnAttributes: Record<string, any> | null = null;
			const firstVariantNumber =
				variantData?.itemVariants?.[0]?.itemNumber?.toString();
			if (firstVariantNumber) {
				try {
					const axiosClient = (await import("@/services/axiosClient")).default;
					const response = await axiosClient.get(
						`/columnAttributes/${firstVariantNumber}`,
					);
					columnAttributes = response.data;
				} catch (err) {
					console.warn("Kunne ikke hente kolonneattributter:", err);
				}
			}

			const allAttributeNames = new Set<string>();
			variantData?.itemVariants?.forEach((variant: any) => {
				const itemNumber = variant.itemNumber?.toString();
				const attrs = columnAttributes?.[itemNumber]?.attributes || [];
				attrs.forEach((attr: any) => {
					if (attr.name) {
						allAttributeNames.add(attr.name);
					}
				});
			});

			const visibleAttributeNames = Array.from(allAttributeNames).slice(0, 6);

			const { calculateItemPrice } = await import("@/services/product.service");

			const variantPrices: Record<string, number> = {};
			if (variantData?.itemVariants?.length && profile) {
				try {
					const priceRequests = variantData.itemVariants.map(
						(variant: any) => ({
							itemNumber: variant.itemNumber?.toString() || "",
							quantity: 1,
							warehouseNumber: profile.defaultWarehouseNumber || "",
						}),
					);

					const priceResults = await calculateItemPrice(
						priceRequests,
						profile.defaultCustomerNumber,
						profile.defaultCompanyNumber,
					);

					priceResults?.forEach((result: any) => {
						if (result.itemNumber) {
							variantPrices[result.itemNumber] = result.bestPrice || 0;
						}
					});
				} catch (err) {
					console.warn("Kunne ikke beregne priser:", err);
				}
			}

			const variants =
				variantData?.itemVariants?.map((variant: any) => {
					const itemNumber = variant.itemNumber?.toString() || "-";

					const attrs = columnAttributes?.[itemNumber]?.attributes || [];

					const attributeMap: Record<string, string> = {};
					visibleAttributeNames.forEach((attrName) => {
						const attr = attrs.find((a: any) => a.name === attrName);
						attributeMap[attrName] = attr?.valueDef || "-";
					});

					return {
						itemNumber,
						attributes: attributeMap,
						price: variantPrices[itemNumber] || null,
					};
				}) ?? [];

			const applicationText = application || "";
			const notesText = variantData?.description?.itemRemarks || "";
			const itemSpecText = variantData?.description?.itemSpec
				? Object.values(variantData.description.itemSpec)
						.filter(
							(usp: any) => usp && typeof usp === "string" && usp.trim() !== "",
						)
						.join(" ")
				: "";

			await generateProductPdf({
				name,
				productNumber: productNumber || "-",
				gtin: gtin || null,
				imageUrl,
				application: applicationText,
				notes: notesText || itemSpecText,
				specifications,
				variants,
				visibleAttributeNames: Array.from(visibleAttributeNames),
				locale,
			});

			toast("PDF generert vellykket", {
				type: "success",
				position: "bottom-right",
				autoClose: 2000,
			});
		} catch (error) {
			console.error("Feil ved generering av PDF:", error);
			toast("Feil ved generering av PDF", {
				type: "error",
				position: "bottom-right",
				autoClose: 2000,
			});
		} finally {
			setIsGeneratingPdf(false);
		}
	};

	return (
		<div>
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-semibold">{name}</h1>
				<div className="flex items-center gap-8">
					<Button
						variant="outlineGreen"
						size="sm"
						className="text-sm"
						onClick={handleDownloadPdf}
						disabled={isGeneratingPdf || !variantData}>
						{isGeneratingPdf ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								{"Genererer..."}
							</>
						) : (
							<>
								<FileText className="h-4 w-4" />
								Last ned
							</>
						)}
					</Button>
				</div>
			</div>

			{price && (
				<p className="text-primary mt-2 text-xl font-semibold">
					{formatNorwegianCurrency(price)}
				</p>
			)}
		</div>
	);
}
