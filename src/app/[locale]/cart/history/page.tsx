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
import { getArchiveCart } from "@/services/carts.service";
import { getProductPrice } from "@/services/product.service";
import { ArchiveCartResponse } from "@/types/carts.types";
import { PriceResponse } from "@/types/search.types";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

const CartHistoryPage = () => {
	const params = useParams();
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
							"169999",
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

	return (
		<div className="container py-10">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Cart History</h1>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<Loader2 className="h-6 w-6 animate-spin" />
				</div>
			) : (
				<>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[180px]">Date</TableHead>
								<TableHead>User Id</TableHead>
								<TableHead className="text-right">Items</TableHead>
								<TableHead className="text-right">Total Amount</TableHead>
								<TableHead className="w-[100px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{archiveData?.data.map((item, idx) => {
								const total = item.cart.reduce((acc, cartItem) => {
									const productPrices = prices[cartItem.productNumber] || [];
									const price = productPrices[0]?.basePriceTotal || 0;
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
											<TableCell>{item.userId}</TableCell>
											<TableCell className="text-right">
												{item.cart.length}
											</TableCell>
											<TableCell className="text-right font-medium">
												${total.toFixed(2)}
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
													{expandedRow === idx ? "Hide" : "View"}
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
																	<TableHead className="w-[180px]">
																		Image
																	</TableHead>
																	<TableHead className="w-[180px]">
																		Product Number
																	</TableHead>
																	<TableHead>Item Number</TableHead>
																	<TableHead className="text-right">
																		Quantity
																	</TableHead>
																	<TableHead>Warehouse</TableHead>
																	<TableHead>Company</TableHead>
																</TableRow>
															</TableHeader>
															<TableBody>
																{item.cart.map((cartItem, idx) => (
																	<TableRow key={idx}>
																		<TableCell className="font-medium">
																			<div className="bg-muted relative h-16 w-16 rounded">
																				{cartItem.mediaId?.[0]?.url ? (
																					<Image
																						src={cartItem.mediaId[0].url}
																						alt={
																							cartItem.mediaId[0].filename || ""
																						}
																						fill
																						className="object-contain"
																					/>
																				) : (
																					<div className="h-full w-full bg-gray-200" />
																				)}
																			</div>
																		</TableCell>
																		<TableCell>
																			{cartItem.productNumber}
																		</TableCell>
																		<TableCell>{cartItem.itemNumber}</TableCell>
																		<TableCell className="text-right">
																			{cartItem.quantity}
																		</TableCell>
																		<TableCell>
																			{cartItem.warehouseNumber}
																		</TableCell>
																		<TableCell>
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

					{/* Pagination */}
					<div className="mt-4 flex items-center justify-end space-x-2">
						<Button
							variant="outline"
							size="icon"
							disabled={currentPage === 1}
							onClick={() => handlePageChange(currentPage - 1)}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-muted-foreground text-sm">
							Page {currentPage} of {archiveData?.totalPages || 1}
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
		</div>
	);
};

export default CartHistoryPage;
