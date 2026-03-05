"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetColumnAttributes } from "@/hooks/useGetColumnAttributes";
import type { GetAssetsResponse } from "@/types/assets.types";
import {
	ExternalLink,
	FileText,
	Files,
	ImageIcon,
	Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

interface ProductDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	hoseDetails: GetAssetsResponse | null;
	itemNumber?: string; // Optional itemNumber to fetch columnAttributes for specific component
}

export default function ProductDetailsModal({
	isOpen,
	onClose,
	hoseDetails,
	itemNumber,
}: ProductDetailsModalProps) {
	const t = useTranslations("ProductDetailsModal");
	const [activeTab, setActiveTab] = useState<string>("produktinfo");
	const [showFullDescription, setShowFullDescription] = useState(false);
	const [copiedGtin, setCopiedGtin] = useState(false);
	const [copiedSap, setCopiedSap] = useState(false);
	const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

	const hoseLine = hoseDetails?.hoseLine;
	const hoseData = hoseDetails?.hoseData;
	const customerData = hoseDetails?.customerData;

	// Use provided itemNumber prop, or fallback to insert1, ferrule1, insert2, or ferrule2
	const itemNumberForAttributes =
		itemNumber && itemNumber.trim() !== ""
			? itemNumber.trim()
			: hoseData?.insert1 != null && String(hoseData.insert1).trim() !== ""
				? String(hoseData.insert1).trim()
				: hoseData?.ferrule1 != null && String(hoseData.ferrule1).trim() !== ""
					? String(hoseData.ferrule1).trim()
					: hoseData?.insert2 != null && String(hoseData.insert2).trim() !== ""
						? String(hoseData.insert2).trim()
						: hoseData?.ferrule2 != null &&
							  String(hoseData.ferrule2).trim() !== ""
							? String(hoseData.ferrule2).trim()
							: undefined;

	const {
		data: columnAttributes,
		isLoading: isLoadingAttributes,
		isFetching: isFetchingAttributes,
	} = useGetColumnAttributes(itemNumberForAttributes);

	const isAttributesLoading =
		(isLoadingAttributes || isFetchingAttributes) && !!itemNumberForAttributes;

	// Get product name from columnAttributes (Norwegian)
	const productName =
		columnAttributes?.productData?.productNameNo ||
		columnAttributes?.productData?.productNameEn ||
		hoseLine?.itemDescription ||
		"—";

	// Get short and long descriptions from columnAttributes
	const shortDescription =
		columnAttributes?.productData?.shortDescNo ||
		columnAttributes?.productData?.shortDescEn ||
		"";
	const longDescription =
		columnAttributes?.productData?.longDescNo ||
		columnAttributes?.productData?.longDescEn ||
		"";
	const hasShortDescription = shortDescription.trim() !== "";
	const hasLongDescription = longDescription.trim() !== "";
	const shouldShowToggle =
		hasShortDescription &&
		hasLongDescription &&
		shortDescription !== longDescription;

	// GTIN from columnAttributes
	const gtinFromAttributes =
		itemNumberForAttributes && columnAttributes?.[itemNumberForAttributes]
			? (columnAttributes[itemNumberForAttributes] as { GTIN?: string | null })
					?.GTIN
			: null;
	const gtin =
		gtinFromAttributes && gtinFromAttributes.trim() !== ""
			? gtinFromAttributes.trim()
			: null;
	const gtinDisplay = gtin;
	const sapNumber =
		customerData?.artNumber != null &&
		String(customerData.artNumber).trim() !== ""
			? String(customerData.artNumber)
			: null;

	// Get product image from columnAttributes if available
	const productImage =
		itemNumberForAttributes && columnAttributes?.[itemNumberForAttributes]
			? (
					columnAttributes[itemNumberForAttributes] as {
						mediaId?: Array<{ url: string; thumbnail_url?: string }>;
					}
				)?.mediaId?.[0]
			: columnAttributes?.productData?.mediaId
				? Array.isArray(columnAttributes.productData.mediaId)
					? columnAttributes.productData.mediaId[0]
					: (columnAttributes.productData.mediaId as {
							url: string;
							thumbnail_url?: string;
						})
				: null;

	// Get attributes from columnAttributes for Variantinfo tab
	const attributesFromColumnAttributes =
		itemNumberForAttributes && columnAttributes?.[itemNumberForAttributes]
			? (
					columnAttributes[itemNumberForAttributes] as {
						attributes?: Array<{
							name: string;
							valueDef: string;
							language: string;
						}>;
					}
				)?.attributes?.filter((attr) => attr.language === "Norwegian") || []
			: [];

	// Get product-level attributes for Produktinfo tab
	const productAttributesFromColumnAttributes =
		columnAttributes?.productData?.attributes?.filter(
			(attr) => attr.language === "Norwegian",
		) || [];

	const handleCopyGtin = () => {
		if (gtinDisplay) {
			navigator.clipboard.writeText(gtinDisplay);
			setCopiedGtin(true);
			setTimeout(() => setCopiedGtin(false), 1000);
		}
	};

	const handleCopySap = () => {
		if (sapNumber) {
			navigator.clipboard.writeText(sapNumber);
			setCopiedSap(true);
			setTimeout(() => setCopiedSap(false), 1000);
		}
	};

	// Variantinfo: only from columnAttributes attributes
	const variantSpecs = attributesFromColumnAttributes.map((attr) => ({
		label: attr.name,
		value: attr.valueDef,
	}));

	// Produktinfo: only from columnAttributes product-level attributes
	const productSpecs = productAttributesFromColumnAttributes.map((attr) => ({
		label: attr.name,
		value: attr.valueDef,
	}));

	// Check if SDS is available for the selected item
	const hasSDS =
		itemNumberForAttributes && columnAttributes?.[itemNumberForAttributes]
			? (columnAttributes[itemNumberForAttributes] as { SDS?: string })?.SDS ===
					"True" ||
				(columnAttributes[itemNumberForAttributes] as { SDS?: string })?.SDS ===
					"true"
			: false;

	// Build Ecoonline URL
	const ecoonlineUrl = itemNumberForAttributes
		? `https://app.ecoonline.com/ecosuite/applic/shoplink/shoplink.php?msdsCid=1000435&applicationID=9&msdsLang=1&viewForm=pdf&msdsEr=${itemNumberForAttributes}`
		: "";

	// Count documents
	const documentCount = 1 + (hasSDS && ecoonlineUrl ? 1 : 0);

	// Handle PDF download
	const handleDownloadPdf = async () => {
		if (!columnAttributes || !itemNumberForAttributes) {
			toast("Ingen data tilgjengelig", {
				type: "warning",
				position: "bottom-right",
				autoClose: 2000,
			});
			return;
		}

		setIsGeneratingPdf(true);

		try {
			const productAttrs = columnAttributes?.productData?.attributes ?? [];
			const filteredAttributes = productAttrs.filter(
				(attr: any) => attr.language === "Norwegian",
			);
			const specifications = filteredAttributes.map((attr: any) => ({
				name: attr.name || attr.name_key_language || "",
				value: attr.value_def || attr.valueDef || "-",
			}));

			const { generateProductPdf } = await import("@/utils/generateProductPdf");
			await generateProductPdf({
				name: productName,
				itemNumber: itemNumberForAttributes,
				gtin: gtinDisplay || null,
				imageUrl: productImage?.url || productImage?.thumbnail_url || undefined,
				application: "",
				notes:
					columnAttributes?.productData?.remarksNo ||
					columnAttributes?.productData?.remarksEn ||
					"",
				specifications,
				variants: [],
				visibleAttributeNames: [],
				locale: "no",
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

	// Reset to produktinfo tab when modal opens, itemNumber changes, or when columnAttributes loads
	useEffect(() => {
		if (isOpen) {
			setActiveTab("produktinfo");
		}
	}, [isOpen, itemNumber, columnAttributes]);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				className="max-h-[90vh] !max-w-6xl overflow-y-auto p-0 shadow-xl"
				onPointerDownOutside={onClose}
				onEscapeKeyDown={onClose}>
				<div className="rounded-lg bg-white">
					{isAttributesLoading ? (
						<div className="flex min-h-[320px] items-center justify-center p-10">
							<Loader2 className="h-8 w-8 animate-spin text-[#1C6D2C]" />
						</div>
					) : (
						<>
							<div className="flex gap-6 p-6">
								<div className="flex h-[280px] w-[410px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-[#F8F9F8]">
									{productImage?.url || productImage?.thumbnail_url ? (
										<img
											src={productImage.url || productImage.thumbnail_url}
											alt={productName}
											className="h-full w-full object-contain"
										/>
									) : (
										<ImageIcon className="h-12 w-12 text-gray-400" />
									)}
								</div>
								<div className="min-w-0 flex-1">
									<h2 className="text-[20px] font-bold text-[#0F1912]">
										{productName}
									</h2>
									<div className="mt-2 flex flex-wrap items-center gap-4">
										<div className="relative">
											{gtinDisplay != null ? (
												<button
													type="button"
													onClick={handleCopyGtin}
													className="inline-flex items-center gap-1.5 text-[12px] font-light text-gray-500 hover:text-gray-700">
													<span className="font-semibold text-black">
														GTIN:
													</span>
													<span>{gtinDisplay}</span>
													<Files className="h-4 w-4 shrink-0 cursor-pointer text-gray-500" />
												</button>
											) : (
												<span className="inline-flex items-center gap-1.5 text-[12px] font-light text-gray-500">
													<span className="font-semibold text-black">
														GTIN:
													</span>
													<span>—</span>
												</span>
											)}
											{copiedGtin && gtinDisplay != null && (
												<div className="absolute top-full left-0 z-10 mt-1 rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow">
													Kopiert
												</div>
											)}
										</div>
										{sapNumber != null && (
											<div className="relative">
												<button
													type="button"
													onClick={handleCopySap}
													className="inline-flex items-center gap-1.5 text-[12px] font-light text-gray-500 hover:text-gray-700">
													<span className="font-semibold text-black">SAP:</span>
													<span>{sapNumber}</span>
													<Files className="h-4 w-4 shrink-0 cursor-pointer text-gray-500" />
												</button>
												{copiedSap && (
													<div className="absolute top-full left-0 z-10 mt-1 rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow">
														Kopiert
													</div>
												)}
											</div>
										)}
									</div>
									{(hasShortDescription || hasLongDescription) && (
										<div className="mt-3 border-b border-gray-200 pb-3">
											<p className="text-sm font-light text-[#8A8F8C]">
												{showFullDescription && hasLongDescription
													? longDescription
													: shortDescription}
											</p>
											{shouldShowToggle && (
												<button
													type="button"
													onClick={() => setShowFullDescription((v) => !v)}
													className="mt-4 text-sm font-light text-green-600 hover:underline">
													{showFullDescription ? "Vis mindre" : "Les mer"} ›
												</button>
											)}
										</div>
									)}
								</div>
							</div>

							{(variantSpecs.length > 0 ||
								productSpecs.length > 0 ||
								documentCount > 0) && (
								<div className="mx-2 rounded-md border border-gray-200">
									<Tabs
										value={activeTab}
										onValueChange={setActiveTab}
										className="w-full">
										<TabsList className="flex h-auto w-full justify-start gap-6 rounded-none border-b border-gray-200 bg-transparent px-6 py-0">
											{variantSpecs.length > 0 && (
												<TabsTrigger
													value="variantinfo"
													className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-left text-sm font-medium text-gray-500 data-[state=active]:border-green-900 data-[state=active]:bg-transparent data-[state=active]:text-green-900 data-[state=active]:shadow-none">
													Variantinfo
												</TabsTrigger>
											)}
											{productSpecs.length > 0 && (
												<TabsTrigger
													value="produktinfo"
													className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-left text-sm font-medium text-gray-500 data-[state=active]:border-green-900 data-[state=active]:bg-transparent data-[state=active]:text-green-900 data-[state=active]:shadow-none">
													Produktinfo
												</TabsTrigger>
											)}
											{documentCount > 0 && (
												<TabsTrigger
													value="documents"
													className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-left text-sm font-medium text-gray-500 data-[state=active]:border-green-900 data-[state=active]:bg-transparent data-[state=active]:text-green-900 data-[state=active]:shadow-none">
													Dokumentasjon ({documentCount})
												</TabsTrigger>
											)}
										</TabsList>

										{variantSpecs.length > 0 && (
											<TabsContent
												value="variantinfo"
												className="mt-0">
												<div className="p-6">
													<div className="grid grid-cols-2 gap-x-8 gap-y-3">
														{variantSpecs.map((row, index) => (
															<div key={`${row.label}-${index}`}>
																<div className="grid grid-cols-2 gap-4 py-3">
																	<dt className="text-left text-sm font-medium text-gray-900">
																		{row.label}
																	</dt>
																	<dd className="text-right text-sm text-gray-500">
																		{row.value}
																	</dd>
																</div>
																{index < variantSpecs.length - 1 && (
																	<hr className="border-gray-200" />
																)}
															</div>
														))}
													</div>
												</div>
											</TabsContent>
										)}

										{productSpecs.length > 0 && (
											<TabsContent
												value="produktinfo"
												className="mt-0">
												<div className="p-6">
													<div className="grid grid-cols-2 gap-x-8 gap-y-3">
														{productSpecs.map((row, index) => (
															<div key={`${row.label}-${index}`}>
																<div className="grid grid-cols-2 gap-4 py-3">
																	<dt className="text-left text-sm font-medium text-gray-900">
																		{row.label}
																	</dt>
																	<dd className="text-right text-sm text-gray-500">
																		{row.value}
																	</dd>
																</div>
																{index < productSpecs.length - 1 && (
																	<hr className="border-gray-200" />
																)}
															</div>
														))}
													</div>
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
															Last ned PDF
														</span>
													</button>

													{hasSDS && ecoonlineUrl && (
														<button
															type="button"
															onClick={() =>
																window.open(ecoonlineUrl, "_blank")
															}
															className="flex cursor-pointer items-center gap-3 text-left">
															<ExternalLink className="h-5 w-5 text-black" />
															<span className="text-sm font-light text-green-700">
																Sikkerhetsdatablad (Ecoonline)
															</span>
														</button>
													)}
												</div>
											</TabsContent>
										)}
									</Tabs>
								</div>
							)}

							<div className="flex justify-center p-6 pt-4">
								<Button
									variant="greenSolid"
									onClick={onClose}
									className="rounded-md px-8 py-3">
									{t("closeWindow")}
								</Button>
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
