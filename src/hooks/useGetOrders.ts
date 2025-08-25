// useGetOrders.ts
import { useEffect, useState } from "react";

import { useGetProfileData } from "@/hooks/useGetProfileData";
import axiosClient from "@/services/axiosClient";
import {
	mapLineStatusToOrderStatus,
	OrderItems,
	OrderResponse,
} from "@/types/orderHistory.types";

interface OrdersApiResponse {
	data: OrderResponse[];
	meta: {
		page: number;
		pageSize: number;
		totalPages: number;
		totalItems: number;
	};
}

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
	const [data, setData] = useState<OrderItems[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);

	useEffect(() => {
		if (isProfileLoading || !profile?.customerNumbers?.length) return;

		const customerNumber = profile.customerNumbers[0];
		setIsLoading(true);

		const params = {
			page,
			pageSize: perPage,
			ordernumber: filters.orderNumber,
			invoicenumber: filters.invoiceNumber,
			fromDate: filters.fromDate,
			toDate: filters.toDate,
			status: filters.status,
		};

		axiosClient
			.get<OrdersApiResponse>(`/order/${customerNumber}`, { params })
			.then((res) => {
				const mapped: OrderItems[] = res.data.data.map((order) => {
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
				setData(mapped);
				setTotalPages(res.data.meta.totalPages);
				setTotalItems(res.data.meta.totalItems);
			})
			.catch((err) => {
				console.error("Failed to fetch orders:", err);
				setData([]);
				setTotalPages(0);
				setTotalItems(0);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [page, perPage, profile, isProfileLoading, filters]);

	return {
		data,
		isLoading,
		totalPages,
		totalItems,
	};
}
