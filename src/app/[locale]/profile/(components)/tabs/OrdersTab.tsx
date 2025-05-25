"use client";

import { useState } from "react";

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
import { useGetOrders } from "@/hooks/useGetOrders";

function OrderSkeleton() {
	return (
		<Card className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
			<div className="w-full space-y-2">
				<div className="flex flex-wrap items-center gap-3 text-sm">
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-5 w-16 rounded-full" />
					<Skeleton className="h-5 w-16" />
				</div>
				<div className="flex gap-2 pt-2">
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton
							key={index}
							className="h-12 w-12 rounded-md"
						/>
					))}
				</div>
			</div>
			<Skeleton className="h-10 w-32 rounded-md" />
		</Card>
	);
}

export default function OrdersTab() {
	const [page, setPage] = useState(1);
	const { data: orders, isLoading, totalPages } = useGetOrders(page);

	return (
		<div className="space-y-6 px-2">
			<h2 className="text-2xl font-semibold">Your Orders</h2>

			{isLoading ? (
				<>
					<OrderSkeleton />
					<OrderSkeleton />
					<OrderSkeleton />
				</>
			) : !orders?.length ? (
				<p className="text-muted-foreground">No orders found.</p>
			) : (
				orders.map((order) => (
					<Card
						key={order.id}
						className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
						<div className="space-y-2">
							<div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
								<span className="font-medium text-black">#{order.id}</span>
								<span>{new Date(order.date).toLocaleDateString()}</span>
								<Badge
									variant={
										order.status === "Completed" ? "default" : "destructive"
									}>
									{order.status}
								</Badge>
								<span className="font-medium text-black">
									{order.total.toFixed(2)} €
								</span>
							</div>

							<div className="flex gap-2 pt-2">
								{order.items.map((item, index) => (
									<img
										key={index}
										src={item.imageUrl}
										alt={`Item ${index + 1}`}
										className="h-12 w-12 rounded-md border object-contain"
									/>
								))}
							</div>
						</div>

						<Button
							variant="outline"
							className="mt-2 md:mt-0">
							View Details →
						</Button>
					</Card>
				))
			)}

			<div className="flex w-full justify-center">
				<Pagination className="!w-auto">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => {
									if (page > 1) setPage((p) => p - 1);
								}}
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
								onClick={() => {
									if (page < totalPages) setPage((p) => p + 1);
								}}
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
