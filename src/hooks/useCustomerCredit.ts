import {
	getCustomerCredit,
	type CustomerCredit,
} from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export const customerCreditKeys = {
	all: ["customerCredit"] as const,
};

export function useCustomerCredit(enabled: boolean = true) {
	const query = useQuery<CustomerCredit | null>({
		queryKey: customerCreditKeys.all,
		queryFn: getCustomerCredit,
		enabled,
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});

	return {
		credit: query.data ?? null,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
	};
}
