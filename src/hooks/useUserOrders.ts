import { useQuery } from "@tanstack/react-query";

import { getUserOrders } from "../services/orders.service";

export const userOrdersKeys = {
	all: ["userOrders"] as const,
	lists: () => [...userOrdersKeys.all, "list"] as const,
	list: (page: number, pageSize: number) =>
		[...userOrdersKeys.lists(), page, pageSize] as const,
};

export const useUserOrders = (page: number = 1, pageSize: number = 20) => {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: userOrdersKeys.list(page, pageSize),
		queryFn: async () => {
			const response = await getUserOrders(page, pageSize);
			return response;
		},
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	});

	return {
		orders: data || [],
		isLoading,
		error,
		refetch,
	};
};
