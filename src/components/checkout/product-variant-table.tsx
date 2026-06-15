"use client";

import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";

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
import { SAP_CUSTOMER } from "@/constants/checkout";
import {
	ColumnKey,
	columnHeaderLabels,
	columnLabels,
	dropdownOrder,
	lockedCols,
} from "@/constants/productVariantTable";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useAppContext } from "@/lib/appContext";
import { priceItemsByCompany } from "@/lib/cart-pricing";
import {
	buildWarehouseOptions,
	resolveWarehouse,
	WarehouseOption,
} from "@/lib/warehouse";
import { addToCart, getCart } from "@/services/carts.service";
import {
	calculateItemPrice,
	loadItemBalanceBatch,
} from "@/services/product.service";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import {
	Search,
	ChevronUp,
	ChevronDown,
	Check,
	Loader2,
	ShoppingCart,
	CheckCircle,
	SquarePen,
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
	onWarehouseChange?: (itemNumber: string, warehouseNumber: string) => void;
	onQuantityChange?: (itemNumber: string, quantity: number) => void;
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
	onWarehouseChange,
	onQuantityChange,
}: ProductVariantTableProps) {
	const t = useTranslations();
	const { data: profile } = useGetProfileData();
	const { isCartChanging, setIsCartChanging, setIsAuthOpen, showCartNotification } = useAppContext();
	const isSapCustomer = SAP_CUSTOMER.includes(profile?.defaultCustomerNumber || "");

	const multiple = useMemo(() => {
		const raw = columnAttributes?.productData?.multiple;
		if (!raw) return 1;
		const parsed = parseFloat(raw);
		return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
	}, [columnAttributes?.productData?.multiple]);

	const [searchQuery, setSearchQuery] = useState<string>("");
	const [quantities, setQuantities] = useState<Record<number, number>>({});
	const [warehouse, setWarehouse] = useState<Record<number, string>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [variantsWithWarehouses, setVariantsWithWarehouses] = useState<
		ProductVariant[]
	>([]);
	const [prices, setPrices] = useState<Record<number, number>>({});
	const [loading, setLoading] = useState<Record<number, boolean>>({});
	const initializedWarehousesRef = useRef<Set<number>>(new Set());
	const pendingWarehouseChangesRef = useRef<Array<[string, string]>>([]);
	const tableWrapperRef = useRef<HTMLDivElement>(null);
	const looseTableWidthRef = useRef<number>(0);
	const [compact, setCompact] = useState(false);

	// Reset initialized warehouses when variants change
	useEffect(() => {
		initializedWarehousesRef.current.clear();
		pendingWarehouseChangesRef.current = [];
	}, [variants]);

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
		// Get default attributes from productData (prioritized first)
		const defaultAttributes =
			columnAttributes?.productData?.defaultAttributes || [];

		// Check if mediaId is in defaultAttributes (by name or attributeIdentifier)
		const hasMediaIdInDefaults = defaultAttributes.some(
			(attr: any) =>
				attr.name?.toLowerCase() === "mediaid" ||
				attr.name?.toLowerCase() === "media id" ||
				attr.attributeIdentifier?.toLowerCase() === "mediaid" ||
				attr.attributeIdentifier?.toLowerCase() === "media id",
		);

		const defaultAttributeNames = defaultAttributes
			.map((attr: any) => attr.name)
			.filter(
				(name: any): name is string =>
					typeof name === "string" && name.trim() !== "",
			)
			// Filter out mediaId from default attribute names
			.filter(
				(name: string) =>
					name?.toLowerCase() !== "mediaid" &&
					name?.toLowerCase() !== "media id",
			);

		// Get all attribute names from variants
		const allVariantNames = Array.from(
			new Set(
				variantsWithWarehouses.flatMap(
					(variant) =>
						columnAttributes?.[variant.itemNumber]?.attributes?.map(
							(a: any) => a.name,
						) ?? [],
				),
			),
		)
			.filter(
				(name): name is string =>
					typeof name === "string" && name.trim() !== "",
			)
			// Filter out mediaId from variant attribute names
			.filter(
				(name: string) =>
					name?.toLowerCase() !== "mediaid" &&
					name?.toLowerCase() !== "media id",
			);

		// Create a Set of default attribute names for quick lookup
		const defaultNamesSet = new Set(defaultAttributeNames);

		// Combine: default attributes first, then other attributes (excluding duplicates)
		const otherAttributes = allVariantNames.filter(
			(name) => !defaultNamesSet.has(name),
		);

		const orderedNames = [...defaultAttributeNames, ...otherAttributes];

		// If mediaId is in defaultAttributes, add "bilde" to attribute names (replace mediaId)
		if (hasMediaIdInDefaults && !orderedNames.includes("bilde")) {
			orderedNames.unshift("bilde");
		}

		// Filter out SAP NR for non-SAP customers
		if (!isSapCustomer) {
			return orderedNames.filter(
				(name) =>
					name?.toLowerCase() !== "sap nr" &&
					name?.toLowerCase() !== "sap number",
			);
		}
		return orderedNames;
	}, [variantsWithWarehouses, columnAttributes, isSapCustomer]);

	const getWarehouseOptions = useMemo(() => {
		const optionsMap: Record<number, WarehouseOption[]> = {};
		const warehouseLabel = t("Product.warehouses");
		variantsWithWarehouses.forEach((variant) => {
			optionsMap[variant.itemNumber] = buildWarehouseOptions(
				columnAttributes?.[variant.itemNumber]?.inventory,
				{ warehouseLabel },
			);
		});
		return optionsMap;
	}, [variantsWithWarehouses, columnAttributes, t]);

	useEffect(() => {
		if (!allAttributeNames?.length) return;

		// Check if defaultAttributes exist
		const defaultAttributes =
			columnAttributes?.productData?.defaultAttributes || [];
		const hasDefaultAttributes = defaultAttributes.length > 0;

		setVisibleAttributes((prev) => {
			const next: Record<string, boolean> = {};

			if (hasDefaultAttributes) {
				// Check if mediaId is in defaultAttributes (by name or attributeIdentifier)
				const hasMediaIdInDefaults = defaultAttributes.some(
					(attr: any) =>
						attr.name?.toLowerCase() === "mediaid" ||
						attr.name?.toLowerCase() === "media id" ||
						attr.attributeIdentifier?.toLowerCase() === "mediaid" ||
						attr.attributeIdentifier?.toLowerCase() === "media id",
				);

				// If defaultAttributes exist, show ONLY those attributes (excluding mediaId)
				const defaultAttributeNames = defaultAttributes
					.map((attr: any) => attr.name)
					.filter(
						(name: any): name is string =>
							typeof name === "string" && name.trim() !== "",
					)
					// Filter out mediaId from default attribute names
					.filter(
						(name: string) =>
							name?.toLowerCase() !== "mediaid" &&
							name?.toLowerCase() !== "media id",
					);

				for (const name of allAttributeNames) {
					// Filter out SAP NR for non-SAP customers
					if (
						!isSapCustomer &&
						(name?.toLowerCase() === "sap nr" ||
							name?.toLowerCase() === "sap number")
					) {
						next[name] = false;
						continue;
					}
					// Filter out mediaId (should already be filtered, but double-check)
					if (
						name?.toLowerCase() === "mediaid" ||
						name?.toLowerCase() === "media id"
					) {
						next[name] = false;
						continue;
					}
					// Show if it's in defaultAttributes, or if it's "bilde" and mediaId is in defaults
					const isInDefaults = defaultAttributeNames.includes(name);
					const isBildeMapping =
						name?.toLowerCase() === "bilde" && hasMediaIdInDefaults;
					next[name] = isInDefaults || isBildeMapping;
				}
			} else {
				// Original behavior: show up to maxAttributeSlots
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
					10 - visibleStaticCount - fixedTailCount,
				);

				let visibleAttributeCount = 0;

				for (const name of allAttributeNames) {
					// Filter out SAP NR for non-SAP customers
					if (
						!isSapCustomer &&
						(name?.toLowerCase() === "sap nr" ||
							name?.toLowerCase() === "sap number")
					) {
						next[name] = false;
						continue;
					}
					// Filter out mediaId (should already be filtered, but double-check)
					if (
						name?.toLowerCase() === "mediaid" ||
						name?.toLowerCase() === "media id"
					) {
						next[name] = false;
						continue;
					}
					// Always respect the limit, even for previously selected attributes
					const shouldShow = visibleAttributeCount < maxAttributeSlots;
					next[name] = shouldShow;
					if (shouldShow) visibleAttributeCount++;
				}
			}

			return next;
		});
	}, [allAttributeNames, visibleCols, isSapCustomer, columnAttributes]);

	// Process pending warehouse changes after state updates to avoid updating parent during render
	useEffect(() => {
		if (pendingWarehouseChangesRef.current.length > 0 && onWarehouseChange) {
			pendingWarehouseChangesRef.current.forEach(
				([itemNumber, warehouseNumber]) => {
					onWarehouseChange(itemNumber, warehouseNumber);
				},
			);
			pendingWarehouseChangesRef.current = [];
		}
	}, [warehouse, onWarehouseChange]);

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

	const resolveVariantWarehouse = (
		variantItemNumber: string | number,
		candidate?: string,
	): { warehouseNumber: string; companyNumber: string } => {
		const resolved = resolveWarehouse(
			columnAttributes?.[variantItemNumber]?.inventory,
			candidate,
			{
				warehouseNumber: profile?.defaultWarehouseNumber,
				companyNumber: profile?.defaultCompanyNumber
					? String(profile.defaultCompanyNumber)
					: undefined,
			},
		);
		return {
			warehouseNumber: resolved?.warehouseNumber ?? "",
			companyNumber: resolved?.companyNumber ?? "1",
		};
	};

	// Pick the active warehouse for a variant the same way the Select does:
	// user's manual pick if any, else the auto-preselected first-in-stock
	// warehouse. Used everywhere prices are calculated so the displayed price
	// always matches what the Select shows (and what ProductInfo displays).
	//
	// `explicitCandidate` lets callers bypass the `warehouse` state — needed in
	// the Select onValueChange where the just-picked value hasn't been flushed
	// to state yet, so reading from closure would be stale.
	const pickActiveWarehouseForVariant = (
		variantItemNumber: string | number,
		explicitCandidate?: string,
	) => {
		const candidate =
			explicitCandidate ??
			(warehouse as Record<string | number, string>)[variantItemNumber];
		if (candidate) return resolveVariantWarehouse(variantItemNumber, candidate);
		const firstInStock = buildWarehouseOptions(
			columnAttributes?.[variantItemNumber]?.inventory,
			{ warehouseLabel: t("Product.warehouses") },
		)[0]?.warehouseNumber;
		return resolveVariantWarehouse(variantItemNumber, firstInStock);
	};

	const handleAddToCart = async (
		variant: ProductVariant,
		qty: number,
		selectedWarehouse?: string,
	) => {
		setLoading((prev) => ({
			...prev,
			[variant.itemNumber]: true,
		}));

		try {
			const { warehouseNumber, companyNumber } = selectedWarehouse
				? resolveVariantWarehouse(variant.itemNumber, selectedWarehouse)
				: pickActiveWarehouseForVariant(variant.itemNumber);
			const response = await addToCart({
				productNumber,
				itemNumber: variant.itemNumber.toString(),
				quantity: qty,
				warehouseNumber,
				companyNumber,
			});

			setIsCartChanging(!isCartChanging);

			if (response.message === "Error adding to cart") {
				throw new Error(response.message);
			}

			showCartNotification({
				itemName: columnAttributes?.[variant.itemNumber]?.itemName ?? variant.itemNumber.toString(),
				itemNumber: variant.itemNumber.toString(),
				quantity: qty,
				imageUrl: columnAttributes?.[variant.itemNumber]?.mediaId?.[0]?.url || variant.mediaId?.[0]?.url,
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
	};

	const calculatePriceForVariant = async (
		variant: ProductVariant,
		quantityOverride?: number,
		warehouseOverride?: string,
	) => {
		if (!profile) return;

		try {
			setLoading((prev) => ({ ...prev, [variant.itemNumber]: true }));

			const { warehouseNumber, companyNumber } = pickActiveWarehouseForVariant(
				variant.itemNumber,
				warehouseOverride,
			);

			const effectiveQuantity =
				quantityOverride ?? quantities[variant.itemNumber] ?? multiple;

			const [priceResult] = await calculateItemPrice(
				[
					{
						itemNumber: variant.itemNumber.toString(),
						quantity: effectiveQuantity,
						warehouseNumber,
					},
				],
				profile.defaultCustomerNumber,
				companyNumber,
			);

			if (priceResult) {
				setPrices((prev) => ({
					...prev,
					[variant.itemNumber]: priceResult.bestPrice || 0,
				}));
			}
		} catch (err) {
			console.error("Price fetch failed for", variant.itemNumber, err);
			setPrices((prev) => ({
				...prev,
				[variant.itemNumber]: 0,
			}));
		} finally {
			setLoading((prev) => ({ ...prev, [variant.itemNumber]: false }));
		}
	};

	useEffect(() => {
		const loadPrices = async () => {
			// Wait for columnAttributes — pickActiveWarehouseForVariant reads
			// inventory from there to pick first-in-stock; without it we'd
			// fall back to profile.defaultWarehouseNumber, which may not be
			// what the Select ends up showing, and prices would mismatch
			// ProductInfo.
			if (!variants?.length || !profile || !columnAttributes) return;

			try {
				const requests = variants.map((variant) => {
					const { warehouseNumber, companyNumber } =
						pickActiveWarehouseForVariant(variant.itemNumber);
					return {
						itemNumber: variant.itemNumber.toString(),
						quantity: 1,
						warehouseNumber,
						companyNumber,
					};
				});
				const priceResults = await priceItemsByCompany(
					requests,
					profile.defaultCustomerNumber,
					profile.defaultCompanyNumber
						? String(profile.defaultCompanyNumber)
						: "1",
				);

				const priceMap = new Map<string, number>();
				priceResults?.forEach((result: any) => {
					if (result.itemNumber && result.bestPrice !== undefined) {
						// Use string itemNumber as key to handle both numeric and alphanumeric item numbers
						priceMap.set(result.itemNumber.toString(), result.bestPrice);
					}
				});

				const newPrices: Record<number, number> = {};
				variants.forEach((variant) => {
					const variantItemNumberStr = variant.itemNumber.toString();
					const price = priceMap.get(variantItemNumberStr) ?? 0;
					newPrices[variant.itemNumber] = price;
				});

				setPrices(newPrices);
			} catch (err) {
				console.error("Price fetch failed", err);
				const errorPrices: Record<number, number> = {};
				variants.forEach((variant) => {
					errorPrices[variant.itemNumber] = 0;
				});
				setPrices(errorPrices);
			}
		};

		loadPrices();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [variants, profile, columnAttributes]);

	useEffect(() => {
		const loadWarehousesData = async () => {
			try {
				if (!variants?.length) return;

				const warehouseLabel = t("Product.warehouses");
				const updatedVariants = variants.map((variant) => {
					const warehouseOptions = buildWarehouseOptions(
						columnAttributes?.[variant.itemNumber]?.inventory,
						{ warehouseLabel },
					);
					const warehouses = warehouseOptions.map((w) => ({
						warehouseNumber: w.warehouseNumber,
						warehouseName: w.warehouseName,
						balance: w.balance,
					}));

					if (warehouseOptions.length > 0) {
						const variantKey = variant.itemNumber;

						if (!initializedWarehousesRef.current.has(variantKey)) {
							const warehouseToPreselect = warehouseOptions[0].warehouseNumber;
							initializedWarehousesRef.current.add(variantKey);
							setWarehouse((prev) => {
								if (prev[variantKey]) return prev;
								pendingWarehouseChangesRef.current.push([
									variantKey.toString(),
									warehouseToPreselect,
								]);
								return { ...prev, [variantKey]: warehouseToPreselect };
							});
						}
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [variants, columnAttributes]);

	useLayoutEffect(() => {
		const wrapper = tableWrapperRef.current;
		if (!wrapper) return;

		const measure = () => {
			const table = wrapper.querySelector("table");
			if (!table) return;

			const wrapperWidth = wrapper.clientWidth;
			const tableWidth = table.scrollWidth;

			if (!compact) {
				looseTableWidthRef.current = tableWidth;
				if (tableWidth > wrapperWidth) setCompact(true);
			} else {
				const looseWidth = looseTableWidthRef.current;
				if (looseWidth > 0 && wrapperWidth >= looseWidth + 8) {
					setCompact(false);
				}
			}
		};

		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(wrapper);
		return () => ro.disconnect();
	}, [
		compact,
		variantsWithWarehouses.length,
		allAttributeNames.length,
		visibleAttributes,
		visibleCols,
	]);

	const renderColumns = () => {
		const orderedStaticFirst: ColumnKey[] = [];
		dropdownOrder
			.filter(
				(key) =>
					key !== "quantity" &&
					key !== "warehouse" &&
					key !== "cart" &&
					key !== "price" &&
					key !== "image",
			)
			.forEach((key) => {
				if (visibleCols[key]) orderedStaticFirst.push(key);
			});

		if (!orderedStaticFirst.includes("itemNumber") && visibleCols.itemNumber) {
			orderedStaticFirst.unshift("itemNumber");
		}

		const fixedTail: ColumnKey[] = [];

		if (visibleCols.warehouse && profile) fixedTail.push("warehouse");
		if (visibleCols.price) fixedTail.push("price");
		if (hasQuantity && visibleCols.quantity && profile)
			fixedTail.push("quantity");
		if (hasAddToCart && visibleCols.cart && profile) fixedTail.push("cart");

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
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="relative flex items-center">
						<Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
						<Input
							type="search"
							placeholder={t("Common.searchProducts")}
							className="color-[#8A8F8C] w-full border-[#8A8F8C] bg-[#F8F9F8] pl-8 sm:w-[350px]"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className="group hidden h-9 items-center rounded-md border border-[#D3D3D3] bg-white px-3 text-sm font-normal text-[#5A615D] shadow-none hover:bg-gray-50 md:inline-flex">
								<SquarePen className="mr-2 h-4 w-4 text-[#5A615D]" />
								<span>Rediger tabell</span>
								<ChevronDown className="ml-1 inline h-4 w-4 text-[#5A615D] group-data-[state=open]:hidden" />
								<ChevronUp className="ml-1 hidden h-4 w-4 text-[#5A615D] group-data-[state=open]:inline" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-64 rounded-2xl p-2 shadow-lg">
							{dropdownOrder
								.filter(
									(key) =>
										key !== "quantity" &&
										key !== "warehouse" &&
										key !== "image",
								) // ❌ exclude fixed ones and image
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

			<div
				ref={tableWrapperRef}
				className="mt-5">
				<Table
					noOverflow
					className="w-full min-w-max rounded-md">
					<TableHeader className="text-muted-foreground sticky top-0 bg-gray-50">
						<TableRow>
							{renderColumns()
								.filter(
									(col) =>
										![
											"quantity",
											"warehouse",
											"cart",
											"price",
											"image",
										].includes(col),
								)
								.map((col) => {
									return (
										<TableHead
											key={col}
											className={`py-2 align-top ${compact ? "px-2" : "px-4"} ${col !== "itemNumber" ? "hidden md:table-cell" : ""} ${
												col === "itemNumber"
													? compact
														? "min-w-[90px]"
														: "min-w-[120px]"
													: col === "unspsc"
														? compact
															? "min-w-[90px]"
															: "min-w-[100px]"
														: col === "contentUnit"
															? compact
																? "min-w-[70px]"
																: "min-w-[80px]"
															: col === "price"
																? compact
																	? "min-w-[90px]"
																	: "min-w-[100px]"
																: compact
																	? "min-w-[100px]"
																	: "min-w-[120px]"
											}`}>
											<span
												className={compact ? "whitespace-pre-line" : ""}>
												{compact
													? columnHeaderLabels[col]
													: columnLabels[col]}
											</span>
										</TableHead>
									);
								})}
							<TableHead
								className={`py-2 align-top ${compact ? "min-w-[110px] max-w-[140px] px-2" : "min-w-[150px] px-4"}`}>
								NAVN
							</TableHead>
							{allAttributeNames
								.filter((name) => visibleAttributes[name])
								.map((name) => (
									<TableHead
										key={name}
										className={`hidden py-2 align-top md:table-cell ${
											compact
												? "min-w-[90px] max-w-[110px] break-words px-2 whitespace-normal"
												: "min-w-[120px] px-4"
										}`}>
										{name.toUpperCase()}
									</TableHead>
								))}
							{renderColumns()
								.filter((col) =>
									["quantity", "warehouse", "cart", "price"].includes(col),
								)
								.map((col) => {
									return (
										<TableHead
											key={col}
											className={`hidden py-2 align-top md:table-cell ${compact ? "px-2" : "px-4"} ${
												col === "quantity"
													? compact
														? "min-w-[100px]"
														: "min-w-[120px]"
													: col === "warehouse"
														? compact
															? "min-w-[170px]"
															: "min-w-[200px]"
														: col === "cart"
															? compact
																? "min-w-[100px]"
																: "min-w-[120px]"
															: compact
																? "min-w-[90px]"
																: "min-w-[100px]"
											}`}>
											<span
												className={compact ? "whitespace-pre-line" : ""}>
												{compact
													? columnHeaderLabels[col]
													: columnLabels[col]}
											</span>
										</TableHead>
									);
								})}
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredVariants.map((variant) => {
							// Default to `multiple` (BE-defined pack size) — products with
							// multiple > 1 must be ordered in that step, so the initial
							// displayed qty and the qty passed to add-to-cart should both
							// honor it.
							const qty = quantities[variant.itemNumber] || multiple;
							const selectedWarehouse = warehouse[variant.itemNumber];

							const isSelected =
								selectedItemNumber === variant.itemNumber.toString();

							return (
								<TableRow
									key={variant.itemNumber}
									className={`cursor-pointer hover:bg-[#F0FCF2] h-[52px] ${
										isSelected
											? "border-l-4 border-l-green-700 bg-[#F0FCF2]"
											: ""
									}`}
									onClick={() => {
										if (onSelectVariant) {
											onSelectVariant(variant.itemNumber.toString());
											setSearchQuery("");
										}
									}}>
									{renderColumns()
										.filter(
											(col) =>
												![
													"quantity",
													"warehouse",
													"cart",
													"price",
													"image",
												].includes(col),
										)
										.map((col) => {
											switch (col) {
												case "itemNumber":
													return (
														<TableCell
															key="itemNumber"
															className={`py-2 ${compact ? "min-w-[90px] px-2" : "min-w-[120px] px-4"}`}>
															{variant.itemNumber}
														</TableCell>
													);
												case "unspsc":
													const unspscValue =
														columnAttributes?.[
															variant.itemNumber
														]?.attributes?.find((attr: any) => attr.unspsc)
															?.unspsc ||
														columnAttributes?.[
															variant.itemNumber
														]?.attributes?.find(
															(attr: any) =>
																attr.attributeIdentifier === "unspsc" ||
																attr.name?.toLowerCase().includes("unspsc"),
														)?.valueDef ||
														variant.unspsc ||
														"-";
													return (
														<TableCell
															key="unspsc"
															className={`hidden py-2 md:table-cell ${compact ? "min-w-[90px] px-2" : "min-w-[100px] px-4"}`}>
															{unspscValue}
														</TableCell>
													);
												case "contentUnit":
													const contentUnitValue =
														columnAttributes?.[
															variant.itemNumber
														]?.attributes?.find((attr: any) => attr.contentUnit)
															?.contentUnit ||
														columnAttributes?.[
															variant.itemNumber
														]?.attributes?.find(
															(attr: any) =>
																attr.attributeIdentifier === "contentUnit" ||
																attr.name
																	?.toLowerCase()
																	.includes("contentunit") ||
																attr.name
																	?.toLowerCase()
																	.includes("content unit"),
														)?.valueDef ||
														variant.contentUnit ||
														"-";
													return (
														<TableCell
															key="contentUnit"
															className={`hidden py-2 md:table-cell ${compact ? "min-w-[70px] px-2" : "min-w-[80px] px-4"}`}>
															{contentUnitValue}
														</TableCell>
													);
												default:
													return null;
											}
										})}
									<TableCell
										className={`py-2 ${compact ? "min-w-[110px] max-w-[140px] px-2" : "min-w-[150px] px-4"}`}
										title={
											columnAttributes?.[variant.itemNumber]?.itemName ?? undefined
										}>
										{compact ? (
											<div className="truncate">
												{columnAttributes?.[variant.itemNumber]?.itemName ??
													"-"}
											</div>
										) : (
											(columnAttributes?.[variant.itemNumber]?.itemName ?? "-")
										)}
									</TableCell>
									{allAttributeNames
										.filter((name) => visibleAttributes[name])
										.map((name) => {
											// Map "bilde" to mediaId
											if (name?.toLowerCase() === "bilde") {
												const variantAttrs =
													columnAttributes?.[variant.itemNumber];
												const mediaId =
													variantAttrs && !Array.isArray(variantAttrs)
														? variantAttrs.mediaId?.[0]?.url
														: undefined;
												const imageUrl = mediaId || variant.mediaId?.[0]?.url;
												return (
													<TableCell
														key={`${variant.itemNumber}-${name}`}
														className={`hidden py-2 md:table-cell ${compact ? "min-w-[90px] max-w-[110px] px-2" : "min-w-[120px] px-4"}`}>
														{imageUrl ? (
															<Image
																src={imageUrl}
																alt={variant.itemNumber.toString()}
																width={40}
																height={40}
																className="object-contain"
																loading="eager"
															/>
														) : (
															"-"
														)}
													</TableCell>
												);
											}

											const attrs =
												columnAttributes?.[variant.itemNumber]?.attributes ??
												[];

											// Try to find by name first
											let attr = attrs.find((a: any) => a.name === name);

											// If not found and this is a default attribute, try matching by attributeIdentifier
											if (!attr) {
												const defaultAttr =
													columnAttributes?.productData?.defaultAttributes?.find(
														(da: any) => da.name === name,
													);
												if (defaultAttr?.attributeIdentifier) {
													attr = attrs.find(
														(a: any) =>
															a.attributeIdentifier ===
															defaultAttr.attributeIdentifier,
													);
												}
											}

											return (
												<TableCell
													key={`${variant.itemNumber}-${name}`}
													className={`hidden py-2 md:table-cell ${compact ? "min-w-[90px] max-w-[110px] px-2" : "min-w-[120px] px-4"}`}
													title={attr?.valueDef ?? undefined}>
													{compact ? (
														<div className="truncate">
															{attr?.valueDef ?? "-"}
														</div>
													) : (
														(attr?.valueDef ?? "-")
													)}
												</TableCell>
											);
										})}
									{renderColumns()
										.filter((col) =>
											["quantity", "warehouse", "cart", "price"].includes(col),
										)
										.map((col) => {
											switch (col) {
												case "quantity":
													return (
														<TableCell
															key="quantity"
															className={`hidden py-2 md:table-cell ${compact ? "min-w-[100px] px-2" : "min-w-[120px] px-4"}`}
															onClick={(e) => e.stopPropagation()}>
															<div className="flex justify-between">
																<QuantityButtons
																	quantity={qty}
																	step={multiple}
																	min={multiple}
																	onIncrease={() => {
																		const newQty = qty + multiple;
																		setQuantities((prev) => ({
																			...prev,
																			[variant.itemNumber]: newQty,
																		}));
																		onQuantityChange?.(
																			variant.itemNumber.toString(),
																			newQty,
																		);
																		void calculatePriceForVariant(
																			variant,
																			newQty,
																		);
																	}}
																	onDecrease={() => {
																		const newQty = Math.max(multiple, qty - multiple);
																		setQuantities((prev) => ({
																			...prev,
																			[variant.itemNumber]: newQty,
																		}));
																		onQuantityChange?.(
																			variant.itemNumber.toString(),
																			newQty,
																		);
																		void calculatePriceForVariant(
																			variant,
																			newQty,
																		);
																	}}
																/>
															</div>
														</TableCell>
													);
												case "price":
													if (!profile) {
														return (
															<TableCell
																key="price"
																className={`hidden py-2 md:table-cell ${compact ? "min-w-[90px] px-2" : "min-w-[100px] px-4"}`}>
																<span className="text-sm text-gray-500">
																	<button
																		type="button"
																		className="text-[#009640] underline hover:text-[#005522]"
																		onClick={(e) => {
																			e.stopPropagation();
																			setIsAuthOpen(true);
																		}}>
																		Logg inn
																	</button>{" "}
																	for pris
																</span>
															</TableCell>
														);
													}
													return (
														<TableCell
															key="price"
															className={`hidden py-2 md:table-cell ${compact ? "min-w-[90px] px-2" : "min-w-[100px] px-4"}`}>
															{loading[variant.itemNumber] ? (
																<div className="flex items-center gap-2">
																	<Loader2 className="h-4 w-4 animate-spin" />
																	<span className="text-muted-foreground text-sm">
																		{t("Product.loadingPrice")}
																	</span>
																</div>
															) : (
																formatNorwegianCurrency(
																	prices[variant.itemNumber] ?? 0,
																)
															)}
														</TableCell>
													);
												case "warehouse":
													const warehouseOptions =
														getWarehouseOptions[variant.itemNumber] || [];
													const hasManyOptions = warehouseOptions.length > 20;

													// Get unit (enhet) for this variant
													const getVariantUnit = () => {
														const attrs =
															columnAttributes?.[variant.itemNumber]
																?.attributes || [];

														// Try to find contentUnit from attributes
														const contentUnitAttr = attrs.find(
															(attr: any) => attr.contentUnit,
														);
														if (contentUnitAttr?.contentUnit) {
															return contentUnitAttr.contentUnit;
														}

														// Try to find by attribute identifier or name
														const unitAttr = attrs.find(
															(attr: any) =>
																attr.attributeIdentifier === "contentUnit" ||
																attr.name
																	?.toLowerCase()
																	.includes("contentunit") ||
																attr.name
																	?.toLowerCase()
																	.includes("content unit") ||
																attr.name?.toLowerCase().includes("enhet"),
														);
														if (unitAttr?.valueDef) {
															return unitAttr.valueDef;
														}

														// Fallback to variant.contentUnit or STK
														return variant.contentUnit || "STK";
													};

													const variantUnit = getVariantUnit();

													return (
														<TableCell
															key="warehouse"
															className={`hidden py-2 md:table-cell ${compact ? "min-w-[170px] max-w-[190px] px-2" : "min-w-[200px] px-4"}`}
															onClick={(e) => e.stopPropagation()}>
															<Select
																value={selectedWarehouse || ""}
																onValueChange={async (value) => {
																	setWarehouse((prev) => ({
																		...prev,
																		[variant.itemNumber]: value,
																	}));
																	onWarehouseChange?.(
																		variant.itemNumber.toString(),
																		value,
																	);
																	await calculatePriceForVariant(
																		variant,
																		undefined,
																		value,
																	);
																}}>
																<SelectTrigger
																	className={`overflow-hidden border-0 bg-transparent shadow-none [&>span]:truncate ${compact ? "w-[160px]" : "w-[180px]"}`}>
																	<SelectValue
																		placeholder={
																			warehouseOptions.length === 0
																				? t("Product.noWarehouses")
																				: t("Product.selectWarehouse")
																		}
																	/>
																</SelectTrigger>
																<SelectContent className="max-h-[300px] overflow-y-auto">
																	{warehouseOptions.length === 0 ? (
																		<div className="px-2 py-1 text-sm text-gray-500">
																			{t("Product.noWarehousesAvailable")}
																		</div>
																	) : (
																		<>
																			{hasManyOptions && (
																				<div className="border-b px-2 py-1 text-xs text-gray-500">
																					{t("Product.showingFirst")}{" "}
																					{warehouseOptions.length}{" "}
																					{t("Product.warehouses")}
																				</div>
																			)}
																			{warehouseOptions.map(
																				(w, index: number) => (
																					<SelectItem
																						key={`${variant.itemNumber}-${w.warehouseNumber}-${index}`}
																						value={w.warehouseNumber}>
																						<div className="flex items-center gap-2">
																							<CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
																							<span className="truncate">
																								{w.balance} {variantUnit} på{" "}
																								{w.warehouseName}
																							</span>
																						</div>
																					</SelectItem>
																				),
																			)}
																		</>
																	)}
																</SelectContent>
															</Select>
														</TableCell>
													);
												case "cart":
													return (
														<TableCell
															key="cart"
															className={`hidden py-2 md:table-cell ${compact ? "min-w-[100px] px-2" : "min-w-[120px] px-4"}`}
															onClick={(e) => e.stopPropagation()}>
															{hasAddToCart ? (
																<button
																	type="button"
																	aria-label={t("Product.addToCart")}
																	title={t("Product.addToCart")}
																	className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D3D3D3] bg-white text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-50"
																	disabled={loading[variant.itemNumber]}
																	onClick={async () => {
																		await handleAddToCart(
																			variant,
																			qty,
																			selectedWarehouse,
																		);
																	}}>
																	{loading[variant.itemNumber] ? (
																		<Loader2 className="h-4 w-4 animate-spin" />
																	) : (
																		<ShoppingCart
																			className="h-4 w-4"
																			strokeWidth={1.5}
																		/>
																	)}
																</button>
															) : null}
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
	);
}
