import { getAssets, getS1Codes, searchAssets } from "@/services/assets.service";
import { GetAssetsResponse, S1Codes } from "@/types/assets.types";
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

type UseGetAssetsParams = {
	customerNumber?: string;
	s1Code?: string;
	filters?: FilterOptions;
	options?: InitOptions;
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

	const assetsQuery = useQuery({
		queryKey: assetsKeys.list({
			customerNumber,
			s1Code,
			filters: { page: 1, pageSize: 10 },
		}),
		queryFn: async () => {
			return await getAssets(customerNumber, s1Code, 1, 10);
		},
		enabled: options.initAssets !== false,
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
		} = filters;

		const result = search
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

		queryClient.setQueryData(
			assetsKeys.list({ customerNumber, s1Code, filters }),
			result,
		);

		return result;
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

	const ensureS1Codes = async () => {
		const cached = queryClient.getQueryData(
			assetsKeys.s1Codes({ page: 1, pageSize: 100, s2: options.s2Filter }),
		);
		if (cached) return cached;
		return await fetchS1Codes(1, 100, options.s2Filter);
	};

	return {
		assets: assetsQuery.data?.data ?? [],
		setAssets: (data: GetAssetsResponse[]) => {
			queryClient.setQueryData(
				assetsKeys.list({
					customerNumber,
					s1Code,
					filters: { page: 1, pageSize: 10 },
				}),
				(old: any) => ({ ...old, data }),
			);
		},
		s1Codes: s1CodesQuery.data?.data ?? [],
		setS1Codes: (data: S1Codes[]) => {
			queryClient.setQueryData(
				assetsKeys.s1Codes({ page: 1, pageSize: 100, s2: options.s2Filter }),
				(old: any) => ({ ...old, data }),
			);
		},
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
		ensureS1Codes,
		refetch: () => {
			assetsQuery.refetch();
			s1CodesQuery.refetch();
		},
	};
};
