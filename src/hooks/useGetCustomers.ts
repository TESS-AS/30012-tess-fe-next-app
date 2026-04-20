import axiosClient from "@/services/axiosClient";
import { useQuery } from "@tanstack/react-query";

interface Customer {
	customerNumber: string;
	customerName: string;
}

export const customerKeys = {
	all: ["customers"] as const,
	list: (companyNumber?: string) =>
		[...customerKeys.all, companyNumber ?? "all"] as const,
};

export function useGetCustomers(shouldFetch: boolean, companyNumber?: string | number) {
	const companyStr = companyNumber != null ? String(companyNumber) : undefined;

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: customerKeys.list(companyStr),
		queryFn: async () => {
			const params = companyStr ? { companyNumber: companyStr } : {};
			const response = await axiosClient.get("/customer", { params });
			return response.data as Customer[];
		},
		enabled: shouldFetch,
	});

	return { customers: data ?? [], isLoading, error, refetch };
}
