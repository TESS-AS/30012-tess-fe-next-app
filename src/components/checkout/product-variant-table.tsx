"use client";

import { useState, useEffect, useMemo } from "react";

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
import { addToCart, getCart } from "@/services/carts.service";
import {
	calculateItemPrice,
	loadItemBalanceBatch,
} from "@/services/product.service";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import {
	Plus,
	Search,
	ChevronUp,
	ChevronDown,
	Check,
	Loader2,
	ShoppingCart,
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

interface Attribute {
	attributeIdentifier: string;
	name: string;
	dataType: string;
	valueDef: string;
	contentUnit?: string;
}

interface ProductVariantTableProps {
	variants: ProductVariant[];
	productNumber: string;
	hasSearch?: boolean;
	selectedItemNumber?: string;
	onSelectVariant?: (itemNumber: string) => void;
	hasAddToCart?: boolean;
	columnAttributes?: Record<string, any> | null;
	loadingAttributes?: boolean;
	hasQuantity?: boolean;
}

export default function ProductVariantTable({
	variants,
	productNumber,
	selectedItemNumber,
	onSelectVariant,
	hasSearch = true,
	hasAddToCart = false,
	columnAttributes,
	loadingAttributes,
	hasQuantity = false,
}: ProductVariantTableProps) {
	const t = useTranslations();
	const { data: profile } = useGetProfileData();

	const [searchQuery, setSearchQuery] = useState<string>("");
	const [quantities, setQuantities] = useState<Record<number, number>>({});
	const [warehouse, setWarehouse] = useState<Record<number, string>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [variantsWithWarehouses, setVariantsWithWarehouses] = useState<
		ProductVariant[]
	>([]);
	const [prices, setPrices] = useState<Record<number, number>>({});
	const [loading, setLoading] = useState<Record<number, boolean>>({});
	const [isCartChanging, setIsCartChanging] = useState(false);

	const [visibleCols, setVisibleCols] = useState<Record<ColumnKey, boolean>>({
		image: false,
		itemNumber: true,
		unspsc: false,
		contentUnit: false,
		price: true,
		warehouse: true,
		quantity: hasQuantity ?? true,
		cart: true,
	});

	const [visibleAttributes, setVisibleAttributes] = useState<
		Record<string, boolean>
	>({});

	const allAttributeNames = useMemo(() => {
		return Array.from(
			new Set(
				variantsWithWarehouses.flatMap(
					(variant) =>
						columnAttributes?.[variant.itemNumber]?.attributes?.map(
							(a: any) => a.name,
						) ?? [],
				),
			),
		);
	}, [variantsWithWarehouses, columnAttributes]);

	useEffect(() => {
		if (!allAttributeNames?.length) return;

		const visibleStaticCount = Object.entries(visibleCols).filter(
			([key, visible]) =>
				visible && !["quantity", "warehouse", "cart"].includes(key),
		).length;

		const fixedTailCount = Object.entries(visibleCols).filter(
			([key, visible]) =>
				visible && ["quantity", "warehouse", "cart"].includes(key),
		).length;

		const maxAttributeSlots = Math.max(
			0,
			6 - visibleStaticCount - fixedTailCount,
		);

		setVisibleAttributes((prev) => {
			const next: Record<string, boolean> = {};
			let visibleAttributeCount = 0;

			for (const name of allAttributeNames) {
				if (prev[name] !== undefined) {
					next[name] = prev[name];
					if (prev[name]) visibleAttributeCount++;
				} else {
					const shouldShow = visibleAttributeCount < maxAttributeSlots;
					next[name] = shouldShow;
					if (shouldShow) visibleAttributeCount++;
				}
			}

			return next;
		});
	}, [allAttributeNames, visibleCols]);

	const getTotalVisibleColumns = () => {
		const visibleStaticCount = Object.entries(visibleCols).filter(
			([key, visible]) =>
				visible && !["quantity", "warehouse", "cart"].includes(key),
		).length;

		const fixedTailCount = Object.entries(visibleCols).filter(
			([key, visible]) =>
				visible && ["quantity", "warehouse", "cart"].includes(key),
		).length;

		const visibleAttributeCount =
			Object.values(visibleAttributes).filter(Boolean).length;

		return visibleStaticCount + fixedTailCount + visibleAttributeCount;
	};

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
			if (!variants?.length || !profile) return;

			const newPrices: Record<number, number> = {};

			for (const variant of variants) {
				try {
					const [priceResult] = await calculateItemPrice(
						[
							{
								itemNumber: variant.itemNumber.toString(),
								quantity: 1,
								warehouseNumber: profile.defaultWarehouseNumber || "",
							},
						],
						profile.defaultCustomerNumber,
						profile.defaultCompanyNumber,
					);

					if (priceResult) {
						newPrices[variant.itemNumber] = priceResult.bestPrice || 0;
					}
				} catch (err) {
					console.error("Price fetch failed for", variant.itemNumber, err);
					newPrices[variant.itemNumber] = 0;
				}
			}

			setPrices(newPrices);
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

	const renderColumns = () => {
		const orderedStaticFirst: ColumnKey[] = [];
		dropdownOrder
			.filter(
				(key) => key !== "quantity" && key !== "warehouse" && key !== "cart",
			)
			.forEach((key) => {
				if (visibleCols[key]) orderedStaticFirst.push(key);
			});

		if (!orderedStaticFirst.includes("itemNumber") && visibleCols.itemNumber) {
			orderedStaticFirst.unshift("itemNumber");
		}

		const fixedTail: ColumnKey[] = [];
		if (hasQuantity && visibleCols.quantity) fixedTail.push("quantity");
		if (visibleCols.warehouse) fixedTail.push("warehouse");
		if (visibleCols.cart) fixedTail.push("cart");

		return [...orderedStaticFirst, ...fixedTail];
	};

	if (isLoading || loadingAttributes) {
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

	const extraAttributes: Attribute[] =
		columnAttributes?.[productNumber]?.attributes || [];

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
								className="group h-9 rounded-md border px-2">
								<Plus className="mr-2 h-5 w-4" />
								Rediger tabell
								<ChevronDown className="ml-2 inline h-5 w-5 group-data-[state=open]:hidden" />
								<ChevronUp className="ml-2 hidden h-5 w-5 group-data-[state=open]:inline" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-64 rounded-2xl p-2 shadow-lg">
							{dropdownOrder
								.filter((key) => key !== "quantity" && key !== "warehouse") // ❌ exclude fixed ones
								.map((key) => {
									const locked = lockedCols.includes(key);
									return (
										<DropdownMenuCheckboxItem
											key={key}
											checked={locked ? true : visibleCols[key]}
											disabled={locked}
											onSelect={(e) => e.preventDefault()}
											onCheckedChange={
												locked
													? undefined
													: (checked) =>
															setVisibleCols((prev) => ({
																...prev,
																[key]: !!checked,
															}))
											}>
											{columnLabels[key]}
										</DropdownMenuCheckboxItem>
									);
								})}
							{allAttributeNames.map((name) => (
								<DropdownMenuCheckboxItem
									key={`attr-${name}`}
									checked={visibleAttributes[name] ?? false}
									onSelect={(e) => e.preventDefault()}
									onCheckedChange={(checked) =>
										setVisibleAttributes((prev) => ({
											...prev,
											[name]: !!checked,
										}))
									}>
									{name}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}

			<div className="mt-5 max-h-[70vh] overflow-y-auto">
				<div className="overflow-x-auto">
					<Table className="w-full min-w-max rounded-md">
						<TableHeader className="bg-muted text-muted-foreground">
							<TableRow>
								{renderColumns()
									.filter(
										(col) => !["quantity", "warehouse", "cart"].includes(col),
									)
									.map((col) => {
										if (col === "image")
											return (
												<TableHead
													key="image"
													className="min-w-[80px]">
													BILDE
												</TableHead>
											);
										if (col === "itemNumber")
											return (
												<TableHead
													key="itemNumber"
													className="min-w-[120px]">
													Varenummer
												</TableHead>
											);
										if (col === "unspsc")
											return (
												<TableHead
													key="unspsc"
													className="min-w-[100px]">
													UNSPSC
												</TableHead>
											);
										if (col === "contentUnit")
											return (
												<TableHead
													key="contentUnit"
													className="min-w-[80px]">
													STYKK
												</TableHead>
											);
										if (col === "price")
											return (
												<TableHead
													key="price"
													className="min-w-[100px]">
													Pris
												</TableHead>
											);
										return null;
									})}
								{allAttributeNames
									.filter((name) => visibleAttributes[name])
									.map((name) => (
										<TableHead
											key={name}
											className="min-w-[120px]">
											{name}
										</TableHead>
									))}
								{renderColumns()
									.filter((col) =>
										["quantity", "warehouse", "cart"].includes(col),
									)
									.map((col) => {
										if (col === "quantity")
											return (
												<TableHead
													key="quantity"
													className="min-w-[120px]">
													Antall
												</TableHead>
											);
										if (col === "warehouse")
											return (
												<TableHead
													key="warehouse"
													className="min-w-[200px]">
													Lager
												</TableHead>
											);
										if (col === "cart")
											return (
												<TableHead
													key="cart"
													className="min-w-[140px]">
													Handlekurv
												</TableHead>
											);
										return null;
									})}
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredVariants.map((variant) => {
								const qty = quantities[variant.itemNumber] || 1;
								const selectedWarehouse = warehouse[variant.itemNumber];

								return (
									<TableRow
										key={variant.itemNumber}
										className="hover:bg-[#F0FCF2]">
										{renderColumns()
											.filter(
												(col) =>
													!["quantity", "warehouse", "cart"].includes(col),
											)
											.map((col) => {
												switch (col) {
													case "image":
														return (
															<TableCell
																key="image"
																className="min-w-[80px]">
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
														);
													case "itemNumber":
														return (
															<TableCell
																key="itemNumber"
																className="min-w-[120px]">
																{variant.itemNumber}
															</TableCell>
														);
													case "unspsc":
														return (
															<TableCell
																key="unspsc"
																className="min-w-[100px]">
																{variant.unspsc || "-"}
															</TableCell>
														);
													case "contentUnit":
														return (
															<TableCell
																key="contentUnit"
																className="min-w-[80px]">
																{variant.contentUnit}
															</TableCell>
														);
													case "price":
														return (
															<TableCell
																key="price"
																className="min-w-[100px]">
																{formatNorwegianCurrency(
																	prices[variant.itemNumber] ?? 0,
																)}
															</TableCell>
														);
													default:
														return null;
												}
											})}
										{allAttributeNames
											.filter((name) => visibleAttributes[name])
											.map((name) => {
												const attrs =
													columnAttributes?.[variant.itemNumber]?.attributes ??
													[];
												const attr = attrs.find((a: any) => a.name === name);

												return (
													<TableCell
														key={`${variant.itemNumber}-${name}`}
														className="min-w-[120px]">
														{attr?.valueDef ?? "-"}
													</TableCell>
												);
											})}
										{renderColumns()
											.filter((col) =>
												["quantity", "warehouse", "cart"].includes(col),
											)
											.map((col) => {
												switch (col) {
													case "quantity":
														return (
															<TableCell
																key="quantity"
																className="min-w-[120px]">
																<QuantityButtons
																	quantity={qty}
																	onIncrease={() =>
																		setQuantities((prev) => ({
																			...prev,
																			[variant.itemNumber]: qty + 1,
																		}))
																	}
																	onDecrease={() =>
																		setQuantities((prev) => ({
																			...prev,
																			[variant.itemNumber]: Math.max(
																				1,
																				qty - 1,
																			),
																		}))
																	}
																/>
															</TableCell>
														);
													case "warehouse":
														return (
															<TableCell
																key="warehouse"
																className="min-w-[200px]">
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
																				{w.balance !== undefined
																					? ` (${w.balance})`
																					: ""}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</TableCell>
														);
													case "cart":
														return (
															<TableCell
																key="cart"
																className="min-w-[140px]">
																{!hasAddToCart ? (
																	selectedItemNumber ===
																	variant.itemNumber.toString() ? (
																		<Button
																			size="sm"
																			className="bg-green-600 text-white">
																			<Check className="h-4 w-4" />
																			{t("Product.selected")}
																		</Button>
																	) : (
																		<Button
																			size="sm"
																			variant="outline"
																			onClick={() =>
																				onSelectVariant?.(
																					variant.itemNumber.toString(),
																				)
																			}>
																			{t("Product.select")}
																		</Button>
																	)
																) : (
																	<Button
																		variant="outlineGreen"
																		size="sm"
																		disabled={loading[variant.itemNumber]}
																		onClick={async () => {
																			if (!selectedWarehouse) {
																				toast(
																					t("Product.selectWarehouseFirst"),
																					{
																						type: "warning",
																						position: "bottom-right",
																						autoClose: 2000,
																					},
																				);
																				return;
																			}
																			const selectedWarehouseData =
																				variant.warehouses?.find(
																					(w) =>
																						w.warehouseNumber ===
																						selectedWarehouse,
																				);
																			if (
																				!selectedWarehouseData?.balance &&
																				selectedWarehouseData?.balance !== 0
																			) {
																				toast(
																					t("Product.noBalanceForWarehouse"),
																					{
																						type: "warning",
																						position: "bottom-right",
																						autoClose: 2000,
																					},
																				);
																				return;
																			}

																			setLoading((prev) => ({
																				...prev,
																				[variant.itemNumber]: true,
																			}));
																			try {
																				const response = await addToCart({
																					productNumber,
																					itemNumber:
																						variant.itemNumber.toString(),
																					quantity: qty,
																					warehouseNumber: selectedWarehouse,
																					companyNumber: "1",
																				});
																				setIsCartChanging(!isCartChanging);

																				if (
																					response.message ===
																					"Error adding to cart"
																				) {
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
																				console.error(
																					"Error adding to cart:",
																					err,
																				);
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
																				<ShoppingCart className="h-4 w-4" />
																				{t("Product.addToCart")}
																			</>
																		)}
																	</Button>
																)}
															</TableCell>
														);
													default:
														return null;
												}
											})}
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
