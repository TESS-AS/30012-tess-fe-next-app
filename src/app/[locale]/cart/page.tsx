"use client";

import React, { useEffect } from "react";

import ProductVariantTable from "@/components/checkout/product-variant-table";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAppContext } from "@/lib/appContext";
import {
	archiveCart,
	getCart,
	removeFromCart,
	updateCart,
} from "@/services/carts.service";
import {
	calculateItemPrice,
	getProductPrice,
	getProductVariations,
} from "@/services/product.service";
import { CartLine } from "@/types/carts.types";
import { PriceResponse } from "@/types/search.types";
import { Loader2, Minus, Plus, Trash } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

import CartSkeleton from "./loading";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const AnimatedTableRow = ({
	isOpen,
	children,
}: {
	isOpen: boolean;
	children: React.ReactNode;
}) => {
	return (
		<TableRow className={isOpen ? "border-b" : "border-none"}>
			<TableCell
				colSpan={5}
				className="p-0">
				<div className="grid">
					<div
						className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out ${isOpen && "grid-rows-[1fr]"} `}>
						<div className="overflow-hidden">
							<div
								className={`bg-muted/50 text-muted-foreground min-h-0 transform-gpu px-6 py-4 text-sm ${
									isOpen ? "scale-y-100 opacity-100" : "scale-y-95 opacity-0"
								} transition-all duration-300 ease-out`}>
								{children}
							</div>
						</div>
					</div>
				</div>
			</TableCell>
		</TableRow>
	);
};

const CartPage = () => {
	const router = useRouter();
	const { isCartChanging, setIsCartChanging } = useAppContext();
	const {t} = useTranslation('common');

	const [isLoading, setIsLoading] = React.useState(true);
	const [cartItems, setCartItems] = React.useState<CartLine[]>([]);
	const [openItems, setOpenItems] = React.useState<boolean[]>([]);
	const [variations, setVariations] = React.useState<Record<string, any>>({});
	const [loadingItems, setLoadingItems] = React.useState<
		Record<string, boolean>
	>({});
	const [removingItems, setRemovingItems] = React.useState<
		Record<number, boolean>
	>({});
	const [prices, setPrices] = React.useState<Record<string, number>>({});
	const [calculatedPrices, setCalculatedPrices] = React.useState<
		Record<string, number>
	>({}); // Store calculated prices

	useEffect(() => {
		const loadCartData = async () => {
			try {
				const cart = await getCart();
				if (!cart) {
					return;
				}
				setIsLoading(true);
				setCartItems(cart);

				// Get base prices
				for (const item of cart) {
					const priceData = await getProductPrice(
						"169999",
						"01",
						item.productNumber,
					);
					setPrices((prev) => ({
						...prev,
						[item.itemNumber]:
							priceData?.find(
								(p: PriceResponse) => p.itemNumber === String(item.itemNumber),
							)?.basePrice || 0,
					}));
				}

				// Calculate initial prices for all items
				const priceRequests = cart?.map((item) => ({
					itemNumber: item.itemNumber,
					quantity: item.quantity,
					warehouseNumber: "L01",
				}));

				if (priceRequests.length > 0) {
					const priceResults = await calculateItemPrice(
						priceRequests,
						"169999",
						"01",
					);
					const newPrices = priceResults.reduce(
						(acc: Record<string, number>, item: PriceResponse) => ({
							...acc,
							[item.itemNumber]: item.basePriceTotal || 0,
						}),
						{} as Record<string, number>,
					);
					setCalculatedPrices(newPrices);
				}
			} catch (error) {
				console.error("Error fetching cart:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadCartData();
	}, []);

	const subtotal = cartItems?.reduce(
		(acc, item) =>
			acc + (calculatedPrices[item.itemNumber] || prices[item.itemNumber] || 0),
		0,
	);

	const handleCheckout = () => {
		router.push("/checkout");
	};

	const handleArchiveCart = async () => {
		try {
			setIsLoading(true);
			await archiveCart();
			await getCart();
			setCartItems([]);
			setIsCartChanging(!isCartChanging);
			toast(t("Cart.archived"), {
				type: "success",
			});
		} catch (error) {
			console.error("Error archiving cart:", error);
			toast(t("Cart.errorArchiving"), {
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return <CartSkeleton />;
	}

	return (
		<main className="container min-h-screen py-10">
			<div className="grid grid-cols-1 gap-10 md:grid-cols-3">
				{/* Cart Items */}
				<div className="space-y-6 md:col-span-2">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-semibold">
							Your Cart ({cartItems?.length})
						</h1>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								onClick={() => handleArchiveCart()}
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
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Product</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Total</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{!isLoading &&
								cartItems?.map((item, idx) => {
									return (
										<React.Fragment key={idx}>
											<TableRow
												onClick={async () => {
													const willOpen = !openItems[idx];
													setOpenItems((prev) => {
														const newState = [...prev];
														newState[idx] = willOpen;
														return newState;
													});

													if (willOpen && !variations[item.productNumber]) {
														try {
															const productVariations =
																await getProductVariations(
																	item.productNumber,
																	"L01",
																	"01",
																);
															setVariations((prev) => ({
																...prev,
																[item.productNumber]: productVariations,
															}));
														} catch (error) {
															console.error(
																"Error fetching variations:",
																error,
															);
														}
													}
												}}
												className="hover:bg-muted/50 cursor-pointer transition-colors">
												<TableCell>
													<div className="flex items-center gap-4">
														<div className="bg-muted relative h-16 w-16 rounded">
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
															<span className="font-medium">
																{item.productNumber}
															</span>
															<span className="text-muted-foreground text-xs">
																{item.itemNumber}
															</span>
														</div>
													</div>
												</TableCell>
												<TableCell className="text-muted-foreground">
													<div className="flex flex-col">
														<span>
															Unit: {prices[item.itemNumber]?.toFixed(2)},- kr
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Button
															size="icon"
															variant="outline"
															disabled={loadingItems[item.itemNumber]}
															onClick={async (e) => {
																e.stopPropagation();
																setLoadingItems((prev) => ({
																	...prev,
																	[item.itemNumber]: true,
																}));
																try {
																	const newQuantity = item.quantity - 1;
																	await updateCart(item.cartLine ?? 0, {
																		itemNumber: item.itemNumber,
																		quantity: newQuantity,
																	});
																	// Calculate new price
																	const priceResult = await calculateItemPrice(
																		[
																			{
																				itemNumber: item.itemNumber,
																				quantity: newQuantity,
																				warehouseNumber: "L01",
																			},
																		],
																		"169999",
																		"01",
																	);
																	setCalculatedPrices((prev) => ({
																		...prev,
																		[item.itemNumber]:
																			priceResult.find(
																				(item: PriceResponse) =>
																					item.itemNumber ===
																					String(item.itemNumber),
																			)?.basePriceTotal || 0,
																	}));
																	await getCart();
																} finally {
																	setLoadingItems((prev) => ({
																		...prev,
																		[item.itemNumber]: false,
																	}));
																}
															}}>
															{loadingItems[item.itemNumber] ? (
																<div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
															) : (
																<Minus className="h-4 w-4" />
															)}
														</Button>
														<span className="w-6 text-center">
															{item.quantity}
														</span>
														<Button
															size="icon"
															variant="outline"
															disabled={loadingItems[item.itemNumber]}
															onClick={async (e) => {
																e.stopPropagation();
																setLoadingItems((prev) => ({
																	...prev,
																	[item.itemNumber]: true,
																}));
																try {
																	const newQuantity = item.quantity + 1;
																	await updateCart(item.cartLine ?? 0, {
																		itemNumber: item.itemNumber,
																		quantity: newQuantity,
																	});
																	// Calculate new price
																	const priceResult = await calculateItemPrice(
																		[
																			{
																				itemNumber: item.itemNumber,
																				quantity: newQuantity,
																				warehouseNumber: "L01",
																			},
																		],
																		"169999",
																		"01",
																	);
																	setCalculatedPrices((prev) => ({
																		...prev,
																		[item.itemNumber]:
																			priceResult.find(
																				(item: PriceResponse) =>
																					item.itemNumber ===
																					String(item.itemNumber),
																			)?.basePriceTotal || 0,
																	}));
																	await getCart();
																} finally {
																	setLoadingItems((prev) => ({
																		...prev,
																		[item.itemNumber]: false,
																	}));
																}
															}}>
															{loadingItems[item.itemNumber] ? (
																<div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
															) : (
																<Plus className="h-4 w-4" />
															)}
														</Button>
													</div>
												</TableCell>
												<TableCell>
													{calculatedPrices[item.itemNumber]?.toFixed(2)},- kr
												</TableCell>
												<TableCell className="text-right">
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
																await removeFromCart(Number(item.cartLine));
																await getCart();
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
															<Trash className="text-muted-foreground h-4 w-4" />
														)}
													</Button>
												</TableCell>
											</TableRow>
											<AnimatedTableRow isOpen={openItems[idx] || false}>
												<ProductVariantTable
													variants={variations[item.productNumber] || []}
													productNumber={item.productNumber}
												/>
											</AnimatedTableRow>
										</React.Fragment>
									);
								})}
						</TableBody>
					</Table>
				</div>

				{/* Order Summary */}
				<div className="space-y-6">
					<div className="bg-card rounded-xl border p-6 shadow">
						<h2 className="text-xl font-semibold">Order Summary</h2>
						<div className="mt-4 space-y-4 text-sm">
							<div className="flex justify-between">
								<span>Subtotal</span>
								<span>{subtotal.toFixed(2)},- kr</span>
							</div>
							<div className="flex justify-between">
								<span>Shipping</span>
								<span>Calculated at checkout</span>
							</div>
						</div>
						<Button
							className="mt-6 w-full"
							disabled={cartItems?.length === 0 || isLoading}
							onClick={handleCheckout}>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Continue to Checkout"
							)}
						</Button>
					</div>

					{/* Related Products */}
					<div className="bg-card rounded-xl border p-6 shadow">
						<h2 className="mb-4 text-lg font-semibold">Related Products</h2>
						<div className="grid grid-cols-3 gap-4">
							{[
								{ src: "/images/helmet.jpg", name: "Helmet", price: "$12.00" },
								{ src: "/images/gloves.jpg", name: "Gloves", price: "$24.50" },
								{
									src: "/images/welding.jpg",
									name: "Welding Mask",
									price: "$18.00",
								},
							].map((product, index) => (
								<div
									key={index}
									className="text-center">
									<div className="bg-muted relative h-24 w-full rounded">
										<Image
											src={product.src}
											alt={product.name}
											fill
											className="object-contain"
										/>
									</div>
									<p className="mt-2 text-sm">{product.name}</p>
									<p className="text-muted-foreground text-sm">
										{product.price}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default CartPage;
