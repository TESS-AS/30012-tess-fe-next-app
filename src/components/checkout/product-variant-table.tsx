"use client";

import { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectContent,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useAppContext } from "@/lib/appContext";
import { addToCart, getCart } from "@/services/carts.service";
import {
	getProductPrice,
	loadItemBalanceBatch,
} from "@/services/product.service";
import { PriceResponse } from "@/types/search.types";
import { Minus, Plus, Loader2, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import QuantityButtons from "../ui/quantity-buttons";

interface Warehouse {
	warehouseNumber: string;
	balance?: number;
	warehouseName?: string;
}

interface ProductVariant {
	contentUnit: string;
	itemNumber: number;
	mediaId?: Array<any>;
	parentProdNumber: string;
	unspsc?: string | null;
	quantity?: number;
	warehouses?: Warehouse[];
	price?: number;
}

interface ProductVariantTableProps {
	variants: ProductVariant[];
	productNumber: string;
	hasSearch?: boolean;
}

export default function ProductVariantTable({
	variants,
	productNumber,
	hasSearch,
}: ProductVariantTableProps) {
	const t = useTranslations();
	const { data: profile } = useGetProfileData();

	const [searchQuery, setSearchQuery] = useState<string>("");
	const [quantities, setQuantities] = useState<Record<number, number>>({});
	const [loading, setLoading] = useState<Record<number, boolean>>({});
	const [warehouse, setWarehouse] = useState<Record<number, string>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [variantsWithWarehouses, setVariantsWithWarehouses] = useState<
		ProductVariant[]
	>([]);
	const [prices, setPrices] = useState<Record<number, number>>({});
	const { isCartChanging, setIsCartChanging } = useAppContext();

	useEffect(() => {
		const loadPrices = async () => {
			const priceData = await getProductPrice(
				profile?.defaultCustomerNumber,
				profile?.defaultCompanyNumber,
				productNumber,
			);
			priceData.map((item: PriceResponse) => {
				setPrices((prev) => ({
					...prev,
					[item.itemNumber]: item.basePrice || 0,
				}));
			});
		};
		loadPrices();
	}, []);

	useEffect(() => {
		const loadWarehousesData = async () => {
			try {
				if (!variants?.length) return;

				const itemNumbers = variants.map((variant) =>
					variant.itemNumber.toString(),
				);

				const warehousesData = await loadItemBalanceBatch(itemNumbers);
				console.log(warehousesData, "warehousedata");

				const updatedVariants = variants.map((variant) => {
					const variantWarehouses = (warehousesData || [])?.find(
						(w) => w.item_number === variant.itemNumber.toString(),
					);

					const warehouses =
						variantWarehouses?.warehouses.map((w) => ({
							warehouseNumber: w.warehouse_number,
							warehouseName: w.warehouse_name,
							balance: w.balance,
						})) || [];

					if (warehouses.length > 0) {
						setWarehouse((prev) => ({
							...prev,
							[variant.itemNumber]: warehouses[0].warehouseNumber,
						}));
					}

					return { ...variant, warehouses };
				});

				setVariantsWithWarehouses(updatedVariants);
				setQuantities({});
			} catch (error) {
				console.error("Error loading warehouses:", error);
			} finally {
				setIsLoading(false);
			}
		};

		setIsLoading(true);
		loadWarehousesData();
	}, [variants]);

	if (isLoading) {
		return (
			<div className="mt-4 space-y-4">
				<div className="bg-muted h-8 w-full animate-pulse rounded" />
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className="bg-muted h-16 w-full animate-pulse rounded"
					/>
				))}
			</div>
		);
	}

	if (!variantsWithWarehouses.length) {
		return (
			<div className="mt-4 flex min-h-[200px] items-center justify-center">
				<p className="text-muted-foreground text-sm">
					{t("Product.noVariants")}
				</p>
			</div>
		);
	}

	return (
		<div className="relative mt-4 w-full">
			{hasSearch && (
				<div className="flex items-center justify-between">
					<div className="relative flex items-center">
						<Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
						<Input
							type="search"
							placeholder={t("Common.searchProducts")}
							className="color-[#8A8F8C] w-[350px] border-[#8A8F8C] bg-[#F8F9F8] pl-8"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<Button
						variant="outline"
						onClick={() => setSearchQuery("")}>
						<Plus className="mr-2 h-4 w-4" />
						Legg til attributt
					</Button>
				</div>
			)}
			<Table className="my-4 w-full rounded-md">
				<TableHeader className="bg-muted text-muted-foreground">
					<TableRow>
						<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
							Image
						</TableHead>
						<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
							Parent Number
						</TableHead>
						<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
							Item Number
						</TableHead>
						<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
							UNSPSC
						</TableHead>
						<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
							Unit
						</TableHead>
						<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
							Price
						</TableHead>
						<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
							Qty
						</TableHead>
						<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
							Warehouse
						</TableHead>
						<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
							Actions
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{variantsWithWarehouses.map((variant) => {
						const qty = quantities[variant.itemNumber] || 1;
						const selectedWarehouse = warehouse[variant.itemNumber];

						return (
							<TableRow
								className="hover:bg-[#F0FCF2]"
								key={variant.itemNumber}>
								<TableCell>
									{variant.mediaId?.[0]?.url ? (
										<Image
											src={variant.mediaId[0].url}
											alt={variant.itemNumber.toString()}
											width={60}
											height={60}
											className="object-contain"
										/>
									) : (
										<div className="bg-muted h-[60px] w-[60px]" />
									)}
								</TableCell>
								<TableCell>{variant.parentProdNumber}</TableCell>
								<TableCell>{variant.itemNumber}</TableCell>
								<TableCell>{variant.unspsc || "-"}</TableCell>
								<TableCell>{variant.contentUnit}</TableCell>
								<TableCell>
									{prices[variant.itemNumber]?.toFixed(2) || "0.00"},- kr
								</TableCell>
								<TableCell>
									<QuantityButtons
										quantity={qty}
										onIncrease={async () =>
											setQuantities((prev) => ({
												...prev,
												[variant.itemNumber]: qty + 1,
											}))
										}
										onDecrease={async () =>
											setQuantities((prev) => ({
												...prev,
												[variant.itemNumber]: Math.max(1, qty - 1),
											}))
										}
									/>
								</TableCell>
								<TableCell>
									<Select
										value={selectedWarehouse || ""}
										onValueChange={(value) =>
											setWarehouse((prev) => ({
												...prev,
												[variant.itemNumber]: value,
											}))
										}>
										<SelectTrigger className="w-[180px]">
											<SelectValue placeholder={t("Product.selectWarehouse")} />
										</SelectTrigger>
										<SelectContent>
											{variant.warehouses?.map((w, index) => (
												<SelectItem
													key={`${variant.itemNumber}-${w.warehouseNumber}-${index}`}
													value={w.warehouseNumber}>
													{w.warehouseName} - {w.warehouseNumber}
													{w.balance !== undefined ? ` (${w.balance})` : ""}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</TableCell>
								<TableCell>
									<Button
										variant="outlineGreen"
										size="sm"
										disabled={loading[variant.itemNumber]}
										className="relative"
										onClick={async () => {
											if (!selectedWarehouse) {
												toast(t("Product.selectWarehouseFirst"), {
													type: "warning",
													position: "bottom-right",
													autoClose: 2000,
												});
												return;
											}

											// Check if the selected warehouse has a balance
											const selectedWarehouseData = variant.warehouses?.find(
												(w) => w.warehouseNumber === selectedWarehouse,
											);
											if (
												selectedWarehouseData?.balance === undefined ||
												selectedWarehouseData.balance === null
											) {
												toast(t("Product.noBalanceForWarehouse"), {
													type: "warning",
													position: "bottom-right",
													autoClose: 2000,
												});
												return;
											}

											setLoading((prev) => ({
												...prev,
												[variant.itemNumber]: true,
											}));

											try {
												const response = await addToCart({
													productNumber,
													itemNumber: variant.itemNumber.toString(),
													quantity: qty,
													warehouseNumber: selectedWarehouse,
													companyNumber: "1",
												});
												setIsCartChanging(!isCartChanging);

												if (response.message === "Error adding to cart") {
													throw new Error(response.message);
												}

												toast(t("Product.addedToCart"), {
													type: "success",
													position: "bottom-right",
													autoClose: 2000,
												});

												setQuantities((prev) => ({
													...prev,
													[variant.itemNumber]: 1,
												}));
												await getCart();
											} catch (err) {
												console.error("Error adding to cart:", err);
												toast(t("Product.errorAddingToCart"), {
													type: "error",
													position: "bottom-right",
													autoClose: 2000,
												});
											} finally {
												setLoading((prev) => ({
													...prev,
													[variant.itemNumber]: false,
												}));
											}
										}}>
										{loading[variant.itemNumber] ? (
											<>
												<Loader2 className="inline h-4 w-4 animate-spin" />
												{t("Product.adding")}
											</>
										) : (
											<>
												<ShoppingCart className="color-[#009640] h-4 w-4" />
												{t("Product.addToCart")}
											</>
										)}
									</Button>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
