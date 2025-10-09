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
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchInterval: false,
		retry: 1,
		retryOnMount: false,
	});

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
