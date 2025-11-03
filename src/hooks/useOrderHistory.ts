import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getOrderHistory } from "../services/orders.service";

export const orderHistoryKeys = {
	all: ["orderHistory"] as const,
	lists: () => [...orderHistoryKeys.all, "list"] as const,
	list: (
		customerNumber: string,
		search: string,
		page: number,
		pageSize: number,
	) =>
		[
			...orderHistoryKeys.lists(),
			customerNumber,
			search,
			page,
			pageSize,
		] as const,
};

export const useOrderHistory = (
	customernumber: string,
	search: string,
	page: number,
	pageSize: number = 10,
	enabled: boolean = true,
) => {
	const [debouncedSearch, setDebouncedSearch] = useState(search);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);

		return () => clearTimeout(timer);
	}, [search]);

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: orderHistoryKeys.list(
			customernumber,
			debouncedSearch,
			page,
			pageSize,
		),
		queryFn: async () => {
			const response = await getOrderHistory(
				customernumber,
				debouncedSearch,
				page,
				pageSize,
			);
			return response;
		},
		enabled: enabled && !!customernumber,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	});

	return {
		orders: data?.data || [],
		totalPages: data?.meta.totalPages || 0,
		totalItems: data?.meta.totalItems || 0,
		isLoading,
		error,
		refetch,
	};
};
