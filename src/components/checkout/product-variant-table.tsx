"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
	ColumnKey,
	columnLabels,
	dropdownOrder,
	lockedCols,
} from "@/constants/productVariantTable";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useAppContext } from "@/lib/appContext";
import { addToCart, getCart } from "@/services/carts.service";
import {
	calculateItemPrice,
	loadItemBalanceBatch,
} from "@/services/product.service";
import { PriceResponse } from "@/types/search.types";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import {
	Plus,
	Loader2,
	Search,
	ShoppingCart,
	ChevronUp,
	ChevronDown,
	Check,
} from "lucide-react";
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
	hasSearch = true,
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

	const [visibleCols, setVisibleCols] = useState<Record<ColumnKey, boolean>>({
		image: false,
		itemNumber: true,
		unspsc: true,
		contentUnit: true,
		price: true,
		quantity: true,
		warehouse: true,
		cart: true,
	});

	const filteredVariants = variantsWithWarehouses.filter((v) => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return true;

		const tokens = q.split(/[,\s]+/).filter(Boolean);

		return tokens.every((tok) => {
			const item = v.itemNumber.toString().toLowerCase();
			const uns = (v.unspsc ?? "").toLowerCase();
			if (tok.startsWith("vn:") || tok.startsWith("varenummer:")) {
				const val = tok.replace(/^(vn:|varenummer:)/, "");
				return item.includes(val);
			}
			if (tok.startsWith("unspsc:")) {
				const val = tok.replace(/^unspsc:/, "");
				return uns.includes(val);
			}
			return item.includes(tok) || uns.includes(tok);
		});
	});

	useEffect(() => {
		const loadPrices = async () => {
			if (!variants?.length) return;

			const priceRequests = variants.map((variant) => ({
				itemNumber: variant.itemNumber.toString(),
				quantity: 1,
				warehouseNumber: profile?.defaultWarehouseNumber || "",
			}));

			const priceResults = await calculateItemPrice(
				priceRequests,
				profile?.defaultCustomerNumber,
				profile?.defaultCompanyNumber,
			);

			priceResults.forEach((item: PriceResponse) => {
				setPrices((prev) => ({
					...prev,
					[item.itemNumber]: item.bestPrice || 0,
				}));
			});
		};
		loadPrices();
	}, [variants, profile]);

	useEffect(() => {
		const loadWarehousesData = async () => {
			try {
				if (!variants?.length) return;

				const itemNumbers = variants.map((variant) =>
					variant.itemNumber.toString(),
				);

				const warehousesData = await loadItemBalanceBatch(itemNumbers);

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
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className="group h-9 rounded-md border border-[#C1C4C2] bg-white px-2 py-1 text-[#5A615D] shadow-none hover:border-[#005522] hover:bg-[#005522] hover:text-white focus-visible:ring-0 data-[state=open]:border-[#005522] data-[state=open]:bg-[#005522] data-[state=open]:text-white">
								<Plus className="mr-2 h-5 w-4" />
								Legg til attributt
								<ChevronDown className="ml-2 inline h-5 w-5 group-data-[state=open]:hidden" />
								<ChevronUp className="ml-2 hidden h-5 w-5 group-data-[state=open]:inline" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							align="end"
							className="w-64 rounded-2xl border-0 bg-white p-2 shadow-lg">
							<>
								{dropdownOrder.map((key) => {
									const locked = lockedCols.includes(key);
									return (
										<DropdownMenuCheckboxItem
											key={key}
											checked={locked ? true : visibleCols[key]}
											disabled={locked}
											onSelect={(e) => e.preventDefault()} // <-- crucial: prevents close
											onCheckedChange={
												locked
													? undefined
													: (checked) =>
															setVisibleCols((prev) => ({
																...prev,
																[key]: !!checked,
															}))
											}
											className={`group relative flex items-center rounded-md px-3 py-2 pl-10 text-[15px] select-none ${
												locked
													? "cursor-not-allowed text-[#8A8F8C] opacity-60"
													: "text-[#1B1E1C]"
											} focus:bg-[#F4FBF7] focus:outline-none`}>
											<span className="absolute top-1/2 left-2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-xs border border-gray-400 group-data-[state=checked]:border-[#009640] group-data-[state=checked]:bg-[#009640]">
												<Check className="h-3 w-3 text-white opacity-0 group-data-[state=checked]:opacity-100" />
											</span>
											{columnLabels[key]}
										</DropdownMenuCheckboxItem>
									);
								})}
							</>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
			<div className="mt-5 max-h-[70vh] overflow-y-auto">
				<Table className="w-full rounded-md">
					<TableHeader className="bg-muted text-muted-foreground">
						<TableRow>
							<>
								{visibleCols.image && (
									<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
										BILDE
									</TableHead>
								)}
								{visibleCols.itemNumber && (
									<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
										VARENUMMER
									</TableHead>
								)}
								{visibleCols.unspsc && (
									<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
										UNSPSC
									</TableHead>
								)}
								{visibleCols.contentUnit && (
									<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
										STYKK
									</TableHead>
								)}
								{visibleCols.price && (
									<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
										PRIS
									</TableHead>
								)}
								{visibleCols.quantity && (
									<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
										ANTALL
									</TableHead>
								)}
								{visibleCols.warehouse && (
									<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
										LAGER
									</TableHead>
								)}
								{visibleCols.cart && (
									<TableHead className="color-[#5A615D] border-b-1 border-[#C1C4C2] bg-[#F8F9F8]">
										HANDLEKURV
									</TableHead>
								)}
							</>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredVariants.map((variant) => {
							const qty = quantities[variant.itemNumber] || 1;
							const selectedWarehouse = warehouse[variant.itemNumber];

							return (
								<TableRow
									className="hover:bg-[#F0FCF2]"
									key={variant.itemNumber}>
									{visibleCols.image && (
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
									)}
									{visibleCols.itemNumber && (
										<TableCell>{variant.itemNumber}</TableCell>
									)}
									{visibleCols.unspsc && (
										<TableCell>{variant.unspsc || "-"}</TableCell>
									)}
									{visibleCols.contentUnit && (
										<TableCell>{variant.contentUnit}</TableCell>
									)}
									{visibleCols.price && (
										<TableCell>
											{formatNorwegianCurrency(prices[variant.itemNumber] ?? 0)}
										</TableCell>
									)}
									{visibleCols.quantity && (
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
									)}
									{visibleCols.warehouse && (
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
													<SelectValue
														placeholder={t("Product.selectWarehouse")}
													/>
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
									)}
									{visibleCols.cart && (
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

													const selectedWarehouseData =
														variant.warehouses?.find(
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
									)}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
