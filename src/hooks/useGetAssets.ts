import React from "react";

import { getAssets, getS1Codes, searchAssets } from "@/services/assets.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface FilterOptions {
	page?: number;
	pageSize?: number;
	ageSize?: string;
	approved?: string;
	overdue?: string;
	replacementDue?: string;
	spareSet?: string;
	rejected?: string;
	search?: string;
}

type InitOptions = {
	initAssets?: boolean;
	initS1Codes?: boolean;
	s2Filter?: boolean;
};

export const assetsKeys = {
	all: ["assets"] as const,
	lists: () => [...assetsKeys.all, "list"] as const,
	list: (params: {
		customerNumber?: string;
		s1Code?: string;
		filters?: FilterOptions;
	}) => [...assetsKeys.lists(), params] as const,
	s1Codes: (params: { page?: number; pageSize?: number; s2?: boolean }) =>
		[...assetsKeys.all, "s1Codes", params] as const,
};

export const useGetAssets = (
	customerNumber?: string,
	s1Code?: string,
	options: InitOptions = {
		initAssets: true,
		initS1Codes: true,
		s2Filter: false,
	},
) => {
	const queryClient = useQueryClient();
	const [currentFilters, setCurrentFilters] = React.useState<FilterOptions>({
		page: 1,
		pageSize: 10,
	});

	const assetsQuery = useQuery({
		queryKey: assetsKeys.list({
			customerNumber,
			s1Code,
			filters: currentFilters,
		}),
		queryFn: async () => {
			const {
				page = 1,
				pageSize = 10,
				ageSize,
				approved,
				overdue,
				replacementDue,
				spareSet,
				rejected,
				search,
			} = currentFilters;

			return search
				? await searchAssets(
						search,
						customerNumber,
						s1Code,
						page,
						pageSize,
						ageSize,
						approved,
						overdue,
						replacementDue,
						spareSet,
						rejected,
					)
				: await getAssets(
						customerNumber,
						s1Code,
						page,
						pageSize,
						ageSize,
						approved,
						overdue,
						replacementDue,
						spareSet,
						rejected,
					);
		},
		enabled: options.initAssets !== false && !!customerNumber,
		staleTime: 5 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	const s1CodesQuery = useQuery({
		queryKey: assetsKeys.s1Codes({
			page: 1,
			pageSize: 100,
			s2: options.s2Filter,
		}),
		queryFn: async () => {
			return await getS1Codes(1, 100, options.s2Filter);
		},
		enabled: options.initS1Codes !== false,
		staleTime: 10 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	const fetchAssets = async (filters: FilterOptions = {}) => {
		setCurrentFilters(filters);
	};

	const fetchS1Codes = async (
		page: number = 1,
		pageSize: number = 100,
		s2?: boolean,
	) => {
		const response = await getS1Codes(page, pageSize, s2);

		queryClient.setQueryData(
			assetsKeys.s1Codes({ page, pageSize, s2 }),
			response,
		);

		return response;
	};

	return {
		assets: assetsQuery.data?.data ?? [],
		s1Codes: s1CodesQuery.data?.data ?? [],
		loading: assetsQuery.isLoading || s1CodesQuery.isLoading,
		setLoading: () => {},
		error: assetsQuery.error || s1CodesQuery.error,
		pagination: {
			currentPage: assetsQuery.data?.meta.page ?? 1,
			pageSize: assetsQuery.data?.meta.pageSize ?? 10,
			totalItems: assetsQuery.data?.meta.totalItems ?? 0,
			totalPages: assetsQuery.data?.meta.totalPages ?? 0,
		},
		s1CodesPagination: {
			currentPage: s1CodesQuery.data?.meta.page ?? 1,
			pageSize: s1CodesQuery.data?.meta.pageSize ?? 100,
			totalItems: s1CodesQuery.data?.meta.total ?? 0,
			totalPages: s1CodesQuery.data?.meta.totalPages ?? 0,
		},
		fetchAssets,
		fetchS1Codes,
		refetch: () => {
			assetsQuery.refetch();
			s1CodesQuery.refetch();
		},
	};
};
