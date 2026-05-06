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
import { SAP_CUSTOMER } from "@/constants/checkout";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useAppContext } from "@/lib/appContext";
import { addToCart, getCart } from "@/services/carts.service";
import { calculateItemPrice } from "@/services/product.service";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { Files, ShoppingCart, Loader2, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import QuantityButtons from "../ui/quantity-buttons";

interface ProductInfoProps {
	name: string;
	category: string;
	price?: number;
	pdfUrl?: string;
	productNumber?: string;
	gtin?: string | null;
	imageUrl?: string;
	application?: string;
	locale: string;
	selectedItemNumber?: string;
	shortDescription?: string;
	columnAttributes?: Record<string, any> | null;
	variants?: Array<{ itemNumber?: string }>;
	selectedWarehouse?: string;
	onWarehouseChange?: (itemNumber: string, warehouseNumber: string) => void;
	/** Current quantity selected for the active variant (from variant table) */
	selectedQuantity?: number;
	onQuantityChange?: (itemNumber: string, quantity: number) => void;
}

export function ProductInfo({
	name,
	price,
	pdfUrl,
	productNumber,
	gtin,
	imageUrl,
	application,
	locale,
	selectedItemNumber,
	shortDescription,
	columnAttributes,
	variants = [],
	selectedWarehouse,
	onWarehouseChange,
	selectedQuantity,
	onQuantityChange,
}: ProductInfoProps) {
	const firstItemNumber = variants?.[0]?.itemNumber;
	const t = useTranslations("Product");
	const { data: profile } = useGetProfileData();
	const { isCartChanging, setIsCartChanging, setIsAuthOpen, showCartNotification } = useAppContext();
	const [copiedGtin, setCopiedGtin] = useState(false);
	const [copiedSap, setCopiedSap] = useState(false);
	const [showFullDescription, setShowFullDescription] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
	const [loadingPrice, setLoadingPrice] = useState(false);
	const [adding, setAdding] = useState(false);

	const isSapCustomer = SAP_CUSTOMER.includes(profile?.defaultCustomerNumber || "");

	const multiple = useMemo(() => {
		const multipleValue = columnAttributes?.productData?.multiple;
		if (!multipleValue) return 1;
		const parsed = parseFloat(multipleValue);
		return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
	}, [columnAttributes?.productData?.multiple]);

	useEffect(() => {
		setQuantity(multiple);
	}, [multiple]);

	// When variant changes, default local quantity to 1 if external quantity is not provided
	useEffect(() => {
		if (selectedItemNumber && selectedQuantity === undefined) setQuantity(1);
	}, [selectedItemNumber, selectedQuantity]);

	// Get short and long description from columnAttributes productData (with cross-locale fallback for long when empty)
	const getShortDescription = () => {
		if (!columnAttributes?.productData) return undefined;
		const desc =
			locale === "no"
				? columnAttributes.productData.shortDescNo
				: columnAttributes.productData.shortDescEn;
		return desc !== undefined ? desc : undefined;
	};

	const getLongDescription = () => {
		if (!columnAttributes?.productData) return undefined;
		const pd = columnAttributes.productData as Record<
			string,
			string | undefined
		>;
		const primary = locale === "no" ? pd.longDescNo : pd.longDescEn;
		const fallback = locale === "no" ? pd.longDescEn : pd.longDescNo;
		// Use current locale long desc; if empty, use other locale so "Les mer" / "Vis mindre" can still show
		const desc =
			primary !== undefined && primary.trim() !== ""
				? primary
				: fallback !== undefined && fallback.trim() !== ""
					? fallback
					: primary;
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
			: null;

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

	// Get warehouse options: same as product-variant-table (company fallback, allow 0 balance, dedupe by warehouseId)
	const warehouseOptions = useMemo(() => {
		if (!selectedItemNumber || !columnAttributes) return [];
		const variantData =
			columnAttributes[selectedItemNumber] ??
			columnAttributes[String(selectedItemNumber)];
		const inventory = variantData?.inventory || [];

		// Use all warehouses across all companies; do not restrict to default company
		const withBalance = inventory
			.filter((inv: any) => inv.balance > 0)
			.map((inv: any) => ({
				warehouseId: inv.warehouseId,
				warehouseName:
					inv.warehouseName ||
					`${locale === "no" ? "Lager" : "Warehouse"} ${inv.warehouseId}`,
				balance: inv.balance,
			}))
			.sort((a: any, b: any) => b.balance - a.balance);
		const withZero = inventory
			.filter((inv: any) => inv.balance === 0)
			.map((inv: any) => ({
				warehouseId: inv.warehouseId,
				warehouseName:
					inv.warehouseName ||
					`${locale === "no" ? "Lager" : "Warehouse"} ${inv.warehouseId}`,
				balance: inv.balance,
			}))
			.sort((a: any, b: any) => a.warehouseId - b.warehouseId);

		const combined = [...withBalance, ...withZero];
		const seen = new Set<number>();
		return combined
			.filter((w: { warehouseId: number }) => {
				if (seen.has(w.warehouseId)) return false;
				seen.add(w.warehouseId);
				return true;
			})
			.slice(0, 50);
	}, [selectedItemNumber, columnAttributes, locale]);

	// Get warehouse info for selected warehouse
	const getWarehouseInfo = () => {
		if (!selectedItemNumber || !columnAttributes) return null;
		if (!selectedWarehouse && !profile?.defaultWarehouseNumber) return null;

		const variantData =
			columnAttributes[selectedItemNumber] ??
			columnAttributes[String(selectedItemNumber)];
		const inventory = variantData?.inventory || [];

		let warehouseInfo;

		if (selectedWarehouse) {
			// selectedWarehouse from table is warehouseId (unique)
			const warehouseId = parseInt(selectedWarehouse);
			warehouseInfo = inventory.find(
				(inv: any) => inv.warehouseId === warehouseId,
			);
		} else {
			// profile default uses warehouseNumber + companyNumber (combination is unique)
			const defaultWarehouseNumber = profile?.defaultWarehouseNumber;
			const defaultCompanyNumber = profile?.defaultCompanyNumber;
			warehouseInfo = inventory.find(
				(inv: any) =>
					inv.warehouseNumber === defaultWarehouseNumber &&
					inv.companyNumber === defaultCompanyNumber,
			);
		}

		if (warehouseInfo) {
			return {
				balance: warehouseInfo.balance || 0,
				warehouseName:
					warehouseInfo.warehouseName || `Lager ${warehouseInfo.warehouseId}`,
			};
		}

		return null;
	};

	// Get warehouse info for selected warehouse (unique by warehouseId or warehouseNumber+companyNumber)
	const warehouseInfo = getWarehouseInfo();
	const selectedWarehouseBalance = warehouseInfo ? warehouseInfo.balance : 0;

	const selectedWarehouseName = warehouseInfo
		? warehouseInfo.warehouseName
		: "hovedlager";

	// For warehouse selection dropdown display
	const warehouseNumber = selectedWarehouse || profile?.defaultWarehouseNumber;

	// Normalize Select value to match an option (options use warehouseId.toString())
	const selectValue = useMemo(() => {
		if (!warehouseNumber || warehouseOptions.length === 0) return "";
		const optionValues = warehouseOptions.map((w: { warehouseId: number }) =>
			w.warehouseId.toString(),
		);
		if (optionValues.includes(warehouseNumber)) return warehouseNumber;
		const variantData =
			selectedItemNumber && columnAttributes
				? (columnAttributes[selectedItemNumber] ??
					columnAttributes[String(selectedItemNumber)])
				: null;
		const inventory = variantData?.inventory || [];
		const inv = inventory.find(
			(inv: any) =>
				inv.warehouseId?.toString() === warehouseNumber ||
				inv.warehouseNumber === warehouseNumber,
		);
		return inv
			? inv.warehouseId.toString()
			: warehouseOptions[0].warehouseId.toString();
	}, [warehouseNumber, warehouseOptions, selectedItemNumber, columnAttributes]);

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

	// Label for trigger: when we have a valid selection, show that option's label (never "Ingen lager")
	const selectedOption = selectValue
		? warehouseOptions.find(
				(w: { warehouseId: number }) =>
					w.warehouseId.toString() === selectValue,
			)
		: null;
	const warehouseTriggerLabel = selectedOption
		? `${selectedOption.balance} ${unit} på ${selectedOption.warehouseName}`
		: warehouseOptions.length === 0
			? "Ingen lager"
			: "Velg lager";

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
			const effectiveQuantity = selectedQuantity ?? quantity;
			try {
				const result = await calculateItemPrice(
					[
						{
							itemNumber: selectedItemNumber,
							quantity: effectiveQuantity,
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
	}, [selectedItemNumber, selectedQuantity, quantity, profile]);

	const effectiveQuantity = selectedQuantity ?? quantity;

	// Add to cart handler
	const handleAddToCart = async () => {
		if (!selectedItemNumber || !productNumber) return;

		const warehouseNumber = profile?.defaultWarehouseNumber || "";

		const inventory = columnAttributes?.[selectedItemNumber]?.inventory ?? [];
		const balance =
			inventory.find(
				(inv: any) =>
					inv.warehouseNumber === warehouseNumber ||
					inv.warehouseId?.toString() === warehouseNumber,
			)?.balance ?? null;

		if (balance === null || balance === undefined) {
			/* empty */
		}

		setAdding(true);
		try {
			const response = await addToCart({
				productNumber,
				itemNumber: selectedItemNumber,
				quantity: selectedQuantity ?? quantity,
				warehouseNumber,
				companyNumber: profile?.defaultCompanyNumber.toString() || "1",
			});

			if (response?.message === "Error adding to cart") {
				throw new Error(response.message);
			}

			setIsCartChanging(!isCartChanging);
			showCartNotification({
				itemName: columnAttributes?.[selectedItemNumber]?.itemName ?? name,
				itemNumber: selectedItemNumber,
				quantity: selectedQuantity ?? quantity,
				imageUrl,
			});

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

	return (
		<div>
			<div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
				<h1 className="text-xl font-semibold lg:text-3xl">{name}</h1>
				{(gtin || (sapNumber && isSapCustomer)) && (
					<div className="flex items-center gap-4">
						{gtin && (
							<div className="relative">
								<button
									type="button"
									onClick={handleCopyGtin}
									className="inline-flex items-center gap-1.5 text-xs font-light text-gray-500">
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
						{sapNumber && isSapCustomer && (
							<div className="relative">
								<button
									type="button"
									onClick={handleCopySap}
									className="inline-flex items-center gap-1.5 text-xs font-light text-gray-500">
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
				)}
			</div>
			{displayDescription() && (
				<>
					<div className="mt-2">
						<p className="text-md font-light text-[#8A8F8C]">
							{displayDescription()}
						</p>
						{shouldShowToggle && (
							<button
								type="button"
								onClick={() => setShowFullDescription(!showFullDescription)}
								className="mt-2 text-base font-light text-green-600 hover:underline">
								{showFullDescription ? "Vis mindre" : "Les mer"} ›
							</button>
						)}
					</div>
					<hr className="my-4 border-gray-200" />
				</>
			)}

			{/* Product action section: details card + Velg varianter, then price + quantity + add */}
			{selectedItemNumber && columnAttributes && (
				<div className="mt-4 space-y-4">
					{/* Row 1: Product details card (70%) + Velg varianter button (30%) */}
					<div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-4">
						{/* Product details card */}
						<div
							className="min-w-0 flex-[0.7] rounded-lg border px-4 py-3"
							style={{
								borderColor: "#E8EAE9",
								backgroundColor: "#F8F9F8",
							}}>
							<div className="space-y-2 text-sm">
								<p>
									<span className="font-semibold text-black">
										{locale === "no" ? "Varenummer:" : "Item number:"}
									</span>{" "}
									<span className="font-light text-[#434B46]">
										{selectedItemNumber}
									</span>
								</p>
								<p>
									<span className="font-semibold text-black">
										{locale === "no" ? "Varenavn:" : "Item name:"}
									</span>{" "}
									<span className="font-light text-[#434B46] uppercase">
										{columnAttributes?.[selectedItemNumber]?.itemName ?? name}
									</span>
								</p>
								{profile && <div className="flex flex-wrap items-center gap-1.5">
									<span className="shrink-0 font-semibold text-black">
										{locale === "no" ? "Tilgjengelighet:" : "Availability:"}
									</span>
									<Select
										value={selectValue}
										onValueChange={async (value) => {
											if (selectedItemNumber) {
												onWarehouseChange?.(selectedItemNumber, value);
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
										<SelectTrigger className="inline-flex h-auto w-auto min-w-0 border-0 bg-transparent p-0 shadow-none outline-none focus:ring-0">
											<div className="flex items-center gap-1.5">
												{selectedOption && selectedOption.balance > 0 && (
													<CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
												)}
												<span className="text-green-700">
													{warehouseTriggerLabel}
												</span>
											</div>
										</SelectTrigger>
										<SelectContent className="max-h-[300px] overflow-y-auto">
											{warehouseOptions.length === 0 ? (
												<div className="px-2 py-1 text-sm text-gray-500">
													{locale === "no"
														? "Ingen lager tilgjengelig"
														: "No warehouse available"}
												</div>
											) : (
												warehouseOptions.map((w: any, index: number) => (
													<SelectItem
														key={`${selectedItemNumber}-${w.warehouseId}-${index}`}
														value={w.warehouseId.toString()}>
														<div className="flex items-center gap-2">
															<CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
															<span className="truncate">
																{w.balance} {unit}{" "}
																{locale === "no" ? "på" : "at"}{" "}
																{w.warehouseName}
															</span>
														</div>
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
								</div>}
							</div>
						</div>

						{/* Velg varianter button */}
						{variants.length > 0 && (
							<div className="flex flex-[0.3] items-start sm:justify-end">
								<Button
									type="button"
									variant="outline"
									className="h-auto w-full shrink-0 rounded-lg border-gray-200 bg-white px-4 py-2 text-sm font-normal text-black hover:bg-gray-50 sm:w-auto"
									onClick={() => {
										const el = document.getElementById("product-table-details");
										el?.scrollIntoView({ behavior: "smooth", block: "start" });
									}}>
									{locale === "no"
										? `Velg varianter (${variants.length})`
										: `Select variants (${variants.length})`}
								</Button>
							</div>
						)}
					</div>

					{/* Price */}
					{profile ? (
						<div className="flex items-baseline gap-1">
							<span className="text-xl leading-none font-semibold text-black">
								{loadingPrice
									? t("loadingPrice")
									: calculatedPrice !== null
										? formatNorwegianCurrency(calculatedPrice)
										: "-"}
							</span>
							<span className="text-sm font-normal text-gray-500">
								/ {unit} ({locale === "no" ? "eks mva" : t("excludingVat")})
							</span>
						</div>
					) : (
						<p className="text-sm text-gray-500">
							<button
								type="button"
								className="text-[#009640] underline hover:text-[#005522]"
								onClick={() => setIsAuthOpen(true)}>
								Logg inn
							</button>{" "}
							for pris
						</p>
					)}

					{/* Quantity selector + Legg til (only for logged-in users) */}
					{profile && <div className="flex items-center justify-between gap-4">
						<QuantityButtons
							quantity={effectiveQuantity}
							allowInput
							onQuantityChange={(next) => {
								setQuantity(next);
								if (selectedItemNumber && onQuantityChange) {
									onQuantityChange(selectedItemNumber, next);
								}
							}}
							onIncrease={() => {
								const next = effectiveQuantity + 1;
								setQuantity(next);
								if (selectedItemNumber && onQuantityChange) {
									onQuantityChange(selectedItemNumber, next);
								}
							}}
							onDecrease={() => {
								const next = Math.max(1, effectiveQuantity - 1);
								setQuantity(next);
								if (selectedItemNumber && onQuantityChange) {
									onQuantityChange(selectedItemNumber, next);
								}
							}}
						/>

						<Button
							disabled={adding || !selectedItemNumber}
							className="min-w-0 shrink rounded-lg border-0 px-4 font-light hover:opacity-90 disabled:opacity-60 md:w-[172px]"
							onClick={handleAddToCart}>
							{adding ? (
								<>
									<Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
									{t("adding")}
								</>
							) : (
								<>
									<ShoppingCart className="mr-1.5 h-4 w-4" />
									{t("addToCart")}
								</>
							)}
						</Button>
					</div>}
				</div>
			)}
		</div>
	);
}
