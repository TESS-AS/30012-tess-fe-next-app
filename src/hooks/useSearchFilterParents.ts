import { useMemo, useState, useEffect } from "react";

import { loadFilterParents } from "@/services/categories.service";
import { useQuery } from "@tanstack/react-query";

interface UseSearchFilterParentsProps {
	searchTerm: string;
	language: string;
	enabled?: boolean;
	debounceMs?: number;
	minQueryLength?: number;
}

export function useSearchFilterParents({
	searchTerm,
	language,
	enabled = true,
	debounceMs = 300,
	minQueryLength = 2,
}: UseSearchFilterParentsProps) {
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

	// Debounce the search term
	useEffect(() => {
		if (!searchTerm.trim()) {
			setDebouncedSearchTerm("");
			return;
		}

		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm.trim());
		}, debounceMs);

		return () => clearTimeout(timer);
	}, [searchTerm, debounceMs]);

	// Only enable query if we have a search term that meets minimum length and it's enabled
	const shouldFetch = enabled && debouncedSearchTerm.length >= minQueryLength;

	const query = useQuery({
		queryKey: ["search-filter-parents", debouncedSearchTerm, language],
		queryFn: async () => {
			const result = await loadFilterParents({
				categoryNumber: null,
				searchTerm: debouncedSearchTerm,
				language,
			});
			return result;
		},
		enabled: shouldFetch,
		staleTime: 5 * 60 * 1000, // 5 minutes - filter data doesn't change often during search
		gcTime: 10 * 60 * 1000, // 10 minutes cache - keep in memory longer for better UX
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchInterval: false,
		// Retry only once on failure to avoid excessive retries
		retry: 1,
		// Don't retry on 4xx errors (client errors)
		retryOnMount: false,
	});

	// Extract category filters from the result
	const categoryFilters = useMemo(() => {
		if (
			!query.data ||
			!Array.isArray(query.data) ||
			!query.data[0]?.categoryFilters
		) {
			return [];
		}

		return query.data[0].categoryFilters.map((c: any) => ({
			id: c.assortmentNumber,
			name: c.nameNo,
			count: c.productCount,
		}));
	}, [query.data]);

	return {
		categoryFilters,
		isLoading: query.isLoading,
		error: query.error,
		isSuccess: query.isSuccess,
		refetch: query.refetch,
	};
}
