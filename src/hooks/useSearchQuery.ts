import axiosClient from "@/services/axiosClient";
import { SearchResponse } from "@/types/search.types";
import { useQuery } from "@tanstack/react-query";

interface UseSearchQueryProps {
	query: string;
	enabled?: boolean;
}

export function useSearchQuery({ query, enabled = true }: UseSearchQueryProps) {
	// Main search query
	const searchQuery = useQuery({
		queryKey: ["search", query],
		queryFn: async (): Promise<SearchResponse> => {
			const response = await axiosClient.get<SearchResponse>(
				`/search/${query}`,
			);
			return response.data;
		},
		enabled: enabled && query.length > 0,
		staleTime: 30 * 1000, // 30 seconds for search results (more responsive)
		gcTime: 2 * 60 * 1000, // 2 minutes cache
		// Prevent too many rapid requests by adding a small delay
		refetchOnMount: false,
		refetchOnReconnect: false,
	});

	return {
		data: searchQuery.data,
		isLoading: searchQuery.isLoading,
		error: searchQuery.error,
		isSuccess: searchQuery.isSuccess,
		refetch: searchQuery.refetch,
	};
}
