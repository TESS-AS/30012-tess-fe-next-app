// OrdersTab.tsx
"use client";

import { useState } from "react";

import { OrderFiltersForm } from "@/app/[locale]/profile/(components)/tabs/OrdersTab/OrdersTabFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderFilters, useGetOrders } from "@/hooks/useGetOrders";
import { getStatusBadgeProps } from "@/types/orderHistory.types";

export default function OrdersTab() {
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<OrderFilters>({
		orderNumber: undefined,
		invoiceNumber: "",
		fromDate: "",
		toDate: "",
		status: undefined,
	});

	const {
		data: orders,
		isLoading,
		totalPages,
	} = useGetOrders(page, 5, filters);

	return (
		<div className="space-y-6 px-2">
			<h2 className="text-2xl font-semibold">Your Orders</h2>

			<OrderFiltersForm
				filters={filters}
				setFilters={setFilters}
			/>

			{isLoading ? (
				<>
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</>
			) : !orders?.length ? (
				<p className="text-muted-foreground">No orders found.</p>
			) : (
				orders.map((order) => (
					<Card
						key={order.id}
						className="flex flex-col gap-4 p-4">
						<div className="flex flex-col text-sm md:flex-row md:items-center md:justify-between">
							<div className="flex flex-wrap items-center gap-3">
								<span className="font-medium text-black">#{order.id}</span>
								<span>{new Date(order.date).toLocaleDateString()}</span>
							</div>
							<span className="mt-2 text-base font-semibold text-black md:mt-0">
								{order.total.toFixed(2)} €
							</span>
						</div>
						<div className="flex flex-wrap gap-2 pt-2">
							{order.items.map((item, index) => (
								<Badge
									key={index}
									variant="outline"
									className="max-w-xs truncate text-xs font-normal"
									title={item.itemName}>
									{item.itemName}
								</Badge>
							))}
						</div>
						<div className="flex items-center justify-between">
							<Button variant="outline">View Details →</Button>
							<Badge {...getStatusBadgeProps(order.status)}>
								{order.status}
							</Badge>
						</div>
					</Card>
				))
			)}

			{/* Pagination */}
			<div className="flex w-full justify-center">
				<Pagination className="!w-auto">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => page > 1 && setPage((p) => p - 1)}
								className={page === 1 ? "pointer-events-none opacity-50" : ""}
							/>
						</PaginationItem>
						<PaginationItem>
							<span className="text-muted-foreground text-sm">
								Page {page} of {totalPages}
							</span>
						</PaginationItem>
						<PaginationItem>
							<PaginationNext
								onClick={() => page < totalPages && setPage((p) => p + 1)}
								className={
									page === totalPages ? "pointer-events-none opacity-50" : ""
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
