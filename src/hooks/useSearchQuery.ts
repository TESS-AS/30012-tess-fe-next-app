import axiosClient from "@/services/axiosClient";
import { SearchResponse } from "@/types/search.types";
import { useQuery } from "@tanstack/react-query";

interface UseSearchQueryProps {
	query: string;
	enabled?: boolean;
}

export function useSearchQuery({ query, enabled = true }: UseSearchQueryProps) {
	const searchQuery = useQuery({
		queryKey: ["search", query],
		queryFn: async (): Promise<SearchResponse> => {
			const response = await axiosClient.get<SearchResponse>(
				`/search/${query}`,
			);
			return response.data;
		},
		enabled: enabled && query.length > 0,
		staleTime: 30 * 1000,
		gcTime: 2 * 60 * 1000,
		refetchOnMount: false,
		refetchOnReconnect: false,
		placeholderData: (previousData) => previousData,
		notifyOnChangeProps: ["data", "error"],
	});

	return {
		data: searchQuery.data,
		isLoading: searchQuery.isLoading && !searchQuery.data,
		isFetching: searchQuery.isFetching,
		error: searchQuery.error,
		isSuccess: searchQuery.isSuccess,
		refetch: searchQuery.refetch,
	};
}
