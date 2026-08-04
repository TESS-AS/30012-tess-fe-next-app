"use client";

import { useState } from "react";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { calculateItemPrice } from "@/services/product.service";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

interface ProductDocumentsDrawerProps {
	columnAttributes: Record<string, any> | null | undefined;
	selectedItemNumber?: string;
	firstItemNumber?: string;
	locale: string;
	name: string;
	productNumber?: string;
	imageUrl?: string;
	application?: string;
	gtin?: string | null;
	variants?: Array<{ itemNumber?: string }>;
	profile?: { defaultCustomerNumber?: string; defaultCompanyNumber?: string; defaultWarehouseNumber?: string } | null;
	isSapCustomer?: boolean;
}

export function ProductDocumentsDrawer({
	columnAttributes,
	selectedItemNumber,
	firstItemNumber,
	locale,
	name,
	imageUrl,
	application,
	gtin,
	variants = [],
	profile,
	isSapCustomer,
}: ProductDocumentsDrawerProps) {
	const t = useTranslations("Product");
	const [open, setOpen] = useState(false);
	const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

	const currentItemNumber =
		selectedItemNumber?.toString() || firstItemNumber?.toString() || "";
	const hasSDS =
		selectedItemNumber && columnAttributes
			? columnAttributes[selectedItemNumber]?.SDS === "True" ||
				columnAttributes[selectedItemNumber]?.SDS === "true"
			: false;
	const ecoonlineUrl = currentItemNumber
		? `https://app.ecoonline.com/ecosuite/applic/shoplink/shoplink.php?msdsCid=1000435&applicationID=9&msdsLang=1&viewForm=pdf&msdsEr=${currentItemNumber}`
		: "";

	const handleDownloadPdf = async () => {
		if (!columnAttributes || !selectedItemNumber) {
			toast(t("noDataAvailable"), {
				type: "warning",
				position: "bottom-right",
				autoClose: 2000,
			});
			return;
		}

		setIsGeneratingPdf(true);

		try {
			const productAttrs = columnAttributes?.productData?.attributes ?? [];
			const attrsForPdf = productAttrs.filter((attr: any) =>
				locale === "no"
					? attr.language === "Norwegian"
					: attr.language === "English",
			);
			const specifications = attrsForPdf.map((attr: any) => ({
				name: attr.name || attr.name_key_language || "",
				value: attr.value_def || attr.valueDef || "-",
			}));

			const itemNumberForPdf =
				selectedItemNumber?.toString() || firstItemNumber?.toString() || "-";
			const itemVariants = variants ?? [];
			let pdfVariants: Array<{
				itemNumber: string;
				attributes?: Record<string, string>;
				price?: number;
			}> = [];
			let visibleAttributeNames: string[] = [];

			if (itemVariants.length > 0 && columnAttributes) {
				const allAttributeNames = Array.from(
					new Set(
						itemVariants.flatMap(
							(variant: any) =>
								columnAttributes?.[variant.itemNumber]?.attributes?.map(
									(a: any) => a.name,
								) ?? [],
						),
					),
				).filter(
					(nm): nm is string => typeof nm === "string" && nm.trim() !== "",
				);

				const filteredAttributeNames = isSapCustomer
					? allAttributeNames
					: allAttributeNames.filter(
							(nm) =>
								nm.toLowerCase() !== "sap nr" &&
								nm.toLowerCase() !== "sap number",
						);

				visibleAttributeNames = filteredAttributeNames.slice(0, 5);

				const variantPrices: Record<string, number> = {};
				if (profile && itemVariants.length > 0) {
					try {
						const priceRequests = itemVariants.map((variant: any) => ({
							itemNumber: variant.itemNumber?.toString() || "",
							quantity: 1,
							warehouseNumber: profile.defaultWarehouseNumber || "",
						}));
						const priceResults = await calculateItemPrice(
							priceRequests,
							profile.defaultCustomerNumber ?? "",
							profile.defaultCompanyNumber ?? "",
						);
						priceResults?.forEach((result: any) => {
							if (result.itemNumber && result.bestPrice !== undefined) {
								variantPrices[result.itemNumber.toString()] =
									result.bestPrice || 0;
							}
						});
					} catch (err) {
						console.error("Error fetching variant prices for PDF:", err);
					}
				}

				pdfVariants = itemVariants.map((v: any) => {
					const variantItemNumber = v.itemNumber?.toString() || "";
					const attrs = columnAttributes?.[v.itemNumber]?.attributes || [];
					const attributes: Record<string, string> = {};
					attrs.forEach((attr: any) => {
						if (attr.name && attr.valueDef) {
							attributes[attr.name] = attr.valueDef;
						}
					});
					return {
						itemNumber: variantItemNumber,
						attributes,
						price: variantPrices[variantItemNumber] || 0,
					};
				});
			}

			const { generateProductPdf } = await import("@/utils/generateProductPdf");
			await generateProductPdf({
				name,
				itemNumber: itemNumberForPdf,
				gtin: gtin || null,
				imageUrl,
				application: application || "",
				notes:
					columnAttributes?.productData?.remarksNo ??
					columnAttributes?.productData?.remarksEn ??
					"",
				specifications,
				variants: pdfVariants,
				visibleAttributeNames,
				locale,
			});

			toast(
				locale === "no" ? "PDF generert vellykket" : "PDF generated successfully",
				{ type: "success", position: "bottom-right", autoClose: 2000 },
			);
		} catch (error) {
			console.error("Feil ved generering av PDF:", error);
			toast(
				locale === "no" ? "Feil ved generering av PDF" : "Error generating PDF",
				{ type: "error", position: "bottom-right", autoClose: 2000 },
			);
		} finally {
			setIsGeneratingPdf(false);
		}
	};

	const docCount = 1 + (hasSDS && ecoonlineUrl ? 1 : 0);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<button
					type="button"
					className="h-auto w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-normal text-black hover:bg-gray-50">
					{locale === "no"
						? `Dokumentasjon (${docCount})`
						: `Documentation (${docCount})`}
				</button>
			</SheetTrigger>
			<SheetContent
				side="right"
				className="w-full overflow-y-auto sm:max-w-md">
				<SheetHeader>
					<SheetTitle>
						{locale === "no"
							? "Produktinformasjon og dokumenter"
							: "Product information and documents"}
					</SheetTitle>
				</SheetHeader>
				<div className="space-y-4 px-4 pb-6">
					<button
						type="button"
						onClick={handleDownloadPdf}
						disabled={isGeneratingPdf || !columnAttributes}
						className="flex cursor-pointer items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50">
						{isGeneratingPdf ? (
							<Loader2 className="h-5 w-5 animate-spin text-black" />
						) : (
							<FileText className="h-5 w-5 text-black" />
						)}
						<span className="text-sm font-normal text-green-700">
							{locale === "no" ? "Last ned PDF" : "Download PDF"}
						</span>
					</button>

					{hasSDS && ecoonlineUrl && (
						<button
							type="button"
							onClick={() => window.open(ecoonlineUrl, "_blank")}
							className="flex cursor-pointer items-center gap-3 text-left">
							<ExternalLink className="h-5 w-5 text-black" />
							<span className="text-sm font-light text-green-700">
								{locale === "no"
									? "Sikkerhetsdatablad (Ecoonline)"
									: "Safety Data Sheet (Ecoonline)"}
							</span>
						</button>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
