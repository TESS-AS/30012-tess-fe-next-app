"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { getArchiveCart } from "@/services/carts.service";
import { getProductPrice } from "@/services/product.service";
import { ArchiveCartResponse } from "@/types/carts.types";
import { PriceResponse } from "@/types/search.types";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

const CartHistoryPage = () => {
	const t = useTranslations("Cart");
	const params = useParams();
	const { data: profile } = useGetProfileData();
	const locale = params.locale as string;
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [archiveData, setArchiveData] = useState<ArchiveCartResponse>();
	const [expandedRow, setExpandedRow] = useState<number | null>(null);
	const [prices, setPrices] = useState<{ [key: string]: PriceResponse[] }>({});

	const fetchArchiveData = async (page: number) => {
		setIsLoading(true);
		try {
			const data = await getArchiveCart(page);
			setArchiveData(data);

			// Fetch prices for all products
			const pricePromises = data.data.flatMap((item) =>
				item.cart.map(async (cartItem) => {
					try {
						const price = await getProductPrice(
							profile?.defaultCustomerNumber,
							cartItem.companyNumber,
							cartItem.productNumber,
							cartItem.warehouseNumber,
						);
						return { productNumber: cartItem.productNumber, price };
					} catch (error) {
						console.error(
							"Error fetching price for product:",
							cartItem.productNumber,
							error,
						);
						return { productNumber: cartItem.productNumber, price: [] };
					}
				}),
			);

			const priceResults = await Promise.all(pricePromises);
			const priceMap = priceResults.reduce(
				(acc, { productNumber, price }) => {
					acc[productNumber] = price;
					return acc;
				},
				{} as { [key: string]: PriceResponse[] },
			);

			setPrices(priceMap);
		} catch (error) {
			console.error("Error fetching archive data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchArchiveData(currentPage);
	}, [currentPage]);

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
	};

	const renderCartItemCard = (cartItem: ArchiveCartResponse["data"][number]["cart"][number], cardIdx: number) => (
		<div
			key={cardIdx}
			className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-b-0">
			<div className="bg-muted relative h-12 w-12 shrink-0 rounded">
				{cartItem.mediaId?.[0]?.url ? (
					<Image
						src={cartItem.mediaId[0].url}
						alt={cartItem.mediaId[0].filename || ""}
						fill
						sizes="48px"
						className="object-contain"
						loading="eager"
					/>
				) : (
					<div className="h-full w-full bg-gray-200" />
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-sm font-medium">
					{cartItem.productNumber}
				</span>
				<span className="text-xs text-[#5A615D]">
					{cartItem.itemNumber}
				</span>
			</div>
			<div className="shrink-0 text-right">
				<span className="text-sm font-medium">
					{t("quantity")}: {cartItem.quantity}
				</span>
			</div>
		</div>
	);

	return (
		<main className="container min-h-screen px-4 py-6 md:px-0 md:py-10">
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-xl font-semibold sm:text-2xl">{t("cartHistory")}</h1>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<Loader2 className="h-6 w-6 animate-spin" />
				</div>
			) : (
				<>
					{/* Mobile card layout */}
					<div className="flex flex-col gap-4 md:hidden">
						{archiveData?.data.map((item, idx) => {
							const total = item.cart.reduce((acc, cartItem) => {
								const productPrices = prices[cartItem.productNumber] || [];
								const price = productPrices[0]?.bestPrice || 0;
								return acc + price * cartItem.quantity;
							}, 0);

							return (
								<div
									key={idx}
									className={`rounded-md border border-gray-200 p-4 transition-all duration-300 ${expandedRow === idx ? "bg-muted/50" : ""}`}>
									<div className="flex items-center justify-between gap-3">
										<div className="flex min-w-0 flex-1 flex-col">
											<span className="text-sm font-medium">
												{new Date(item.date).toLocaleString(locale, {
													year: "numeric",
													month: "short",
													day: "2-digit",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
											<span className="text-xs text-[#5A615D]">
												{item.cart.length} {t("article")}
											</span>
										</div>
										<span className="shrink-0 font-medium">
											{formatNorwegianCurrency(total)}
										</span>
									</div>
									<div className="mt-3 flex items-center justify-end">
										<Button
											variant={expandedRow === idx ? "secondary" : "outline"}
											size="sm"
											onClick={() =>
												setExpandedRow(expandedRow === idx ? null : idx)
											}>
											{expandedRow === idx ? t("hide") : t("view")}
										</Button>
									</div>
									{expandedRow === idx && (
										<div className="mt-3 border-t pt-3">
											{item.cart.map((cartItem, cardIdx) =>
												renderCartItemCard(cartItem, cardIdx),
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>

					{/* Desktop table layout */}
					<div className="hidden md:block">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[180px]">{t("date")}</TableHead>
									<TableHead className="hidden lg:table-cell">{t("userId")}</TableHead>
									<TableHead className="text-right">{t("article")}</TableHead>
									<TableHead className="text-right">{t("total")}</TableHead>
									<TableHead className="w-[100px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{archiveData?.data.map((item, idx) => {
									const total = item.cart.reduce((acc, cartItem) => {
										const productPrices = prices[cartItem.productNumber] || [];
										const price = productPrices[0]?.bestPrice || 0;
										return acc + price * cartItem.quantity;
									}, 0);

									return (
										<React.Fragment key={idx}>
											<TableRow
												className={expandedRow === idx ? "bg-muted/50" : ""}>
												<TableCell className="font-medium">
													{new Date(item.date).toLocaleString(locale, {
														year: "numeric",
														month: "short",
														day: "2-digit",
														hour: "2-digit",
														minute: "2-digit",
													})}
												</TableCell>
												<TableCell className="hidden lg:table-cell">{item.userId}</TableCell>
												<TableCell className="text-right">
													{item.cart.length}
												</TableCell>
												<TableCell className="text-right font-medium">
													{formatNorwegianCurrency(total)}
												</TableCell>
												<TableCell>
													<Button
														variant={
															expandedRow === idx ? "secondary" : "outline"
														}
														size="sm"
														onClick={() =>
															setExpandedRow(expandedRow === idx ? null : idx)
														}>
														{expandedRow === idx ? t("hide") : t("view")}
													</Button>
												</TableCell>
											</TableRow>
											{expandedRow === idx && (
												<TableRow>
													<TableCell
														colSpan={5}
														className="p-0">
														<div className="bg-muted/30 border-t px-2 py-4">
															<Table>
																<TableHeader>
																	<TableRow>
																		<TableHead className="w-[80px]">
																			{t("image")}
																		</TableHead>
																		<TableHead>
																			{t("productNumber")}
																		</TableHead>
																		<TableHead className="hidden lg:table-cell">{t("itemNumber")}</TableHead>
																		<TableHead className="text-right">
																			{t("quantity")}
																		</TableHead>
																		<TableHead className="hidden lg:table-cell">{t("warehouse")}</TableHead>
																		<TableHead className="hidden lg:table-cell">{t("company")}</TableHead>
																	</TableRow>
																</TableHeader>
																<TableBody>
																	{item.cart.map((cartItem, cartIdx) => (
																		<TableRow key={cartIdx}>
																			<TableCell className="font-medium">
																				<div className="bg-muted relative h-12 w-12 rounded lg:h-16 lg:w-16">
																					{cartItem.mediaId?.[0]?.url ? (
																						<Image
																							src={cartItem.mediaId[0].url}
																							alt={
																								cartItem.mediaId[0].filename || ""
																							}
																							fill
																							sizes="64px"
																							className="object-contain"
																							loading="eager"
																						/>
																					) : (
																						<div className="h-full w-full bg-gray-200" />
																					)}
																				</div>
																			</TableCell>
																			<TableCell>
																				{cartItem.productNumber}
																			</TableCell>
																			<TableCell className="hidden lg:table-cell">{cartItem.itemNumber}</TableCell>
																			<TableCell className="text-right">
																				{cartItem.quantity}
																			</TableCell>
																			<TableCell className="hidden lg:table-cell">
																				{cartItem.warehouseNumber}
																			</TableCell>
																			<TableCell className="hidden lg:table-cell">
																				{cartItem.companyNumber}
																			</TableCell>
																		</TableRow>
																	))}
																</TableBody>
															</Table>
														</div>
													</TableCell>
												</TableRow>
											)}
										</React.Fragment>
									);
								})}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					<div className="mt-4 flex items-center justify-center space-x-2 sm:justify-end">
						<Button
							variant="outline"
							size="icon"
							disabled={currentPage === 1}
							onClick={() => handlePageChange(currentPage - 1)}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-muted-foreground text-sm">
							{t("page")} {currentPage} {t("of")} {archiveData?.totalPages || 1}
						</span>
						<Button
							variant="outline"
							size="icon"
							disabled={currentPage === (archiveData?.totalPages || 1)}
							onClick={() => handlePageChange(currentPage + 1)}>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</>
			)}
		</main>
	);
};

export default CartHistoryPage;
