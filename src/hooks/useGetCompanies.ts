import axiosClient from "@/services/axiosClient";
import { useQuery } from "@tanstack/react-query";

interface Company {
	companyNumber: number;
	companyId: string;
	companyName: string;
}

export const companyKeys = {
	all: ["companies"] as const,
};

export function useGetCompanies(shouldFetch: boolean) {
	const { data, isLoading, error } = useQuery({
		queryKey: companyKeys.all,
		queryFn: async () => {
			const response = await axiosClient.get("/company");
			return response.data as Company[];
		},
		enabled: shouldFetch,
	});

	return { companies: data ?? [], isLoading, error };
}
