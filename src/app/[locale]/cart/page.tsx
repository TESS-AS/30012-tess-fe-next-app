"use client";

import React, { useEffect, useState } from "react";

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
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { Link } from "@/i18n/navigation";
import { useAppContext } from "@/lib/appContext";
import { loadCategoryTree } from "@/services/categories.service";
import {
	getProductVariations,
	loadItemBalanceBatch,
	WarehouseBatch,
} from "@/services/product.service";
import { RawCategory } from "@/types/categories.types";
import { Separator } from "@radix-ui/react-select";
import {
	ArrowRight,
	ChevronRight,
	CircleAlert,
	CircleCheck,
	Loader2,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";

import CartSkeleton from "./loading";
import OrderSummary from "@/components/checkout/order-summary";

const CartPage = () => {
	const currentLocale = useLocale();
	const router = useRouter();
	const [categoryPaths, setCategoryPaths] = useState<{
		[key: string]: string[];
	}>({});

	const {
		cartItems,
		prices,
		calculatedPrices,
		isLoading,
		updateQuantity,
		updateWarehouse,
		removeItem,
		handleArchiveCart,
	} = useAppContext();

	useEffect(() => {
		const loadPaths = async () => {
			if (!cartItems) return;

			const newPaths: { [key: string]: string[] } = {};
			for (const item of cartItems) {
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

	const t = useTranslations();
	const { status } = useSession();
	const [warehouseBlance, setWarehouseBlance] = useState<WarehouseBatch[]>([]);
	const [openModalId, setOpenModalId] = useState<string | null>(null);

	useEffect(() => {
		async function loadWarehousesData() {
			if (cartItems && cartItems.length > 0) {
				console.log(cartItems, "cartitems");
				const itemNumbers = cartItems.map((item) => item.itemNumber.toString());
				const warehousesData = await loadItemBalanceBatch(itemNumbers);
				const dataArray = Array.isArray(warehousesData) ? warehousesData : [];
				setWarehouseBlance(dataArray);
			} else {
				setWarehouseBlance([]);
			}
		}
		if (!isLoading) {
			loadWarehousesData();
		}
	}, [cartItems, isLoading]);

	const [openItems, setOpenItems] = React.useState<boolean[]>([]);
	const [variations, setVariations] = React.useState<Record<string, any>>({});
	const [loadingItems, setLoadingItems] = React.useState<
		Record<string, boolean>
	>({});
	const [removingItems, setRemovingItems] = React.useState<
		Record<number, boolean>
	>({});

	const subtotal = cartItems?.reduce(
		(acc, item) =>
			acc + (calculatedPrices[item.itemNumber] || prices[item.itemNumber] || 0),
		0,
	);


	const archiveCart = async () => {
		try {
			await handleArchiveCart();
			toast.success(t("Cart archived successfully"));
		} catch (error) {
			console.error("Error archiving cart:", error);
			toast.error(t("Error archiving cart"));
		}
	};

	if (isLoading) {
		return <CartSkeleton />;
	}

	if (status === "unauthenticated") {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12">
				<h1 className="text-2xl font-semibold">{t("Login.title")}</h1>
				<Button onClick={() => router.push("/auth/login")}>
					{t("Login.loginToViewCart")}
				</Button>
			</div>
		);
	}

	return (
		<main className="container min-h-screen py-10">
			<div className="grid grid-cols-1 gap-10 md:grid-cols-3">
				{/* Cart Items */}
				<div className="space-y-6 md:col-span-2">
					<Breadcrumb
						items={[
							{ href: "/", label: "Home" },
							{ href: "/cart", label: "Cart" },
						]}
					/>
					<div className="flex items-center justify-between">
						<div className="flex w-[70%] items-center gap-2">
							<p className="text-base font-normal">Vis lagerstatus for:</p>
							<Select disabled>
								<SelectTrigger className="w-[40%]">
									<SelectValue placeholder="Mitt lager: Kristiansand" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="warehouse1">Warehouse 1</SelectItem>
									<SelectItem value="warehouse2">Warehouse 2</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button
							variant="outline"
							className="border-[#C81E1E] text-[#C81E1E]">
							<Trash2 className="color-[#C81E1E] h-4 w-4" />
						</Button>
					</div>
					<NotificationCard
						className="bg-[#FDFDEA]"
						icon={<CircleAlert className="h-4 w-4" />}
						title="Noen varer er ikke på lager i ditt valgte varehus"
						message="Noen varer er ikke på lager i ditt valgte varehus, og det kan ta opptil 3 dager ekstra å få dem levert. Endre lager per varelinje før du sender ordren dersom du ønsker raskere levering."
						onClose={() => {}}
					/>
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-semibold">
							Your Cart ({cartItems?.length})
						</h1>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								onClick={() => archiveCart()}
								className="mr-2">
								Archive Cart
							</Button>
							<Button
								variant="outline"
								onClick={() => router.push("/cart/history")}>
								View Cart History
							</Button>
						</div>
					</div>
					{!isLoading &&
						cartItems?.map((item, idx) => {
							console.log(item, "item");
							return (
								<React.Fragment key={idx}>
									<div
										onClick={async () => {
											const willOpen = !openItems[idx];
											setOpenItems((prev) => {
												const newState = [...prev];
												newState[idx] = willOpen;
												return newState;
											});
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
										className="border-lightGray grid grid-cols-[70px_2fr_2fr_1fr_1fr_40px] items-center gap-4 rounded-md border p-6 transition-colors">
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
											<span className="color-[#0F1912] mb-2 font-medium hover:underline">
												<Link
													href={`/${categoryPaths[item.productNumber]?.join("/") || ""}/${item.productNumber}`}>
													{item.productNumber}
												</Link>
											</span>
											<p
												onClick={() => setOpenModalId(item.productNumber)}
												className="color-[#5A615D] flex cursor-pointer items-center text-xs hover:text-[#009640] hover:underline">
												{item.itemNumber}, 300mm, 3/8”{" "}
												<ChevronRight className="h-4 w-4" />
											</p>
										</div>
										<Select
											onValueChange={async (e: string) => {
												setLoadingItems((prev) => ({
													...prev,
													[item.itemNumber]: true,
												}));
												try {
													await updateWarehouse(
														item.cartLine ?? 0,
														item.itemNumber,
														String(
															warehouseBlance
																?.find((w) => w.item_number === item.itemNumber)
																?.warehouses?.find(
																	(w) => w.warehouse_name === e,
																)?.warehouse_number,
														),
													);
												} finally {
													setLoadingItems((prev) => ({
														...prev,
														[item.itemNumber]: false,
													}));
												}
											}}
											value={
												warehouseBlance
													.find((w) => w.item_number === item.itemNumber)
													?.warehouses?.find(
														(w) => w.warehouse_number === item.warehouseNumber,
													)?.warehouse_name || ""
											}>
											<SelectTrigger className="flex h-[30px] w-[260px] cursor-pointer justify-center p-1.5">
												<SelectValue
													className="text-[#009640]"
													placeholder="Select Warehouse"
												/>
											</SelectTrigger>
											<SelectContent>
												{warehouseBlance
													.find((w) => w.item_number === item.itemNumber)
													?.warehouses?.map((warehouse) => (
														<SelectItem
															key={warehouse.warehouse_number}
															value={warehouse.warehouse_name}>
															<div
																className={`flex items-center justify-center p-0 text-xs ${warehouse.balance > 0 ? "text-[#009640]" : "text-[#0F1912]"}`}>
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
											{(calculatedPrices[item.itemNumber] ?? 0)?.toFixed(2)}
											,-
										</p>
										<Button
											size="icon"
											variant="ghost"
											disabled={removingItems[item.cartLine ?? 0]}
											onClick={async (e) => {
												e.stopPropagation();
												setRemovingItems((prev) => ({
													...prev,
													[item.cartLine ?? 0]: true,
												}));
												try {
													await removeItem(Number(item.cartLine));
												} finally {
													setRemovingItems((prev) => ({
														...prev,
														[item.cartLine ?? 0]: false,
													}));
												}
											}}>
											{removingItems[item.cartLine ?? 0] ? (
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
											<ModalTitle>Velg produk§tvariant</ModalTitle>
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
						})}
				</div>

				{/* Order Summary */}
				<OrderSummary handleCheckout={() => router.push("/checkout")} />
			</div>
		</main>
	);
};

export default CartPage;
