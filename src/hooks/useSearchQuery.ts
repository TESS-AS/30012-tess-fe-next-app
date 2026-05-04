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
		queryFn: async ({ signal }): Promise<SearchResponse> => {
			const response = await axiosClient.get<SearchResponse>(
				`/search/${query}`,
				{ signal },
			);
			return response.data;
		},
		enabled: enabled && query.length > 0,
		staleTime: 0,
		gcTime: 0,
		refetchOnMount: "always",
		refetchOnReconnect: false,
		notifyOnChangeProps: ["data", "error", "isLoading", "isFetching"],
	});

	return {
		data: searchQuery.data,
		isLoading: searchQuery.isLoading,
		isFetching: searchQuery.isFetching,
		error: searchQuery.error,
		isSuccess: searchQuery.isSuccess,
		refetch: searchQuery.refetch,
	};
}
