// useGetOrders.ts
import { useEffect, useState } from "react";

import { useGetProfileData } from "@/hooks/useGetProfileData";
import axiosClient from "@/services/axiosClient";
import {
	mapLineStatusToOrderStatus,
	OrderItems,
	OrderResponse,
} from "@/types/orderHistory.types";

export interface OrderFilters {
	orderNumber?: number;
	invoiceNumber?: string;
	fromDate?: string;
	toDate?: string;
	status?: number;
}

export function useGetOrders(
	page: number,
	perPage: number = 10,
	filters: OrderFilters = {},
) {
	const { data: profile, isLoading: isProfileLoading } = useGetProfileData();
	const [allOrders, setAllOrders] = useState<OrderItems[]>([]);
	const [data, setData] = useState<OrderItems[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		if (isProfileLoading || !profile?.customerNumbers?.length) return;

		const customerNumber = profile.customerNumbers[0];
		setIsLoading(true);

		const params = {
			ordernumber: filters.orderNumber,
			invoicenumber: filters.invoiceNumber,
			fromDate: filters.fromDate,
			toDate: filters.toDate,
			status: filters.status,
		};

		axiosClient
			.get<OrderResponse[]>(`/order/${customerNumber}`, { params })
			.then((res) => {
				const mapped: OrderItems[] = res.data.map((order) => {
					const maxStatus = Math.max(
						...order.orderLines.map((line) => line.lineStatus),
					);
					return {
						id: order.orderId,
						date: order.date,
						status: mapLineStatusToOrderStatus(maxStatus),
						total: order.sum,
						items: order.orderLines,
					};
				});
				setAllOrders(mapped);
				setTotalPages(Math.ceil(mapped.length / perPage));
			})
			.catch((err) => {
				console.error("Failed to fetch orders:", err);
				setAllOrders([]);
				setTotalPages(0);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [profile, isProfileLoading, filters]);

	useEffect(() => {
		// Client-side pagination
		const start = (page - 1) * perPage;
		const end = start + perPage;
		setData(allOrders.slice(start, end));
	}, [page, perPage, allOrders]);

	return {
		data,
		isLoading,
		totalPages,
	};
}
