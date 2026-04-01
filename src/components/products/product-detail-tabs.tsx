"use client";

import { useState, useMemo, useEffect } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SAP_CUSTOMER } from "@/constants/checkout";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { calculateItemPrice } from "@/services/product.service";
import { useProductTabs } from "@/stores/useProductTabs";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

interface ProductDetailTabsProps {
	columnAttributes: Record<string, any> | null;
	selectedItemNumber?: string;
	locale: string;
	name: string;
	productNumber?: string;
	imageUrl?: string;
	application?: string;
	gtin?: string | null;
	variants?: Array<{ itemNumber?: string }>;
	firstItemNumber?: string;
}

export function ProductDetailTabs({
	columnAttributes,
	selectedItemNumber,
	locale,
	name,
	productNumber,
	imageUrl,
	application,
	gtin,
	variants = [],
	firstItemNumber,
}: ProductDetailTabsProps) {
	const t = useTranslations("Product");
	const { data: profile } = useGetProfileData();
	const { activeTab, setActiveTab } = useProductTabs();
	const isSapCustomer = profile?.defaultCustomerNumber === SAP_CUSTOMER;

	const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
	const [showAllAttributes, setShowAllAttributes] = useState(false);
	const [showAllProductInfo, setShowAllProductInfo] = useState(false);

	const allAttributes = useMemo(() => {
		if (!selectedItemNumber || !columnAttributes) return [];

		const attrs = columnAttributes[selectedItemNumber]?.attributes || [];
		return attrs.filter((attr: any) =>
			locale === "no"
				? attr.language === "Norwegian"
				: attr.language === "English",
		);
	}, [selectedItemNumber, columnAttributes, locale]);

	const filteredAttributes = useMemo(() => {
		if (!columnAttributes?.productData?.attributes) return [];
		return columnAttributes.productData.attributes.filter((attr: any) =>
			locale === "no"
				? attr.language === "Norwegian"
				: attr.language === "English",
		);
	}, [columnAttributes?.productData?.attributes, locale]);

	const hasSDS = useMemo(() => {
		if (!selectedItemNumber || !columnAttributes) return false;
		const sds = columnAttributes[selectedItemNumber]?.SDS;
		return sds === "True" || sds === "true";
	}, [selectedItemNumber, columnAttributes]);

	const currentItemNumber =
		selectedItemNumber?.toString() || firstItemNumber?.toString() || "";
	const ecoonlineUrl = currentItemNumber
		? `https://app.ecoonline.com/ecosuite/applic/shoplink/shoplink.php?msdsCid=1000435&applicationID=9&msdsLang=1&viewForm=pdf&msdsEr=${currentItemNumber}`
		: "";

	const documentCount = 1 + (hasSDS && ecoonlineUrl ? 1 : 0);

	// Ensure the first available tab is active on load
	const firstAvailableTab = useMemo(() => {
		if (allAttributes.length > 0) return "attributes";
		if (filteredAttributes.length > 0) return "produktinfo";
		if (documentCount > 0) return "documents";
		return null;
	}, [allAttributes.length, filteredAttributes.length, documentCount]);

	useEffect(() => {
		if (firstAvailableTab) {
			setActiveTab(firstAvailableTab);
		}
	}, [firstAvailableTab, setActiveTab]);

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
					(name): name is string =>
						typeof name === "string" && name.trim() !== "",
				);

				const filteredAttributeNames = isSapCustomer
					? allAttributeNames
					: allAttributeNames.filter(
							(name) =>
								name.toLowerCase() !== "sap nr" &&
								name.toLowerCase() !== "sap number",
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
							profile.defaultCustomerNumber,
							profile.defaultCompanyNumber,
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
				locale === "no"
					? "PDF generert vellykket"
					: "PDF generated successfully",
				{
					type: "success",
					position: "bottom-right",
					autoClose: 2000,
				},
			);
		} catch (error) {
			console.error("Feil ved generering av PDF:", error);
			toast(
				locale === "no" ? "Feil ved generering av PDF" : "Error generating PDF",
				{
					type: "error",
					position: "bottom-right",
					autoClose: 2000,
				},
			);
		} finally {
			setIsGeneratingPdf(false);
		}
	};

	if (
		allAttributes.length === 0 &&
		filteredAttributes.length === 0 &&
		documentCount === 0
	) {
		return null;
	}

	return (
		<div
			className="mt-8 mb-6 w-full overflow-hidden rounded-lg border border-gray-200 bg-white"
			aria-label={locale === "no" ? "Produktdetaljer" : "Product details"}>
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full pt-2">
				<TabsList className="slim-scrollbar flex h-auto w-full min-w-0 justify-start gap-6 overflow-x-auto rounded-none border-b border-gray-200 bg-transparent px-6 py-0">
					{allAttributes.length > 0 && (
						<TabsTrigger
							value="attributes"
							className="shrink-0 whitespace-nowrap justify-start rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-left text-sm font-medium text-gray-500 shadow-none data-[state=active]:border-green-900 data-[state=active]:bg-transparent data-[state=active]:text-green-900 data-[state=active]:shadow-none">
							{locale === "no" ? "Variantinfo" : "Attributes"}
						</TabsTrigger>
					)}
					{filteredAttributes.length > 0 && (
						<TabsTrigger
							value="produktinfo"
							className="shrink-0 whitespace-nowrap justify-start rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-left text-sm font-medium text-gray-500 shadow-none data-[state=active]:border-green-900 data-[state=active]:bg-transparent data-[state=active]:text-green-900 data-[state=active]:shadow-none">
							{locale === "no" ? "Produktinfo" : "Product Info"}
						</TabsTrigger>
					)}
					{documentCount > 0 && (
						<TabsTrigger
							value="documents"
							className="shrink-0 whitespace-nowrap justify-start rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-left text-sm font-medium text-gray-500 shadow-none data-[state=active]:border-green-900 data-[state=active]:bg-transparent data-[state=active]:text-green-900 data-[state=active]:shadow-none">
							{locale === "no"
								? `Dokumentasjon (${documentCount})`
								: `Documents (${documentCount})`}
						</TabsTrigger>
					)}
				</TabsList>

				{allAttributes.length > 0 && (
					<TabsContent
						value="attributes"
						className="mt-0">
						<div className="p-6">
							<div className="grid grid-cols-1 gap-x-8 gap-y-3 lg:grid-cols-2">
								{(showAllAttributes
									? allAttributes
									: allAttributes.slice(0, 10)
								).map((attr: any, index: number) => (
									<div key={attr.attribute_identifier || index}>
										<div className="grid grid-cols-2 gap-4 py-3">
											<dt className="text-left text-sm font-medium text-gray-900">
												{attr.name || attr.nameKeyLanguage || "-"}
											</dt>
											<dd className="text-right text-sm font-light text-gray-500 lg:pr-24">
												{attr.valueDef || attr.value_def || "-"}
											</dd>
										</div>
										<hr className="border-gray-200" />
									</div>
								))}
							</div>
							{allAttributes.length > 10 && (
								<div className="mt-4 flex justify-center">
									<button
										type="button"
										onClick={() => setShowAllAttributes(!showAllAttributes)}
										className="text-sm font-medium text-green-600 hover:underline">
										{showAllAttributes
											? locale === "no"
												? "Vis mindre"
												: "Show less"
											: locale === "no"
												? `Vis ${allAttributes.length - 10} flere`
												: `Show ${allAttributes.length - 10} more`}
									</button>
								</div>
							)}
						</div>
					</TabsContent>
				)}

				{filteredAttributes.length > 0 && (
					<TabsContent
						value="produktinfo"
						className="mt-0">
						<div className="p-6">
							<div className="grid grid-cols-1 gap-x-8 gap-y-3 lg:grid-cols-2">
								{(showAllProductInfo
									? filteredAttributes
									: filteredAttributes.slice(0, 10)
								).map((attr: any, index: number) => (
									<div key={attr.attribute_identifier || index}>
										<div className="grid grid-cols-2 gap-4 py-3">
											<dt className="text-left text-sm font-medium text-gray-900">
												{attr.name || attr.nameKeyLanguage || "-"}
											</dt>
											<dd className="text-right text-sm font-light text-gray-500 lg:pr-24">
												{attr.valueDef || attr.value_def || "-"}
											</dd>
										</div>
										<hr className="border-gray-200" />
									</div>
								))}
							</div>
							{filteredAttributes.length > 10 && (
								<div className="mt-4 flex justify-center">
									<button
										type="button"
										onClick={() => setShowAllProductInfo(!showAllProductInfo)}
										className="text-sm font-medium text-green-600 hover:underline">
										{showAllProductInfo
											? locale === "no"
												? "Vis mindre"
												: "Show less"
											: locale === "no"
												? `Vis ${filteredAttributes.length - 10} flere`
												: `Show ${filteredAttributes.length - 10} more`}
									</button>
								</div>
							)}
						</div>
					</TabsContent>
				)}

				{documentCount > 0 && (
					<TabsContent
						value="documents"
						className="mt-0">
						<div className="space-y-4 p-6">
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
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
