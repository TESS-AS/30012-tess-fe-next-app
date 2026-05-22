"use client";

import React, { useEffect, useState } from "react";

import OrderSummary from "@/components/checkout/order-summary";
import ProductVariantTable from "@/components/checkout/product-variant-table";
import { VariantModalHeader } from "@/components/checkout/variant-modal-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { FeedbackSideTab } from "@/components/ui/feedback-side-tab";
import {
	Modal,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal";
import { NotificationCard } from "@/components/ui/notification-card";
import QuantityButtons from "@/components/ui/quantity-buttons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { WarehouseCombobox } from "@/components/warehouse-combobox";
import { SHOW_EXCEL_EXPORT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { useCheckoutOrderData } from "@/hooks/useCheckoutOrderData";
import { useGetWarehouses } from "@/hooks/useGetWarehouse";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useSubmitOrder } from "@/hooks/useSubmitOrder";
import { Link } from "@/i18n/navigation";
import { useAppContext } from "@/lib/appContext";
import { getItemBalanceArray, postCartKit } from "@/services/carts.service";
import { loadCategoryTree } from "@/services/categories.service";
import {
	getProductVariations,
	loadItemBalanceBatch,
	WarehouseBatch as ProductWarehouseBatch,
} from "@/services/product.service";
import {
	CartLine,
	WarehouseBatch as CartWarehouseBatch,
} from "@/types/carts.types";
import { RawCategory } from "@/types/categories.types";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import {
	ChevronDown,
	ChevronRight,
	ChevronUp,
	CircleAlert,
	CircleCheck,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";

import CartSkeleton from "./loading";

type RegularCartItem = NonNullable<
	ReturnType<typeof useAppContext>["cartItems"]
>["cart"][number];
type CartKitItem = NonNullable<
	ReturnType<typeof useAppContext>["cartItems"]
>["cartKit"][number];

const CartPage = () => {
	const t = useTranslations();
	const currentLocale = useLocale();
	const router = useRouter();

	const { data: profile, isLoading: isLoadingProfile } = usePunchoutProfile();

	const {
		cartItems,
		isLoading,
		calculatedPrices,
		unitPrices,
		prices,
		setIsCartChanging,
		updateQuantity,
		updateWarehouse,
		updateWarehouseForAllItems,
		removeItemOptimistic,
		handleArchiveCart,
		setIsAuthOpen,
		setShowFeedbackModal,
		setSubmittedOrder,
		setShowOrderConfirmation,
		handleClearCart,
		cartKitTotals,
	} = useAppContext();

	const [orderData] = useCheckoutOrderData(
		{
			cart: cartItems?.cart as CartLine[],
			cartKit: cartItems?.cartKit as CartKitItem[],
		},
		profile,
		calculatedPrices,
	);

	const submitOrder = useSubmitOrder(
		profile?.punchout || false,
		profile,
		{
			name: "999",
			addressLine1: "",
			addressLine2: "",
			addressLine3: "",
			addressLine4: "",
			postalCode: "",
			partyQualifier: "DP",
			country: "NO",
		},
		handleArchiveCart,
	);

	const { warehouses } = useGetWarehouses(true);

	const [warehouseBalancePerItem, setWarehouseBalancePerItem] = useState<
		ProductWarehouseBatch[]
	>([]);
	const [warehouseBalance, setWarehouseBalance] = useState<
		CartWarehouseBatch[]
	>([]);
	const [openModalId, setOpenModalId] = useState<string | null>(null);
	const [outOfStock, setOutOfStock] = useState<boolean>(false);

	const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});
	const [variations, setVariations] = React.useState<Record<string, any>>({});
	const [loadingItems, setLoadingItems] = React.useState<
		Record<string, boolean>
	>({});
	const [removingItems, setRemovingItems] = React.useState<
		Record<string, boolean>
	>({});
	const [itemsToRemove, setItemsToRemove] = React.useState<Set<string>>(
		new Set(),
	);
	const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
		null,
	);
	const [expandedItems, setExpandedItems] = useState<{
		[key: string]: boolean;
	}>({});

	const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
	const [excelArchiveModalOpen, setExcelArchiveModalOpen] = useState(false);
	const [categoryPaths, setCategoryPaths] = useState<{
		[key: string]: string[];
	}>({});

	useEffect(() => {
		const loadPaths = async () => {
			if (!cartItems?.cart) return;
			const newPaths: { [key: string]: string[] } = {};
			for (const item of cartItems.cart) {
				try {
					const categoryTree = await loadCategoryTree(item.productNumber);
					const path = categoryTree
						.slice(0, 3)
						.map((category: RawCategory) =>
							currentLocale === "en" ? category.nameEn : category.nameNo,
						);
					newPaths[item.productNumber] = path;
				} catch (error) {
					console.error("Error loading category path:", error);
				}
			}
			setCategoryPaths(newPaths);
		};
		loadPaths();
	}, [cartItems, currentLocale]);

	useEffect(() => {
		async function loadWarehousesBalanceItemData() {
			if (cartItems?.cart && cartItems.cart.length > 0) {
				const itemNumbers = cartItems.cart.map((item) =>
					item.itemNumber.toString(),
				);
				const warehousesData = await loadItemBalanceBatch(itemNumbers);
				setWarehouseBalancePerItem(
					Array.isArray(warehousesData) ? warehousesData : [],
				);
			} else {
				setWarehouseBalancePerItem([]);
			}
		}
		if (!isLoading) loadWarehousesBalanceItemData();
	}, [cartItems, isLoading]);

	useEffect(() => {
		async function loadWarehousesData() {
			if (cartItems?.cart && cartItems.cart.length > 0) {
				const itemNumbers = cartItems.cart.map((item) =>
					item.itemNumber.toString(),
				);
				const warehousesData = await getItemBalanceArray(itemNumbers);
				setWarehouseBalance(
					Array.isArray(warehousesData) ? warehousesData : [],
				);
			} else {
				setWarehouseBalance([]);
			}
		}
		if (!isLoading) loadWarehousesData();
	}, [cartItems, isLoading]);

	const handleCheckout = async () => {
		const isExcelCustomer =
		 SHOW_EXCEL_EXPORT_CUSTOMER_NUMBER.includes(profile?.defaultCustomerNumber || "");

		if (isExcelCustomer) {
			setExcelArchiveModalOpen(true);
			return;
		}

		setIsCheckoutLoading(true);
		try {
			if (profile?.punchout) {
				const result = await submitOrder(orderData);
				handleArchiveCart();
				if (result) {
					setSubmittedOrder(result);
					setShowOrderConfirmation(true);
					setTimeout(() => setShowFeedbackModal(true), 2000);
				}
			} else {
				router.push("/checkout");
			}
		} catch (error) {
			console.error("Checkout failed:", error);
			toast.error(
				t("Checkout.errors.orderSubmissionFailed") || "Failed to process order",
			);
		} finally {
			setIsCheckoutLoading(false);
		}
	};

	const confirmExcelCheckout = async (archiveCartAfterExcelExport: boolean) => {
		setExcelArchiveModalOpen(false);
		setIsCheckoutLoading(true);
		try {
			await submitOrder(orderData, { archiveCartAfterExcelExport });
			toast.success(
				t("Checkout.excelExportSuccess") || "Excel file exported successfully",
			);
		} catch (error) {
			console.error("Checkout failed:", error);
			toast.error(
				t("Checkout.errors.orderSubmissionFailed") || "Failed to process order",
			);
		} finally {
			setIsCheckoutLoading(false);
		}
	};

	if (isLoadingProfile) return <CartSkeleton />;

	if (!profile) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12">
				<h1 className="text-2xl font-semibold">{t("Login.title")}</h1>
				<Button onClick={() => setIsAuthOpen(true)}>
					{t("Login.loginToViewCart")}
				</Button>
			</div>
		);
	}

	const handleWarehouseChange = async (warehouseNumber: string) => {
		try {
			const anyOutOfStock = (warehouseBalancePerItem ?? []).some((batch) => {
				const wh = batch.warehouses?.find(
					(w) => w.warehouseNumber === warehouseNumber,
				);
				return !wh || (wh.balance ?? 0) <= 0;
			});

			setOutOfStock(anyOutOfStock);
			await updateWarehouseForAllItems(warehouseNumber);
		} catch {
			toast.error(t("Cart.warehouseUpdateError"));
		}
	};

	const renderRegularCartRow = (item: RegularCartItem) => {
		const id = String(item.cartLine ?? item.itemNumber);

		return (
			<React.Fragment key={id}>
				<div
					onClick={async () => {
						const willOpen = !openItems[id];
						setOpenItems((prev) => ({ ...prev, [id]: willOpen }));
						try {
							const productVariations = await getProductVariations(
								item.productNumber,
							);
							setVariations((prev) => ({
								...prev,
								[item.productNumber]: productVariations,
							}));
						} catch (error) {
							console.error("Error fetching variations:", error);
						}
					}}
					className={`border-lightGray mb-4 flex transform flex-col gap-3 rounded-md border border-b border-gray-200 p-4 transition-all duration-300 ease-in-out md:flex-row md:items-center md:justify-between md:gap-4 ${
						itemsToRemove.has(id)
							? "pointer-events-none -translate-y-4 scale-95 opacity-0"
							: "translate-y-0 scale-100 opacity-100"
					}`}>
					<div className="flex items-center gap-4">
						<div className="bg-muted relative h-17 w-17 shrink-0 rounded">
							{item.mediaId?.[0]?.url ? (
								<Image
									src={item.mediaId[0].url}
									alt={item.mediaId[0].filename || ""}
									fill
									sizes="80px"
									className="object-contain"
									loading="eager"
								/>
							) : (
								<div className="h-full w-full bg-gray-200" />
							)}
						</div>

						<div className="flex flex-col">
							<span className="mb-2 block max-w-[170px] truncate font-medium text-[#0F1912] hover:underline md:max-w-[170px]">
								<Link
									className="block truncate"
									href={`/${
										categoryPaths[item.productNumber]?.join("/") || ""
									}/${item.productNumber}`}>
									{item.itemName}
								</Link>
							</span>
							<p
								onClick={() => setOpenModalId(item.productNumber)}
								className="flex cursor-pointer items-center text-xs text-[#5A615D] hover:text-[#009640] hover:underline">
								{item.itemNumber}
								<ChevronRight className="h-4 w-4" />
							</p>
						</div>

						<p className="ml-auto font-bold md:hidden">
							{formatNorwegianCurrency(calculatedPrices[item.itemNumber] ?? 0)}
						</p>
					</div>

					<Select
						onValueChange={async (warehouseNumber: string) => {
							setLoadingItems((prev) => ({
								...prev,
								[item.itemNumber]: true,
							}));
							try {
								await updateWarehouse(
									item.cartLine ?? 0,
									item.itemNumber,
									warehouseNumber,
								);
							} finally {
								setLoadingItems((prev) => ({
									...prev,
									[item.itemNumber]: false,
								}));
							}
						}}
						value={item.warehouseNumber || ""}>
						<SelectTrigger className="flex h-[30px] w-full cursor-pointer justify-center p-1.5 md:w-[260px]">
							<SelectValue
								className="text-[#009640]"
								placeholder="Select Warehouse"
							/>
						</SelectTrigger>
						<SelectContent>
							{(() => {
								const batch = warehouseBalancePerItem.find(
									(w) => w.itemNumber === item.itemNumber,
								);
								const warehouses = batch?.warehouses ?? [];

								if (!warehouses.length) {
									return (
										<SelectItem
											disabled
											value={item.warehouseNumber || ""}>
											<div className="flex items-center justify-center p-0 text-xs text-[#0F1912]">
												Ikke på lager
											</div>
										</SelectItem>
									);
								}

								return warehouses.map((warehouse) => (
									<SelectItem
										key={`${warehouse.companyNumber}-${warehouse.warehouseNumber}`}
										value={warehouse.warehouseNumber}>
										<div
											className={`flex items-center justify-center p-0 text-xs ${
												warehouse.balance > 0
													? "text-[#009640]"
													: "text-[#0F1912]"
											}`}>
											{warehouse.balance > 0 ? (
												<CircleCheck className="mr-1 h-4 w-4" />
											) : (
												<CircleAlert className="mr-1 h-4 w-4 text-[#E3A008]" />
											)}
											{warehouse.balance} tilgjengelig (
											{warehouse.warehouseName})
										</div>
									</SelectItem>
								));
							})()}
						</SelectContent>
					</Select>

					<div className="flex items-center justify-between gap-4 md:gap-6">
						<QuantityButtons
							isLoading={!!loadingItems[item.itemNumber]}
							quantity={item.quantity}
							onIncrease={async (e) => {
								e.stopPropagation();
								setLoadingItems((prev) => ({
									...prev,
									[item.itemNumber]: true,
								}));
								try {
									await updateQuantity(
										item.cartLine ?? 0,
										item.itemNumber,
										item.quantity + 1,
									);
								} finally {
									setLoadingItems((prev) => ({
										...prev,
										[item.itemNumber]: false,
									}));
								}
							}}
							onDecrease={async (e) => {
								e.stopPropagation();
								setLoadingItems((prev) => ({
									...prev,
									[item.itemNumber]: true,
								}));
								try {
									await updateQuantity(
										item.cartLine ?? 0,
										item.itemNumber,
										item.quantity - 1,
									);
								} finally {
									setLoadingItems((prev) => ({
										...prev,
										[item.itemNumber]: false,
									}));
								}
							}}
						/>

						<p className="hidden font-bold md:block">
							{formatNorwegianCurrency(calculatedPrices[item.itemNumber] ?? 0)}
						</p>

						<Button
							className="w-4 p-0"
							size="icon"
							variant="ghost"
							disabled={!!removingItems[id]}
							onClick={async (e) => {
								e.stopPropagation();
								try {
									setItemsToRemove((prev) => {
										const next = new Set(prev);
										next.add(id);
										return next;
									});
									setRemovingItems((prev) => ({ ...prev, [id]: true }));

									await new Promise((r) => setTimeout(r, 300));

									await removeItemOptimistic(Number(item.cartLine));

									setRemovingItems((prev) => ({
										...prev,
										[id]: false,
									}));
									setItemsToRemove((prev) => {
										const next = new Set(prev);
										next.delete(id);
										return next;
									});
								} catch {
									setRemovingItems((prev) => ({
										...prev,
										[id]: false,
									}));
									setItemsToRemove((prev) => {
										const next = new Set(prev);
										next.delete(id);
										return next;
									});
									toast.error(t("Cart.errors.removeItem"));
								}
							}}>
							{removingItems[id] ? (
								<div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
							) : (
								<Trash2 className="h-4 w-4 text-[#C81E1E]" />
							)}
						</Button>
					</div>
				</div>

				<Modal
					open={openModalId === item.productNumber}
					onOpenChange={(open) =>
						setOpenModalId(open ? item.productNumber : null)
					}
					className="min-w-[95%] md:min-w-[75%]">
					<ModalHeader>
						<ModalTitle>
							Velg produktvariant
							{item.productName ? `: ${item.productName}` : ""}
						</ModalTitle>
					</ModalHeader>
					<VariantModalHeader
						productName={item.productName ?? item.productNumber}
						itemNumber={item.itemNumber}
						imageUrl={item.mediaId?.[0]?.url}
						detailsHref={`/produkt/${encodeURIComponent(item.productNumber)}`}
					/>
					<div className="space-y-4 p-4">
						<div className="space-y-2">
							<ProductVariantTable
								hasSearch
								variants={variations[item.productNumber] || []}
								productNumber={item.productNumber}
							/>
						</div>
					</div>
				</Modal>
			</React.Fragment>
		);
	};

	return (
		<main className="container min-h-screen px-4 py-6 md:px-0 md:py-10">
			<FeedbackSideTab />
			<div className="grid grid-cols-1 gap-6 md:gap-10 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<Breadcrumb
						items={[
							{ href: "/", label: t("BreadCrumbs.home") },
							{ href: "/cart", label: t("BreadCrumbs.cart") },
						]}
					/>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-1 items-center gap-2">
							<p className="shrink-0 text-sm font-normal sm:text-base">
								{t("Cart.showStockStatus")}
							</p>
							<WarehouseCombobox
								warehouseBalance={warehouseBalance}
								value={selectedWarehouse}
								onChange={handleWarehouseChange}
							/>
						</div>
						<Button
							onClick={handleClearCart}
							variant="outline"
							className="self-end border-[#C81E1E] text-[#C81E1E] sm:self-auto">
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>

					{outOfStock && (
						<NotificationCard
							className="bg-[#FDFDEA]"
							icon={<CircleAlert className="h-4 w-4" />}
							title={t("Cart.outOfStock")}
							message={t("Cart.outOfStockMessage")}
							onClose={() => setOutOfStock(false)}
						/>
					)}

					{cartItems?.cart && cartItems.cart.length > 0 && (
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<h1 className="text-xl font-semibold sm:text-2xl">
								{t("Cart.yourCart")} (
								{(cartItems?.cart?.length || 0) +
									(cartItems?.cartKit?.length || 0)}
								)
							</h1>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									onClick={() => handleArchiveCart()}
									className="mr-2 text-sm">
									{t("Cart.archiveCart")}
								</Button>
								<Button
									variant="outline"
									onClick={() => router.push("/cart/history")}
									className="text-sm">
									{t("Cart.viewCartHistory")}
								</Button>
							</div>
						</div>
					)}

					{!isLoading && (
						<>
							{cartItems?.cartKit && cartItems.cartKit.length > 0 && (
								<div className="space-y-4">
									{cartItems.cartKit.map((item, idx) => {
										return (
											<div
												key={idx}
												className="border-lightGray rounded-md border py-6">
												<div
													role="button"
													tabIndex={0}
													aria-expanded={!!expandedItems[item.hexagonId]}
													onClick={() =>
														setExpandedItems((prev) => ({
															...prev,
															[item.hexagonId]: !prev[item.hexagonId],
														}))
													}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															setExpandedItems((prev) => ({
																...prev,
																[item.hexagonId]: !prev[item.hexagonId],
															}));
														}
													}}
													className="flex w-full cursor-pointer flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
													<div className="flex items-center gap-3">
														{expandedItems[item.hexagonId] ? (
															<ChevronUp className="h-4 w-4 shrink-0 text-[#5A615D]" />
														) : (
															<ChevronDown className="h-4 w-4 shrink-0 text-[#5A615D]" />
														)}
														<span className="text-sm text-[#5A615D]">
															ID: {item.hexagonId}
														</span>
														<span className="truncate font-medium text-[#0F1912]">
															{item.hose.itemDescription}
														</span>
													</div>
													<div className="flex items-center justify-between gap-4 pl-7 md:gap-6 md:pl-0">
														<QuantityButtons
															isLoading={!!loadingItems[item.hexagonId]}
															quantity={item.ferrule1.quantity}
															onIncrease={async (e) => {
																e.stopPropagation();
																setLoadingItems((prev) => ({
																	...prev,
																	[item.hexagonId]: true,
																}));
																try {
																	await postCartKit([
																		{
																			hexagonId: Number(item.hexagonId),
																			quantity: 1,
																			warehouseNumber:
																				profile?.defaultWarehouseNumber,
																			companyNumber:
																				profile?.defaultCompanyNumber,
																		},
																	]);
																	setIsCartChanging((v) => !v);
																} finally {
																	setLoadingItems((prev) => ({
																		...prev,
																		[item.hexagonId]: false,
																	}));
																}
															}}
															onDecrease={async (e) => {
																e.stopPropagation();
																setLoadingItems((prev) => ({
																	...prev,
																	[item.hexagonId]: true,
																}));
																try {
																	await postCartKit([
																		{
																			hexagonId: Number(item.hexagonId),
																			quantity: -1,
																			warehouseNumber:
																				profile?.defaultWarehouseNumber,
																			companyNumber:
																				profile?.defaultCompanyNumber,
																		},
																	]);
																	setIsCartChanging((v) => !v);
																} finally {
																	setLoadingItems((prev) => ({
																		...prev,
																		[item.hexagonId]: false,
																	}));
																}
															}}
														/>
														<div className="flex items-center gap-6">
															<span className="font-semibold">
																{formatNorwegianCurrency(
																	cartKitTotals[item.hexagonId],
																)}
															</span>

															<Button
																className="w-4 p-0"
																size="icon"
																variant="ghost"
																onClick={async (e) => {
																	e.stopPropagation();
																	try {
																		await removeItemOptimistic(item.cartLine);
																		toast.success(t("Cart.itemRemoved"));
																	} catch {
																		toast.error(t("Cart.itemRemoveError"));
																	}
																}}>
																{removingItems[item.hexagonId] ? (
																	<div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
																) : (
																	<Trash2 className="h-4 w-4 text-[#C81E1E]" />
																)}
															</Button>
														</div>
													</div>
												</div>

												{expandedItems[item.hexagonId] && (
													<div className="border-t p-4">
														<div className="space-y-3">
															<div className="space-y-4 pl-8">
																<div className="flex items-start justify-between gap-2">
																	<div className="flex flex-col">
																		<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																			{item.hose.itemName}
																		</p>
																		<p className="text-xs text-[#5A615D]">
																			{item.hose.itemNumber}
																		</p>
																	</div>
																	<p className="font-bold">
																		{formatNorwegianCurrency(
																			calculatedPrices[item.hose.itemNumber] ??
																				0,
																		)}
																	</p>
																</div>
																<div className="flex items-start justify-between gap-2">
																	<div className="flex flex-col">
																		<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																			{item.ferrule1.name}
																		</p>
																		<p className="text-xs text-[#5A615D]">
																			{item.ferrule1.itemNumber}
																		</p>
																	</div>

																	<p className="font-bold">
																		{formatNorwegianCurrency(
																			calculatedPrices[
																				item.ferrule1.itemNumber
																			] ?? 0,
																		)}
																	</p>
																</div>
																<div className="flex items-start justify-between gap-2">
																	<div className="flex flex-col">
																		<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																			{item.ferrule2.name}
																		</p>
																		<p className="text-xs text-[#5A615D]">
																			{item.ferrule2.itemNumber}
																		</p>
																	</div>
																	<p className="font-bold">
																		{formatNorwegianCurrency(
																			calculatedPrices[
																				item.ferrule2.itemNumber
																			] ?? 0,
																		)}
																	</p>
																</div>
																<div className="flex items-start justify-between gap-2">
																	<div className="flex flex-col">
																		<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																			{item.insert1.name}
																		</p>
																		<p className="text-xs text-[#5A615D]">
																			{item.insert1.itemNumber}
																		</p>
																	</div>
																	<p className="font-bold">
																		{formatNorwegianCurrency(
																			calculatedPrices[
																				item.insert1.itemNumber
																			] ?? 0,
																		)}
																	</p>
																</div>
																<div className="flex items-start justify-between gap-2">
																	<div className="flex flex-col">
																		<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																			{item.insert2.name}
																		</p>
																		<p className="text-xs text-[#5A615D]">
																			{item.insert2.itemNumber}
																		</p>
																	</div>
																	<p className="font-bold">
																		{formatNorwegianCurrency(
																			calculatedPrices[
																				item.insert2.itemNumber
																			] ?? 0,
																		)}
																	</p>
																</div>
																{Object.values(item.services ?? {}).some(
																	(v) => {
																		if (v == null || typeof v !== "object")
																			return false;
																		const maybeItemNumber = (
																			v as { itemNumber?: unknown }
																		).itemNumber;
																		return (
																			typeof maybeItemNumber === "string" &&
																			maybeItemNumber.trim().length > 0
																		);
																	},
																) && (
																	<div className="space-y-4">
																		{Object.entries(item.services ?? {})
																			.filter(([, v]) => {
																				if (v == null || typeof v !== "object")
																					return false;
																				const maybeItemNumber = (
																					v as { itemNumber?: unknown }
																				).itemNumber;
																				return (
																					typeof maybeItemNumber === "string" &&
																					maybeItemNumber.trim().length > 0
																				);
																			})
																			.map(([key, service]) => {
																				const typedService = service as {
																					itemNumber?: string;
																					quantity?: number;
																				};
																				const itemNumber =
																					typedService.itemNumber ?? "";
																				return (
																					<div
																						key={`${key}-${itemNumber}`}
																						className="flex items-start justify-between gap-2">
																						<div className="flex flex-col">
																							<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																								{key
																									.replace(
																										/([a-z])([A-Z])/g,
																										"$1 $2",
																									)
																									.replace(/_/g, " ")
																									.replace(/\s+/g, " ")
																									.trim()}
																							</p>
																							<p className="text-xs text-[#5A615D]">
																								{itemNumber}
																							</p>
																						</div>
																						<p className="font-bold">
																							{formatNorwegianCurrency(
																								calculatedPrices[itemNumber] ??
																									0,
																							)}
																						</p>
																					</div>
																				);
																			})}
																	</div>
																)}
															</div>
														</div>
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
							{cartItems?.cart?.map((item: RegularCartItem) =>
								renderRegularCartRow(item),
							)}
						</>
					)}
				</div>

				<OrderSummary
					handleCheckout={handleCheckout}
					isCheckoutLoading={isCheckoutLoading}
					currentStep={null}
				/>
			</div>

			<Modal
				open={excelArchiveModalOpen}
				onOpenChange={setExcelArchiveModalOpen}>
				<ModalHeader>
					<ModalTitle>{t("Checkout.excelArchiveCartTitle")}</ModalTitle>
				</ModalHeader>
				<p className="text-sm text-[#5A615D]">
					{t("Checkout.excelArchiveCartDescription")}
				</p>
				<ModalFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={() => confirmExcelCheckout(false)}>
						{t("Checkout.excelArchiveCartNo")}
					</Button>
					<Button
						type="button"
						variant="greenSolid"
						onClick={() => confirmExcelCheckout(true)}>
						{t("Checkout.excelArchiveCartYes")}
					</Button>
				</ModalFooter>
			</Modal>
		</main>
	);
};

export default CartPage;
