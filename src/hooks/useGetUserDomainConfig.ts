import { getUserDomainConfig } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export const userDomainConfigKeys = {
	all: ["userDomainConfig"] as const,
	detail: (userEmail: string) => [...userDomainConfigKeys.all, userEmail] as const,
};

export function useGetUserDomainConfig(
	userEmail: string,
	enabled: boolean = true,
) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: userDomainConfigKeys.detail(userEmail),
		queryFn: async () => {
			const response = await getUserDomainConfig(userEmail);
			return response;
		},
		enabled: enabled && !!userEmail,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	});

	const domainConfig = data?.domainConfig?.[0];

	return {
		customers: domainConfig?.customers || [],
		companies: domainConfig?.companies || [],
		warehouses: domainConfig?.warehouses || [],
		assortments: domainConfig?.assortments || [],
		domain: domainConfig?.domain,
		isLoading,
		error,
		refetch,
	};
}
