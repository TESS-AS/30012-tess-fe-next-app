import axiosClient from "@/services/axiosClient";
import { useQuery } from "@tanstack/react-query";

export const assortmentKeys = {
	all: ["assortments"] as const,
	list: (companyNumber?: string) =>
		[...assortmentKeys.all, companyNumber ?? "all"] as const,
};

export function useGetAssortments(shouldFetch: boolean, companyNumber?: string | number) {
	const companyStr = companyNumber != null ? String(companyNumber) : undefined;

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: assortmentKeys.list(companyStr),
		queryFn: async () => {
			const params = companyStr ? { companyNumber: companyStr } : {};
			const response = await axiosClient.get("/assortment", { params });
			return response.data ?? [];
		},
		enabled: shouldFetch,
	});

	return { assortments: (data ?? []) as any[], isLoading, error, refetch };
}
