"use client";

import { useState, useEffect } from "react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SAP_CUSTOMER } from "@/constants/checkout";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useAppContext } from "@/lib/appContext";
import { addToCart, getCart } from "@/services/carts.service";
import { calculateItemPrice } from "@/services/product.service";
import { useProductTabs } from "@/stores/useProductTabs";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { generateProductPdf } from "@/utils/generateProductPdf";
import {
	ExternalLink,
	Files,
	ShoppingCart,
	Loader2,
	CheckCircle,
	FileText,
} from "lucide-react";
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
	selectedItemNumber?: string;
	shortDescription?: string;
	columnAttributes?: Record<string, any> | null;
	selectedWarehouse?: string;
	onWarehouseChange?: (itemNumber: string, warehouseNumber: string) => void;
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
	selectedItemNumber,
	shortDescription,
	columnAttributes,
	selectedWarehouse,
	onWarehouseChange,
}: ProductInfoProps) {
	const t = useTranslations("Product");
	const { data: profile } = useGetProfileData();
	const { isCartChanging, setIsCartChanging } = useAppContext();
	const { activeTab, setActiveTab } = useProductTabs();
	const [copiedGtin, setCopiedGtin] = useState(false);
	const [copiedSap, setCopiedSap] = useState(false);
	const [showFullDescription, setShowFullDescription] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
	const [loadingPrice, setLoadingPrice] = useState(false);
	const [adding, setAdding] = useState(false);
	const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
	const [showAllAttributes, setShowAllAttributes] = useState(false);
	const [showAllProductInfo, setShowAllProductInfo] = useState(false);

	const isSapCustomer = profile?.defaultCustomerNumber === SAP_CUSTOMER;

	// Get short and long description from columnAttributes productData
	const getShortDescription = () => {
		if (!columnAttributes?.productData) return undefined;
		const desc =
			locale === "no"
				? columnAttributes.productData.shortDescNo
				: columnAttributes.productData.shortDescEn;
		// Return undefined if field doesn't exist, otherwise return the value (even if empty string)
		return desc !== undefined ? desc : undefined;
	};

	const getLongDescription = () => {
		if (!columnAttributes?.productData) return undefined;
		const desc =
			locale === "no"
				? columnAttributes.productData.longDescNo
				: columnAttributes.productData.longDescEn;
		// Return undefined if field doesn't exist, otherwise return the value (even if empty string)
		return desc !== undefined ? desc : undefined;
	};

	// Use columnAttributes productData first, fallback to props/variantData only if productData not available
	const shortDescFromAttributes = getShortDescription();
	const longDescFromAttributes = getLongDescription();

	// Use productData descriptions if available (empty string = no description, undefined = fallback)
	const shortDescriptionValue =
		shortDescFromAttributes !== undefined
			? shortDescFromAttributes || null
			: shortDescription || null;
	const longDescription =
		longDescFromAttributes !== undefined
			? longDescFromAttributes || null
			: variantData?.description?.itemRemarks ||
				variantData?.itemHeader?.extLongText?.[1]?.value_def ||
				null;

	// If no short description, use long description directly
	// Otherwise, use show more/show less logic
	const hasShortDescription =
		shortDescriptionValue && shortDescriptionValue.trim() !== "";
	const hasLongDescription = longDescription && longDescription.trim() !== "";
	const shouldShowToggle =
		hasShortDescription &&
		hasLongDescription &&
		shortDescriptionValue !== longDescription;

	const displayDescription = () => {
		if (!hasShortDescription && hasLongDescription) {
			return longDescription;
		}
		if (shouldShowToggle) {
			return showFullDescription ? longDescription : shortDescriptionValue;
		}
		return shortDescriptionValue || longDescription || "";
	};

	const getSapNumber = () => {
		if (!selectedItemNumber || !columnAttributes) return null;

		const attrs = columnAttributes[selectedItemNumber]?.attributes || [];
		const sapAttr = attrs.find(
			(attr: any) => attr.name?.toLowerCase() === "sap nr",
		);
		return sapAttr?.valueDef || null;
	};

	const sapNumber = getSapNumber();

	const handleCopyGtin = () => {
		if (gtin) {
			navigator.clipboard.writeText(gtin);
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

	const currentItemNumber =
		selectedItemNumber?.toString() ||
		variantData?.itemVariants?.[0]?.itemNumber?.toString() ||
		"";

	const ecoonlineUrl = currentItemNumber
		? `https://app.ecoonline.com/ecosuite/applic/shoplink/shoplink.php?msdsCid=1000435&applicationID=9&msdsLang=1&viewForm=pdf&msdsEr=${currentItemNumber}`
		: "";

	// Get warehouse options similar to product variant table
	const warehouseOptions = useMemo(() => {
		if (!selectedItemNumber || !columnAttributes) return [];

		const inventory = columnAttributes[selectedItemNumber]?.inventory || [];
		const warehouseMap = new Map();

		inventory
			.filter((inv: any) => inv.balance > 0)
			.forEach((inv: any) => {
				const key = inv.warehouseId;
				if (warehouseMap.has(key)) {
					const existing = warehouseMap.get(key);
					existing.balance += inv.balance;
				} else {
					warehouseMap.set(key, {
						warehouseId: inv.warehouseId,
						warehouseName:
							inv.warehouseName ||
							`${locale === "no" ? "Lager" : "Warehouse"} ${inv.warehouseId}`,
						balance: inv.balance,
					});
				}
			});

		return Array.from(warehouseMap.values())
			.slice(0, 50)
			.sort((a: any, b: any) => b.balance - a.balance);
	}, [selectedItemNumber, columnAttributes, t]);

	// Get warehouse info for selected warehouse
	const warehouseNumber = selectedWarehouse || profile?.defaultWarehouseNumber;

	const getWarehouseInfo = () => {
		if (!selectedItemNumber || !columnAttributes || !warehouseNumber)
			return null;

		const inventory = columnAttributes[selectedItemNumber]?.inventory || [];
		const warehouseId = parseInt(warehouseNumber);
		const warehouseInfo = inventory.find(
			(inv: any) => inv.warehouseId === warehouseId,
		);

		if (warehouseInfo) {
			return {
				balance: warehouseInfo.balance || 0,
				warehouseName: warehouseInfo.warehouseName || `Lager ${warehouseId}`,
			};
		}

		return null;
	};

	const warehouseInfo = getWarehouseInfo();
	const selectedWarehouseBalance = warehouseInfo
		? warehouseInfo.balance
		: warehouseNumber
			? (variantData?.stockByWarehouse?.find(
					(w: any) => w.warehouse_number === warehouseNumber,
				)?.balance ?? 0)
			: 0;

	const selectedWarehouseName = warehouseInfo
		? warehouseInfo.warehouseName
		: warehouseNumber
			? `Lager ${warehouseNumber}`
			: "hovedlager";

	// Get unit (enhet) for the selected item
	const getUnit = () => {
		if (!selectedItemNumber || !columnAttributes) return "STK";

		const attrs = columnAttributes[selectedItemNumber]?.attributes || [];

		// Try to find contentUnit from attributes
		const contentUnitAttr = attrs.find((attr: any) => attr.contentUnit);
		if (contentUnitAttr?.contentUnit) {
			return contentUnitAttr.contentUnit;
		}

		// Try to find by attribute identifier or name
		const unitAttr = attrs.find(
			(attr: any) =>
				attr.attributeIdentifier === "contentUnit" ||
				attr.name?.toLowerCase().includes("contentunit") ||
				attr.name?.toLowerCase().includes("content unit") ||
				attr.name?.toLowerCase().includes("enhet"),
		);
		if (unitAttr?.valueDef) {
			return unitAttr.valueDef;
		}

		// Fallback to STK
		return "STK";
	};

	const unit = getUnit();

	// Initialize active tab to "attributes" on mount if not already set to a valid tab
	useEffect(() => {
		const validTabs = ["attributes", "produktinfo", "documents"];
		if (!validTabs.includes(activeTab)) {
			setActiveTab("attributes");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Initialize warehouse selection if not set
	useEffect(() => {
		if (
			selectedItemNumber &&
			warehouseOptions.length > 0 &&
			!selectedWarehouse &&
			onWarehouseChange
		) {
			const firstWarehouse = warehouseOptions[0].warehouseId.toString();
			onWarehouseChange(selectedItemNumber, firstWarehouse);
		}
	}, [
		selectedItemNumber,
		warehouseOptions,
		selectedWarehouse,
		onWarehouseChange,
	]);

	// Calculate price
	useEffect(() => {
		const loadPrice = async () => {
			if (!selectedItemNumber || !profile) return;
			setLoadingPrice(true);
			try {
				const result = await calculateItemPrice(
					[
						{
							itemNumber: selectedItemNumber,
							quantity,
							warehouseNumber: profile.defaultWarehouseNumber || "",
						},
					],
					profile.defaultCustomerNumber,
					profile.defaultCompanyNumber,
				);

				if (result?.[0]) {
					setCalculatedPrice(result[0].bestPrice || 0);
				}
			} catch (err) {
				console.error("Failed to load price", err);
				setCalculatedPrice(null);
			} finally {
				setLoadingPrice(false);
			}
		};

		loadPrice();
	}, [selectedItemNumber, quantity, profile]);

	// Add to cart handler
	const handleAddToCart = async () => {
		if (!selectedItemNumber || !productNumber) return;

		const warehouseNumber = profile?.defaultWarehouseNumber || "";

		const balance =
			variantData?.stockByWarehouse?.find(
				(w: any) => w.warehouse_number === warehouseNumber,
			)?.balance ?? null;

		if (balance === null || balance === undefined) {
			/* empty */
		} else if (balance <= 0) {
			toast(t("noBalanceForWarehouse"), {
				type: "warning",
				position: "bottom-right",
				autoClose: 2000,
			});
			return;
		}

		setAdding(true);
		try {
			const response = await addToCart({
				productNumber,
				itemNumber: selectedItemNumber,
				quantity,
				warehouseNumber,
				companyNumber: profile?.defaultCompanyNumber.toString() || "1",
			});

			if (response?.message === "Error adding to cart") {
				throw new Error(response.message);
			}

			setIsCartChanging(!isCartChanging);
			toast(t("addedToCart"), {
				type: "success",
				position: "bottom-right",
				autoClose: 2000,
			});

			setQuantity(1);
			await getCart();
		} catch (err) {
			console.error("Error adding to cart:", err);
			toast(t("errorAddingToCart"), {
				type: "error",
				position: "bottom-right",
				autoClose: 2000,
			});
		} finally {
			setAdding(false);
		}
	};

	// Get attributes from columnAttributes for Variantinfo tab
	// Item-specific attributes for Variantinfo tab
	const allAttributes = useMemo(() => {
		if (!selectedItemNumber || !columnAttributes) return [];

		const attrs = columnAttributes[selectedItemNumber]?.attributes || [];
		return attrs.filter((attr: any) =>
			locale === "no"
				? attr.language === "Norwegian"
				: attr.language === "English",
		);
	}, [selectedItemNumber, columnAttributes, locale]);

	// Get specifications (filtered attributes) from columnAttributes productData for Produktinfo tab
	const filteredAttributes = useMemo(() => {
		if (!columnAttributes?.productData?.attributes) return [];
		return columnAttributes.productData.attributes.filter((attr: any) =>
			locale === "no"
				? attr.language === "Norwegian"
				: attr.language === "English",
		);
	}, [columnAttributes?.productData?.attributes, locale]);

	// Count documents
	const documentCount = 1 + (isSapCustomer && ecoonlineUrl ? 1 : 0);

	// Handle PDF download
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
				value: attr.value_def || attr.valueDef || "-",
			}));

			const itemNumberForPdf =
				selectedItemNumber?.toString() ||
				variantData?.itemVariants?.[0]?.itemNumber?.toString() ||
				"-";

			await generateProductPdf({
				name,
				itemNumber: itemNumberForPdf,
				gtin: gtin || null,
				imageUrl,
				application: application || "",
				notes: variantData?.description?.itemRemarks || "",
				specifications,
				variants: [],
				visibleAttributeNames: [],
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

	return (
		<div>
			<div className="flex items-center justify-between">
				<div className="flex w-full justify-between gap-4">
					<h1 className="text-3xl font-semibold">{name}</h1>
					<div className="flex items-center gap-4">
						{gtin && (
							<div className="relative">
								<button
									type="button"
									onClick={handleCopyGtin}
									className="inline-flex items-center gap-1.5 text-sm font-light text-gray-500">
									<span className="font-semibold text-black">GTIN:</span>
									<span>{gtin}</span>
									<Files className="h-4 w-4 cursor-pointer text-gray-500" />
								</button>
								{copiedGtin && (
									<div className="absolute top-full left-0 mt-1 rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow">
										{t("copied")}
									</div>
								)}
							</div>
						)}
						{sapNumber && (
							<div className="relative">
								<button
									type="button"
									onClick={handleCopySap}
									className="inline-flex items-center gap-1.5 text-sm font-light text-gray-500">
									<span className="font-semibold text-black">SAP:</span>
									<span>{sapNumber}</span>
									<Files className="h-4 w-4 cursor-pointer text-gray-500" />
								</button>
								{copiedSap && (
									<div className="absolute top-full left-0 mt-1 rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow">
										{t("copied")}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center gap-8">
					{/* Documents moved to tabs */}
				</div>
			</div>
			{displayDescription() && (
				<>
					<div className="flex items-start justify-between gap-4">
						<p className="text-md mt-2 flex-1 font-normal text-[#5A615D]">
							{displayDescription()}
						</p>
						{shouldShowToggle && (
							<button
								type="button"
								onClick={() => setShowFullDescription(!showFullDescription)}
								className="mt-2 shrink-0 text-sm font-medium text-green-600 hover:underline">
								{showFullDescription ? "Vis mindre" : "Les mer"} ›
							</button>
						)}
					</div>
					<hr className="my-4 border-gray-200" />
				</>
			)}

			{/* Product action section */}
			{selectedItemNumber && variantData && (
				<div className="mt-4 flex items-center justify-between gap-4">
					{/* Item number */}
					<div className="w-1/2 flex-col gap-1">
						<p className="text-sm font-light text-gray-500">
							<span className="font-semibold text-black">
								{locale === "no" ? "Varenummer:" : "Item number:"}
							</span>{" "}
							{variantData?.itemTechnicalSpec?.itemNumber}
						</p>

						{/* Warehouse selection */}
						<Select
							value={warehouseNumber || ""}
							onValueChange={async (value) => {
								if (selectedItemNumber) {
									onWarehouseChange?.(selectedItemNumber, value);
									// Recalculate price when warehouse changes
									if (profile) {
										setLoadingPrice(true);
										try {
											const result = await calculateItemPrice(
												[
													{
														itemNumber: selectedItemNumber,
														quantity,
														warehouseNumber: value,
													},
												],
												profile.defaultCustomerNumber,
												profile.defaultCompanyNumber,
											);

											if (result?.[0]) {
												setCalculatedPrice(result[0].bestPrice || 0);
											}
										} catch (err) {
											console.error("Failed to load price", err);
										} finally {
											setLoadingPrice(false);
										}
									}
								}
							}}>
							<SelectTrigger className="w-auto border-0 bg-transparent p-0 shadow-none outline-none">
								<div className="flex items-center gap-1">
									{selectedWarehouseBalance > 0 && warehouseNumber && (
										<CheckCircle className="h-4 w-4 text-green-800" />
									)}
									<SelectValue>
										{warehouseOptions.length === 0
											? "Ingen lager"
											: selectedWarehouseBalance > 0 && warehouseNumber
												? `${selectedWarehouseBalance} ${unit} på ${selectedWarehouseName}`
												: "Velg lager"}
									</SelectValue>
								</div>
							</SelectTrigger>
							<SelectContent className="max-h-[300px] overflow-y-auto">
								{warehouseOptions.length === 0 ? (
									<div className="px-2 py-1 text-sm text-gray-500">
										Ingen lager tilgjengelig
									</div>
								) : (
									warehouseOptions.map((w: any, index: number) => (
										<SelectItem
											key={`${selectedItemNumber}-${w.warehouseId}-${index}`}
											value={w.warehouseId.toString()}>
											<div className="flex items-center gap-2">
												<CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
												<span className="truncate">
													{w.balance} {unit} på {w.warehouseName}
												</span>
											</div>
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
					</div>

					{/* Quantity, Add to Cart, and Price */}
					<div className="flex items-center gap-4">
						{/* Quantity selector */}
						<div className="flex items-center gap-2">
							<Button
								className="h-8 w-8 border-[#C1C4C2] text-[#0F1912]"
								variant="outline"
								size="icon"
								onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
								-
							</Button>

							<span className="flex h-8 w-8 items-center justify-center border border-gray-200 px-5 text-sm">
								{quantity}
							</span>

							<Button
								className="h-8 w-8 border-[#C1C4C2] text-[#0F1912]"
								variant="outline"
								size="icon"
								onClick={() => setQuantity((q) => q + 1)}>
								+
							</Button>
						</div>

						{/* Add to Cart button */}
						<Button
							disabled={adding || !selectedItemNumber}
							className="rounded-md bg-green-600 px-4 text-white hover:bg-green-700 disabled:opacity-60"
							onClick={handleAddToCart}>
							{adding ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("adding")}
								</>
							) : (
								<>
									<ShoppingCart className="mr-2 h-4 w-4" />
									{t("addToCart")}
								</>
							)}
						</Button>

						{/* Price */}
						<div className="text-right">
							<p className="text-xl leading-none font-semibold">
								{loadingPrice
									? t("loadingPrice")
									: calculatedPrice !== null
										? formatNorwegianCurrency(calculatedPrice)
										: "-"}
							</p>
							<p className="text-sm font-light text-gray-500">
								{locale === "no" ? "eks mva" : t("excludingVat")}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Attributes, Produktinfo, and Documents Tabs */}
			{(allAttributes.length > 0 ||
				filteredAttributes.length > 0 ||
				documentCount > 0) && (
				<div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full">
						<TabsList className="flex h-auto w-full justify-start gap-6 rounded-none border-b border-gray-200 bg-transparent px-6 py-0">
							{allAttributes.length > 0 && (
								<TabsTrigger
									value="attributes"
									className="justify-start rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-left text-sm font-medium text-gray-500 shadow-none data-[state=active]:border-green-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
									{locale === "no" ? "Variantinfo" : "Attributes"}
								</TabsTrigger>
							)}
							{filteredAttributes.length > 0 && (
								<TabsTrigger
									value="produktinfo"
									className="justify-start rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-left text-sm font-medium text-gray-500 shadow-none data-[state=active]:border-green-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
									{locale === "no" ? "Produktinfo" : "Product Info"}
								</TabsTrigger>
							)}
							{documentCount > 0 && (
								<TabsTrigger
									value="documents"
									className="justify-start rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-left text-sm font-medium text-gray-500 shadow-none data-[state=active]:border-green-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
									{locale === "no"
										? `Dokumentasjon (${documentCount})`
										: `Documents (${documentCount})`}
								</TabsTrigger>
							)}
						</TabsList>

						{/* Attributes tab */}
						{allAttributes.length > 0 && (
							<TabsContent
								value="attributes"
								className="mt-0">
								<div className="p-6">
									<div className="grid grid-cols-2 gap-x-8 gap-y-3">
										{(showAllAttributes
											? allAttributes
											: allAttributes.slice(0, 10)
										).map((attr: any, index: number) => (
											<div key={attr.attribute_identifier || index}>
												<div className="grid grid-cols-2 gap-4 py-3">
													<dt className="text-left text-sm font-medium text-gray-900">
														{attr.name || attr.nameKeyLanguage || "-"}
													</dt>
													<dd className="text-right text-sm text-gray-500">
														{attr.valueDef || attr.value_def || "-"}
													</dd>
												</div>
												{index <
													(showAllAttributes
														? allAttributes.length - 1
														: Math.min(allAttributes.length, 10) - 1) && (
													<hr className="border-gray-200" />
												)}
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

						{/* Produktinfo tab - same layout as attributes */}
						{filteredAttributes.length > 0 && (
							<TabsContent
								value="produktinfo"
								className="mt-0">
								<div className="p-6">
									<div className="grid grid-cols-2 gap-x-8 gap-y-3">
										{(showAllProductInfo
											? filteredAttributes
											: filteredAttributes.slice(0, 10)
										).map((attr: any, index: number) => (
											<div key={attr.attribute_identifier || index}>
												<div className="grid grid-cols-2 gap-4 py-3">
													<dt className="text-left text-sm font-medium text-gray-900">
														{attr.name || attr.nameKeyLanguage || "-"}
													</dt>
													<dd className="text-right text-sm text-gray-500">
														{attr.valueDef || attr.value_def || "-"}
													</dd>
												</div>
												{index <
													(showAllProductInfo
														? filteredAttributes.length - 1
														: Math.min(filteredAttributes.length, 10) - 1) && (
													<hr className="border-gray-200" />
												)}
											</div>
										))}
									</div>
									{filteredAttributes.length > 10 && (
										<div className="mt-4 flex justify-center">
											<button
												type="button"
												onClick={() =>
													setShowAllProductInfo(!showAllProductInfo)
												}
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

						{/* Documents tab */}
						{documentCount > 0 && (
							<TabsContent
								value="documents"
								className="mt-0">
								<div className="space-y-4 p-6">
									{/* PDF Download */}
									<button
										type="button"
										onClick={handleDownloadPdf}
										disabled={isGeneratingPdf || !variantData}
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

									{/* Ecoonline link */}
									{isSapCustomer && ecoonlineUrl && (
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
			)}
		</div>
	);
}
