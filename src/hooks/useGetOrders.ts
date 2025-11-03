import { useGetProfileData } from "@/hooks/useGetProfileData";
import axiosClient from "@/services/axiosClient";
import {
	mapLineStatusToOrderStatus,
	OrderItems,
	OrderResponse,
} from "@/types/orderHistory.types";
import { useQuery } from "@tanstack/react-query";

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

export const ordersKeys = {
	all: ["orders"] as const,
	lists: () => [...ordersKeys.all, "list"] as const,
	list: (
		customerNumber: string,
		page: number,
		perPage: number,
		filters: OrderFilters,
	) => [...ordersKeys.lists(), customerNumber, page, perPage, filters] as const,
};

export function useGetOrders(
	page: number,
	perPage: number = 10,
	filters: OrderFilters = {},
	enabled: boolean = true,
) {
	const { data: profile, isLoading: isProfileLoading } = useGetProfileData();
	const customerNumber = profile?.customerNumbers?.[0] || "";

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ordersKeys.list(customerNumber, page, perPage, filters),
		queryFn: async () => {
			const params = {
				page,
				pageSize: perPage,
				ordernumber: filters.orderNumber,
				invoicenumber: filters.invoiceNumber,
				fromDate: filters.fromDate,
				toDate: filters.toDate,
				status: filters.status,
			};

			const response = await axiosClient.get<OrdersApiResponse>(
				`/order/${customerNumber}`,
				{ params },
			);

			const mapped: OrderItems[] = response.data.data.map((order) => {
				const maxStatus = Math.max(
					...order.orderLines.map((line) => line.lineStatus),
				);
				return {
					order_id: order.order_id,
					orderNumber: order.orderNumber,
					date: order.date,
					status: mapLineStatusToOrderStatus(maxStatus),
					total: order.sum,
					items: order.orderLines,
				};
			});

			return {
				data: mapped,
				meta: response.data.meta,
			};
		},
		enabled: enabled && !!customerNumber && !isProfileLoading,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
	});

	return {
		data: data?.data || [],
		isLoading: isLoading || isProfileLoading,
		totalPages: data?.meta.totalPages || 0,
		totalItems: data?.meta.totalItems || 0,
		error,
		refetch,
	};
}
