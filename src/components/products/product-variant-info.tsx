"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { SAP_CUSTOMER } from "@/constants/checkout";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useAppContext } from "@/lib/appContext";
import { addToCart, getCart } from "@/services/carts.service";
import { calculateItemPrice } from "@/services/product.service";
import { useProductTabs } from "@/stores/useProductTabs";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { ShoppingCart, Loader2, Files, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

interface ProductVariantInfoProps {
	variants: { itemNumber: string }[];
	locale: string;
	selectedItemNumber: string | undefined;
	onSelectVariant: (itemNumber: string) => void;
	variantData: any;
	isLoading: boolean;
	productNumber: string;
	itemVariantCount?: number;
	selectedWarehouse?: string;
	columnAttributes?: Record<string, any> | null;
}

export function ProductVariantInfo({
	locale,
	selectedItemNumber,
	variantData,
	isLoading,
	productNumber,
	itemVariantCount,
	selectedWarehouse,
	columnAttributes,
}: ProductVariantInfoProps) {
	const t = useTranslations("Product");
	const { isCartChanging, setIsCartChanging } = useAppContext();

	const [quantity, setQuantity] = useState(1);
	const [price, setPrice] = useState<number | null>(null);
	const [loadingPrice, setLoadingPrice] = useState(false);
	const [adding, setAdding] = useState(false);
	const { setActiveTab } = useProductTabs();
	const [showAllAttributes, setShowAllAttributes] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleSeeAllVariants = () => {
		setActiveTab("variants");
		const target = document.querySelector("#product-table-details");
		target?.scrollIntoView({ behavior: "smooth" });
	};

	const { data: profile } = useGetProfileData();

	// Check if current customer is SAP customer
	const isSapCustomer = profile?.defaultCustomerNumber === SAP_CUSTOMER;

	// Get SAP number from columnAttributes for SAP customer
	const getSapNumber = () => {
		if (!isSapCustomer || !selectedItemNumber || !columnAttributes) return null;

		const attrs = columnAttributes[selectedItemNumber]?.attributes || [];
		const sapAttr = attrs.find(
			(attr: any) =>
				attr.attributeIdentifier === "CARD900000" ||
				attr.name?.toLowerCase() === "sap nr",
		);
		return sapAttr?.valueDef || null;
	};

	const sapNumber = getSapNumber();

	// Get warehouse info from columnAttributes (inventory data) if available
	const getWarehouseInfo = () => {
		if (!selectedItemNumber || !columnAttributes) return null;

		const inventory = columnAttributes[selectedItemNumber]?.inventory || [];
		if (!selectedWarehouse && !profile?.defaultWarehouseNumber) return null;

		let warehouseInfo;
		
		if (selectedWarehouse) {
			// selectedWarehouse from table is warehouseId (unique)
			const warehouseId = parseInt(selectedWarehouse);
			warehouseInfo = inventory.find((inv: any) => inv.warehouseId === warehouseId);
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
				warehouseName: warehouseInfo.warehouseName || `Lager ${warehouseInfo.warehouseId}`,
			};
		}

		return null;
	};

	const warehouseInfo = getWarehouseInfo();
	const selectedWarehouseBalance = warehouseInfo ? warehouseInfo.balance : 0;
	const selectedWarehouseName = warehouseInfo ? warehouseInfo.warehouseName : "hovedlager";

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

	const handleCopyGtin = () => {
		const gtin = variantData?.itemHeader?.GTIN;
		if (gtin) {
			navigator.clipboard.writeText(gtin);
			setCopied(true);
			setTimeout(() => setCopied(false), 1000);
		}
	};

	const attributes =
		variantData?.itemTechnicalSpec?.itemAttributes?.filter((attr: any) =>
			locale === "no"
				? attr.language === "Norwegian"
				: attr.language === "English",
		) ?? [];

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
					setPrice(result[0].bestPrice || 0);
				}
			} catch (err) {
				console.error("Failed to load price", err);
				setPrice(null);
			} finally {
				setLoadingPrice(false);
			}
		};

		loadPrice();
	}, [selectedItemNumber, quantity, profile]);

	const handleAddToCart = async () => {
		if (!selectedItemNumber) return;

		const warehouseNumber = profile?.defaultWarehouseNumber || "";
		// if (!warehouseNumber) {
		// 	toast(t("selectWarehouseFirst"), {
		// 		type: "warning",
		// 		position: "bottom-right",
		// 		autoClose: 2000,
		// 	});
		// 	return;
		// }

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

	return (
		<div className="space-y-4 py-4">
			<div className="mb-2 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h3 className="text-lg font-semibold text-[#0F1912]">
						Produktvariant
					</h3>
					{selectedWarehouseBalance > 0 && (
						<span className="inline-flex items-center gap-1 rounded-sm bg-[#DCF7E0] px-5 py-0.5 text-sm font-medium text-green-800">
							<Check className="h-4 w-4 text-green-800" />
							{selectedWarehouseBalance} {unit} på {selectedWarehouseName}
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={handleSeeAllVariants}
					className="text-sm font-medium text-green-600 hover:underline">
					{itemVariantCount
						? locale === "no"
							? `Se alle ${itemVariantCount} varianter`
							: `See all ${itemVariantCount} variants`
						: t("seeAllVariants")}{" "}
					→
				</button>
			</div>

			<div className="mb-0 flex flex-col gap-1">
				<p className="text-md font-light text-gray-500">
					<span className="font-semibold text-black">{t("itemNumber")}:</span>{" "}
					{variantData?.itemTechnicalSpec?.itemNumber}
				</p>
				<div className="relative">
					<button
						type="button"
						onClick={handleCopyGtin}
						className="text-md inline-flex items-center gap-1.5 font-light text-gray-500">
						<span className="font-semibold text-black">GTIN:</span>
						<span>{variantData?.itemHeader?.GTIN || "-"}</span>
						<Files className="h-4 w-4 cursor-pointer text-gray-500" />
					</button>
					{copied && (
						<div className="absolute top-full left-0 mt-1 rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow">
							{t("copied")}
						</div>
					)}
				</div>
				{isSapCustomer && sapNumber && (
					<p className="text-md font-light text-gray-500">
						<span className="font-semibold text-black">SAP nr:</span> {sapNumber}
					</p>
				)}
				<p className="text-md font-semibold text-[#0F1912]">Attributter:</p>
			</div>
			<div className="mt-2 flex items-end justify-between gap-6">
				<div className="flex flex-1 flex-col gap-2">
					<div className="flex max-w-[350px] flex-wrap gap-2">
						{(showAllAttributes ? attributes : attributes.slice(0, 3)).map(
							(attr: any) => (
								<span
									key={attr.attribute_identifier}
									className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
									{`${attr.name}: ${attr.value_def}`}
								</span>
							),
						)}

						{!showAllAttributes && attributes.length > 3 && (
							<button
								type="button"
								onClick={() => setShowAllAttributes(true)}
								className="rounded-md border border-green-600 bg-white px-4 py-1 text-xs font-medium text-green-600 hover:bg-green-50">
								+{attributes.length - 3} ›
							</button>
						)}

						{showAllAttributes && attributes.length > 3 && (
							<button
								type="button"
								onClick={() => setShowAllAttributes(false)}
								className="rounded-md border border-green-600 bg-white px-4 py-1 text-xs font-medium text-green-600 hover:bg-green-50">
								‹
							</button>
						)}
					</div>
				</div>

				<div className="flex items-center gap-4">
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

					<Button
						disabled={adding || !selectedItemNumber}
						variant="greenSolid"
						className="rounded-md px-4 disabled:opacity-60"
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

					<div className="ml-6 text-right">
						<p className="truncate text-xl leading-none font-semibold">
							{loadingPrice
								? t("loadingPrice")
								: price !== null
									? formatNorwegianCurrency(price)
									: "-"}
						</p>
						<p className="text-md text-left font-light">{t("excludingVat")}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
