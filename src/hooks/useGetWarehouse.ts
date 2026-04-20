import axiosClient from "@/services/axiosClient";
import { useQuery } from "@tanstack/react-query";

interface Warehouse {
	id: string;
	name: string;
}

export const warehouseKeys = {
	all: ["warehouses"] as const,
	list: (companyNumber?: string) =>
		[...warehouseKeys.all, companyNumber ?? "all"] as const,
};

export function useGetWarehouses(shouldFetch: boolean, companyNumber?: string | number) {
	const companyStr = companyNumber != null ? String(companyNumber) : undefined;

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: warehouseKeys.list(companyStr),
		queryFn: async () => {
			const params = companyStr ? { companyNumber: companyStr } : {};
			const response = await axiosClient.get("/warehouse", { params });
			return (response.data as any[]).map((w) => ({
				id: w.warehousenumber as string,
				name: w.warehousename as string,
			}));
		},
		enabled: shouldFetch,
	});

	return { warehouses: (data ?? []) as Warehouse[], isLoading, error, refetch };
}
