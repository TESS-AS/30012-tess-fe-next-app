import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getOrderHistory } from "../services/orders.service";

const getStatusQueryKey = (status?: number | number[]) => {
	if (status === undefined) return "all";
	if (Array.isArray(status)) return status.join(",");
	return String(status);
};

export const orderHistoryKeys = {
	all: ["orderHistory"] as const,
	lists: () => [...orderHistoryKeys.all, "list"] as const,
	list: (
		customerNumber: string,
		search: string,
		page: number,
		pageSize: number,
		status?: number | number[],
	) =>
		[
			...orderHistoryKeys.lists(),
			customerNumber,
			search,
			page,
			pageSize,
			getStatusQueryKey(status),
		] as const,
};

export const useOrderHistory = (
	customernumber: string,
	search: string,
	page: number,
	pageSize: number = 10,
	status?: number | number[],
	enabled: boolean = true,
) => {
	const [debouncedSearch, setDebouncedSearch] = useState(search);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);

		return () => clearTimeout(timer);
	}, [search]);

	const { data, isPending, isFetching, error, refetch } = useQuery({
		queryKey: orderHistoryKeys.list(
			customernumber,
			debouncedSearch,
			page,
			pageSize,
			status,
		),
		queryFn: async () => {
			const response = await getOrderHistory(
				customernumber,
				debouncedSearch,
				page,
				pageSize,
				status,
			);
			return response;
		},
		enabled: enabled && !!customernumber,
		staleTime: 0,
		gcTime: 1000 * 60 * 10,
	});

	return {
		orders: data?.data ?? [],
		totalPages: data?.meta.totalPages ?? 0,
		totalItems: data?.meta.totalItems ?? 0,
		isLoading: isPending || isFetching,
		error,
		refetch,
	};
};
