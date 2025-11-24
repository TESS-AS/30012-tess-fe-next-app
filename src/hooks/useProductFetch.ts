import { productFetch } from "@/services/product.service";
import { useQuery } from "@tanstack/react-query";

interface UseProductFetchProps {
	productName: string;
	enabled?: boolean;
}

export function useProductFetch({
	productName,
	enabled = true,
}: UseProductFetchProps) {
	const query = useQuery({
		queryKey: ["product", productName],
		queryFn: async () => {
			return await productFetch(productName);
		},
		enabled: enabled && !!productName,
		staleTime: 1 * 60 * 1000,
		gcTime: 5 * 60 * 1000, // 5 minutes
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	return {
		data: query.data,
		isLoading: query.isLoading && !query.data,
		isFetching: query.isFetching,
		error: query.error,
		isSuccess: query.isSuccess,
		refetch: query.refetch,
	};
}
