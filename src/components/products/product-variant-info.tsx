"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useAppContext } from "@/lib/appContext";
import { addToCart, getCart } from "@/services/carts.service";
import { calculateItemPrice } from "@/services/product.service";
import { useProductTabs } from "@/stores/useProductTabs";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { ShoppingCart, Loader2 } from "lucide-react";
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
}

export function ProductVariantInfo({
	locale,
	selectedItemNumber,
	variantData,
	isLoading,
	productNumber,
}: ProductVariantInfoProps) {
	const t = useTranslations("Product");
	const { isCartChanging, setIsCartChanging } = useAppContext();

	const [quantity, setQuantity] = useState(1);
	const [price, setPrice] = useState<number | null>(null);
	const [loadingPrice, setLoadingPrice] = useState(false);
	const [adding, setAdding] = useState(false);
	const { setActiveTab } = useProductTabs();

	const handleSeeAllVariants = () => {
		setActiveTab("variants");
		const target = document.querySelector("#product-table-details");
		target?.scrollIntoView({ behavior: "smooth" });
	};

	const { data: profile } = useGetProfileData();

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
		if (!warehouseNumber) {
			toast(t("selectWarehouseFirst"), {
				type: "warning",
				position: "bottom-right",
				autoClose: 2000,
			});
			return;
		}

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
		<div className="space-y-3">
			<div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4">
				<h3 className="flex items-center justify-between text-lg font-semibold text-[#0F1912]">
					{t("variantTitle")}
					<button
						type="button"
						onClick={handleSeeAllVariants}
						className="cursor-pointer text-sm font-medium text-green-600 hover:underline">
						{t("seeAllVariants")}
					</button>
				</h3>

				{isLoading && <p className="text-gray-500">{t("loadingVariant")}</p>}

				{!isLoading && variantData && (
					<>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
							{attributes.map((attr: any) => (
								<div
									key={attr.attribute_identifier}
									className="space-y-2">
									<label className="block text-sm font-medium text-gray-900">
										{attr.name ||
											attr.name_key_language ||
											t("unknownAttribute")}
									</label>

									<Select
										disabled
										defaultValue={attr.value_def}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="-" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={attr.value_def}>
												{attr.value_def}
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							))}
						</div>

						<div className="flex items-center justify-between rounded-md border bg-white p-3">
							<div>
								<p className="text-md font-normal">
									{t("itemNumber")}: {variantData.itemTechnicalSpec.itemNumber}
								</p>
								<p className="text-md font-normal text-[#5A615D]">
									{t("inStockDelivery")}
								</p>
							</div>

							<div className="text-right">
								<p className="text-md font-semibold text-[#009640]">
									{loadingPrice
										? t("loadingPrice")
										: price !== null
											? formatNorwegianCurrency(price)
											: "-"}
								</p>
								<p className="text-md text-[#5A615D]">
									{t("excludingVat")}
								</p>{" "}
							</div>
						</div>
					</>
				)}
			</div>

			<div className="flex items-center gap-2 rounded-md border border-gray-200 p-4">
				<Button
					className="h-[32px] w-[34px] border-[#C1C4C2] text-[#0F1912]"
					variant="outline"
					size="icon"
					onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
					-
				</Button>
				<span className="flex h-[32px] w-[34px] items-center justify-center border border-gray-100 text-center">
					{quantity}
				</span>
				<Button
					variant="outline"
					className="h-[32px] w-[34px] border-[#C1C4C2] text-[#0F1912]"
					size="icon"
					onClick={() => setQuantity((q) => q + 1)}>
					+
				</Button>

				<Button
					disabled={adding || !selectedItemNumber}
					className="ml-4 flex flex-1 items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
					onClick={handleAddToCart}>
					{adding ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							{t("adding")}
						</>
					) : (
						<>
							<ShoppingCart className="h-4 w-4" />
							{t("addToCart")}
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
