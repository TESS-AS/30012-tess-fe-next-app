"use client";

import React, { useEffect, useState } from "react";

import OrderSummary from "@/components/checkout/order-summary";
import ProductVariantTable from "@/components/checkout/product-variant-table";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
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
import { useCheckoutOrderData } from "@/hooks/useCheckoutOrderData";
import { useGetWarehouses } from "@/hooks/useGetWarehouse";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useSubmitOrder } from "@/hooks/useSubmitOrder";
import { Link } from "@/i18n/navigation";
import { useAppContext } from "@/lib/appContext";
import { getItemBalanceArray } from "@/services/carts.service";
import { loadCategoryTree } from "@/services/categories.service";
import {
	getProductVariations,
	loadItemBalanceBatch,
	WarehouseBatch as ProductWarehouseBatch,
} from "@/services/product.service";
import { WarehouseBatch as CartWarehouseBatch } from "@/types/carts.types";
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
type CartItem = RegularCartItem | CartKitItem;

const isCartKitItem = (item: CartItem): item is CartKitItem => {
	return (item as CartKitItem)?.hexagonId !== undefined;
};

const CartPage = () => {
	const t = useTranslations();
	const currentLocale = useLocale();
	const router = useRouter();
	const [expandedItems, setExpandedItems] = useState<{
		[key: string]: boolean;
	}>({});

	const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
	const [categoryPaths, setCategoryPaths] = useState<{
		[key: string]: string[];
	}>({});

	const { data: profile, isLoading: isLoadingProfile } = usePunchoutProfile();

	const {
		cartItems,
		isLoading,
		calculatedPrices,
		prices,
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
	} = useAppContext();

	const [orderData] = useCheckoutOrderData(
		cartItems?.cart || [],
		profile,
		calculatedPrices,
	);

	const cartKitOrderData =
		cartItems?.cartKit?.map((kit) => ({
			hexagonId: kit.hexagonId,
			quantity: kit.hose.quantity,
			warehouseNumber: "L01",
			companyNumber: "1",
		})) || [];

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
	const [outOfStock, setOutOfStock] = useState<boolean>(true);

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
				const warehouseNumbers = warehouses.map((item) => item.id);
				const warehousesData = await getItemBalanceArray(
					itemNumbers,
					warehouseNumbers,
					profile?.defaultCompanyNumber || "01",
				);
				setWarehouseBalance(
					Array.isArray(warehousesData) ? warehousesData : [],
				);
			} else {
				setWarehouseBalance([]);
			}
		}
		if (!isLoading) loadWarehousesData();
	}, [cartItems, isLoading, warehouses, profile?.defaultCompanyNumber]);
	console.log(warehouseBalance, "warehouseBalance");

	const handleCheckout = async () => {
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
					className={`border-lightGray mb-4 grid transform grid-cols-[70px_2fr_2fr_1fr_1fr_40px] items-center gap-4 rounded-md border border-b border-gray-200 p-4 p-6 transition-all duration-300 ease-in-out ${
						itemsToRemove.has(id)
							? "pointer-events-none -translate-y-4 scale-95 opacity-0"
							: "translate-y-0 scale-100 opacity-100"
					}`}>
					<div className="bg-muted relative h-17 w-17 rounded">
						{item.mediaId?.[0]?.url ? (
							<Image
								src={item.mediaId[0].url}
								alt={item.mediaId[0].filename || ""}
								fill
								className="object-contain"
							/>
						) : (
							<div className="h-full w-full bg-gray-200" />
						)}
					</div>

					<div className="flex flex-col">
						<span className="mb-2 block max-w-[170px] truncate font-medium text-[#0F1912] hover:underline">
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
							{item.itemNumber}, 300mm, 3/8”{" "}
							<ChevronRight className="h-4 w-4" />
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
						<SelectTrigger className="flex h-[30px] w-[260px] cursor-pointer justify-center p-1.5">
							<SelectValue
								className="text-[#009640]"
								placeholder="Select Warehouse"
							/>
						</SelectTrigger>
						<SelectContent>
							{warehouseBalancePerItem
								.find((w) => w.item_number === item.itemNumber)
								?.warehouses?.map((warehouse) => (
									<SelectItem
										key={warehouse.warehouse_number}
										value={warehouse.warehouse_number}>
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
											{warehouse.warehouse_name})
										</div>
									</SelectItem>
								))}
						</SelectContent>
					</Select>

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

					<p className="font-bold">
						{formatNorwegianCurrency(calculatedPrices[item.itemNumber] ?? 0)}
					</p>

					<Button
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

				<Modal
					open={openModalId === item.productNumber}
					onOpenChange={(open) =>
						setOpenModalId(open ? item.productNumber : null)
					}
					className="min-w-[75%]">
					<ModalHeader>
						<ModalTitle>Velg produktvariant</ModalTitle>
					</ModalHeader>
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
		<main className="container min-h-screen py-10">
			<div className="grid grid-cols-1 gap-10 md:grid-cols-3">
				<div className="space-y-6 md:col-span-2">
					<Breadcrumb
						items={[
							{ href: "/", label: t("BreadCrumbs.home") },
							{ href: "/cart", label: t("BreadCrumbs.cart") },
						]}
					/>

					<div className="flex items-center justify-between">
						<div className="flex w-[70%] items-center gap-2">
							<p className="text-base font-normal">
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
							className="border-[#C81E1E] text-[#C81E1E]">
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
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-semibold">
								{t("Cart.yourCart")} (
								{(cartItems?.cart?.length || 0) +
									(cartItems?.cartKit?.length || 0)}
								)
							</h1>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									onClick={() => handleArchiveCart()}
									className="mr-2">
									{t("Cart.archiveCart")}
								</Button>
								<Button
									variant="outline"
									onClick={() => router.push("/cart/history")}>
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
													className="flex w-full cursor-pointer items-center justify-between px-4 py-3">
													<div className="flex items-center gap-3">
														{expandedItems[item.hexagonId] ? (
															<ChevronUp className="h-4 w-4 text-[#5A615D]" />
														) : (
															<ChevronDown className="h-4 w-4 text-[#5A615D]" />
														)}
														<span className="text-sm text-[#5A615D]">
															ID: {item.hexagonId}
														</span>
														<span className="font-medium text-[#0F1912]">
															{item.hose.itemDescription}
														</span>
													</div>
													<div className="flex items-center gap-6">
														<QuantityButtons
															isLoading={!!loadingItems[item.hose.itemNumber]}
															quantity={item.hose.quantity}
															onIncrease={async (e) => {
																e.stopPropagation();
																setLoadingItems((prev) => ({
																	...prev,
																	[item.hose.itemNumber]: true,
																}));
																try {
																	await updateQuantity(
																		Number(item.hexagonId),
																		item.hose.itemNumber,
																		item.hose.quantity + 1,
																	);
																} finally {
																	setLoadingItems((prev) => ({
																		...prev,
																		[item.hose.itemNumber]: false,
																	}));
																}
															}}
															onDecrease={async (e) => {
																e.stopPropagation();
																setLoadingItems((prev) => ({
																	...prev,
																	[item.hose.itemNumber]: true,
																}));
																try {
																	await updateQuantity(
																		Number(item.hexagonId),
																		item.hose.itemNumber,
																		item.hose.quantity - 1,
																	);
																} finally {
																	setLoadingItems((prev) => ({
																		...prev,
																		[item.hose.itemNumber]: false,
																	}));
																}
															}}
														/>
														<div className="flex items-center gap-6">
															<span className="font-semibold">
																{(() => {
																	const total = [
																		calculatedPrices[item.hose.itemNumber] ?? 0,
																		calculatedPrices[
																			item.ferrule1.itemNumber
																		] ?? 0,
																		calculatedPrices[
																			item.ferrule2.itemNumber
																		] ?? 0,
																		calculatedPrices[item.insert1.itemNumber] ??
																			0,
																		calculatedPrices[item.insert2.itemNumber] ??
																			0,
																	].reduce((sum, price) => sum + price, 0);
																	console.log("Total price:", total);
																	return formatNorwegianCurrency(total);
																})()}
															</span>
															<button
																onClick={async (e) => {
																	e.stopPropagation();
																	try {
																		await removeItemOptimistic(item.hexagonId);
																		toast.success(t("Cart.itemRemoved"));
																	} catch {
																		toast.error(t("Cart.itemRemoveError"));
																	}
																}}
																className="cursor-pointer hover:opacity-80">
																<Trash2 className="h-4 w-4 text-[#C81E1E]" />
															</button>
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
																			(prices[item.hose.itemNumber] ?? 0) *
																				(item.hose.quantity || 1),
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
																			(prices[item.ferrule1.itemNumber] ?? 0) *
																				(item.hose.quantity || 1),
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
																			(prices[item.ferrule2.itemNumber] ?? 0) *
																				(item.hose.quantity || 1),
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
																			(prices[item.insert1.itemNumber] ?? 0) *
																				(item.hose.quantity || 1),
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
																			(prices[item.insert2.itemNumber] ?? 0) *
																				(item.hose.quantity || 1),
																		)}
																	</p>
																</div>
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
		</main>
	);
};

export default CartPage;
