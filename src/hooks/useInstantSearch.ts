import { useState, useMemo } from "react";

import { useSearchQuery } from "./useSearchQuery";

interface UseInstantSearchProps {
	minQueryLength?: number;
}

export function useInstantSearch({
	minQueryLength = 2,
}: UseInstantSearchProps = {}) {
	const [query, setQuery] = useState("");

	// Only search if query meets minimum length
	const shouldSearch = query.length >= minQueryLength;

	const searchQuery = useSearchQuery({
		query,
		enabled: shouldSearch,
	});

	// Clear results when query is too short
	const data = useMemo(() => {
		if (!shouldSearch) return null;
		return searchQuery.data;
	}, [searchQuery.data, shouldSearch]);

	const isLoading = shouldSearch ? searchQuery.isLoading : false;

	return {
		query,
		setQuery,
		data,
		isLoading,
		error: searchQuery.error,
		isSuccess: searchQuery.isSuccess,
		refetch: searchQuery.refetch,
		// Helper to clear search
		clearSearch: () => {
			setQuery("");
		},
	};
}
