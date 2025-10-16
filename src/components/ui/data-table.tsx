"use client";

import React, { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	CircleX,
	Eye,
	MoreVertical,
	ShoppingCart,
	Truck,
} from "lucide-react";
import Image from "next/image";

import { Button } from "./button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./dropdown-menu";

export interface Column<T> {
	key: string;
	header: string | (() => React.ReactElement) | React.ReactElement;
	cell: (item: T) => React.ReactNode;
	sortable?: boolean;
}

interface DataTableProps<T> {
	onOrderClick?: (orderId: string) => void;
	expandableContent?: (item: T) => React.ReactNode;
	isExpandable?: boolean;
	data: T[];
	columns: Column<T>[];
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange?: (page: number) => void;
	isLoading?: boolean;
	className?: string;
	isDropdownColumn?: boolean;

	selectedIds?: string[]; // to tint selected rows
	selectedRowBgClass?: string; // the class to apply for selected rows
	onHoseClick?: (hoseId: string) => void;
}

export function DataTable<T extends { orderId: string }>({
	onOrderClick,
	expandableContent,
	isExpandable = false,
	data,
	columns,
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
	isLoading,
	className,
	isDropdownColumn,
	selectedIds = [],
	selectedRowBgClass = "bg-[#E6F7EA]",
	onHoseClick,
}: DataTableProps<T>) {
	const [expandedRows, setExpandedRows] = useState<number[]>([]);
	const safeColumns = useMemo(
		() => (columns ?? []).filter(Boolean) as Column<T>[],
		[columns],
	);
	const isSelected = (id: string) => selectedIds.includes(id);
	const showPagination =
		!isLoading && totalItems > itemsPerPage && data.length > 0;
	return (
		<div className={className}>
			<div className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[800px]">
						{isLoading ? (
							<tbody>
								{Array.from({ length: 5 }).map((_, index) => (
									<tr
										key={index}
										className="animate-pulse">
										{isExpandable && (
											<td className="w-10 min-w-[40px] border-b border-[#C1C4C2] px-4 py-4">
												<div className="h-4 w-4 rounded bg-gray-200" />
											</td>
										)}
										{safeColumns.map((col) => (
											<td
												key={col.key}
												className="border-b border-[#C1C4C2] px-4 py-4">
												<div className="h-4 w-full rounded bg-gray-200" />
											</td>
										))}
										{isDropdownColumn && (
											<td className="sticky right-0 w-20 min-w-[80px] border-b border-[#C1C4C2] px-4 py-4">
												<div className="ml-auto h-4 w-4 rounded bg-gray-200" />
											</td>
										)}
									</tr>
								))}
							</tbody>
						) : (
							<>
								<thead className="border-b">
									<tr>
										{isExpandable && (
											<th className="w-10 min-w-[40px] border-b border-[#C1C4C2] bg-[#F8F9F8] px-4 py-4"></th>
										)}
										{safeColumns.map((column) => (
											<th
												key={column.key}
												className={cn(
													"border-b border-[#C1C4C2] bg-[#F8F9F8] px-4 py-4 text-left text-sm font-medium text-[#5A615D]",
													{
														"min-w-[160px]": column.key === "orderId",
														"min-w-[140px]": column.key === "requester",
														"min-w-[120px]": column.key === "createdDate",
														"min-w-[100px]": column.key === "price",
														"min-w-[180px]": column.key === "status",
														// Pin the Handling header on the far right
														"sticky right-0 z-10": column.key === "action",
														"p-0": column.key === "handling",
													},
												)}>
												{typeof column.header === "string"
													? column.header
													: typeof column.header === "function"
														? column.header()
														: column.header}
												{column.sortable &&
													typeof column.header === "string" && (
														<button
															className="ml-1 text-gray-400"
															aria-label={`Sorter ${column.header}`}>
															<Image
																src="/icons/toggle-caret.svg"
																alt="Toggle"
																width={8}
																height={8}
															/>
														</button>
													)}
											</th>
										))}
										{isDropdownColumn && (
											<th className="sticky right-0 w-20 min-w-[80px] border-b border-[#C1C4C2] bg-[#F8F9F8] px-4 py-4"></th>
										)}
									</tr>
								</thead>

								<tbody>
									{data.map((item, index) => (
										<React.Fragment key={index}>
											<tr
												onClick={() => onHoseClick?.(item.orderId)}
												className={cn(
													"group border-b border-[#C1C4C2] transition-colors duration-200",
													isSelected(item.orderId)
														? selectedRowBgClass
														: "hover:bg-[#F8F9F8]",
													onHoseClick && "cursor-pointer",
												)}>
												{isExpandable && (
													<td className="w-10 px-4 py-4">
														<Button
															variant="ghost"
															size="sm"
															className="h-6 w-6 p-0 transition-all duration-200"
															onClick={() => {
																setExpandedRows((prev) =>
																	prev.includes(index)
																		? prev.filter((i) => i !== index)
																		: [...prev, index],
																);
															}}>
															<ChevronDown
																className={cn(
																	"h-4 w-4 transition-transform duration-200",
																	expandedRows.includes(index)
																		? "rotate-180 text-[#1C6D2C]"
																		: "",
																)}
															/>
														</Button>
													</td>
												)}

												{safeColumns.map((column) => (
													<td
														key={column.key}
														className={cn(
															"px-4 py-4 font-medium text-[#0F1912]",
															// Keep the pinned action column visible and blend with row background
															column.key === "action" &&
																"sticky right-0 bg-inherit",
														)}>
														{column.cell(item)}
													</td>
												))}

												{isDropdownColumn && (
													<td className="sticky right-0 bg-white px-4 py-4 text-right group-hover:bg-[#F8F9F8]">
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant="ghost"
																	className="h-8 w-8 p-0 text-[#5A615D] hover:text-[#0F1912]">
																	<MoreVertical className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent
																align="end"
																className="w-[200px]">
																<DropdownMenuItem
																	className="flex items-center gap-3 text-xs"
																	onClick={() => onOrderClick?.(item.orderId)}>
																	<Eye className="h-4 w-4" />
																	<span>Vis ordre</span>
																</DropdownMenuItem>
																<DropdownMenuItem className="flex items-center gap-3 text-xs">
																	<ShoppingCart className="h-4 w-4" />
																	<span>Legg til varer i ny handlekurv</span>
																</DropdownMenuItem>
																<DropdownMenuItem className="flex items-center gap-3 text-xs">
																	<Truck className="h-4 w-4" />
																	<span>Spor bestillingen</span>
																</DropdownMenuItem>
																<DropdownMenuItem className="flex items-center gap-3 text-xs">
																	<CircleX className="h-4 w-4" />
																	<span>Kanseller bestilling</span>
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</td>
												)}
											</tr>

											{isExpandable &&
												expandedRows.includes(index) &&
												expandableContent && (
													<tr className="animate-in fade-in-0 zoom-in-95 border-b border-[#C1C4C2] bg-[#F3FAF7] duration-200">
														<td
															colSpan={safeColumns.length + 2}
															className="border-t border-[#E5E7E6] py-6 pl-16">
															{expandableContent(item)}
														</td>
													</tr>
												)}
										</React.Fragment>
									))}
								</tbody>
							</>
						)}
					</table>
				</div>
			</div>

			{showPagination && (
				<div className="flex items-center justify-between px-2 py-4">
					<p className="text-sm text-gray-700">
						Viser {(currentPage - 1) * itemsPerPage + 1} til{" "}
						{Math.min(currentPage * itemsPerPage, totalItems)} av {totalItems}{" "}
						resultater
					</p>
					<div className="flex items-center justify-center">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange?.(currentPage - 1)}
							disabled={currentPage <= 1}
							className="h-8 w-8 rounded-none rounded-l-md border-[#8A8F8C] p-0">
							<ChevronLeft className="h-4 w-4" />
						</Button>

						<div className="flex items-center">
							{Array.from({ length: totalPages }).map((_, index) => {
								const pageNumber = index + 1;
								const shouldShow =
									pageNumber === 1 ||
									pageNumber === totalPages ||
									Math.abs(pageNumber - currentPage) <= 1;

								if (shouldShow) {
									return (
										<Button
											key={pageNumber}
											variant="outline"
											size="sm"
											className={cn(
												"h-8 w-8 rounded-none border-r-[0.5px] border-l-0 border-[#8A8F8C] p-0 font-medium text-[#5A615D]",
												pageNumber === currentPage &&
													"border-[#8A8F8C] bg-[#DCF7E0] text-[#009640] hover:bg-[#DCF7E0] hover:text-[#009640]",
											)}
											onClick={() => onPageChange?.(pageNumber)}>
											{pageNumber}
										</Button>
									);
								} else if (
									(pageNumber === 2 && currentPage > 3) ||
									(pageNumber === totalPages - 1 &&
										currentPage < totalPages - 2)
								) {
									return (
										<span
											key={pageNumber}
											className="flex h-8 w-8 items-center justify-center border-1 border-l-0 border-[#8A8F8C] p-0 font-medium text-[#5A615D]">
											...
										</span>
									);
								}
								return null;
							})}
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange?.(currentPage + 1)}
							disabled={totalPages === 0 || currentPage >= totalPages}
							className="h-8 w-8 rounded-none rounded-r-md border-l-0 border-[#8A8F8C] p-0">
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
