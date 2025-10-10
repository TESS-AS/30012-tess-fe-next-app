import { useState, useMemo, useEffect } from "react";

import { useSearchQuery } from "./useSearchQuery";

interface UseInstantSearchProps {
	minQueryLength?: number;
}

export function useInstantSearch({
	minQueryLength = 2,
}: UseInstantSearchProps = {}) {
	const [query, setQuery] = useState("");
	const [showLoading, setShowLoading] = useState(false);

	const shouldSearch = query.length >= minQueryLength;

	const searchQuery = useSearchQuery({
		query,
		enabled: shouldSearch,
	});

	const data = useMemo(() => {
		if (!shouldSearch) return null;
		return searchQuery.data;
	}, [searchQuery.data, shouldSearch]);

	useEffect(() => {
		if (searchQuery.isLoading && !searchQuery.data) {
			const timer = setTimeout(() => setShowLoading(true), 100);
			return () => clearTimeout(timer);
		} else {
			setShowLoading(false);
		}
	}, [searchQuery.isLoading, searchQuery.data]);

	const isLoading = shouldSearch ? showLoading : false;

	return {
		query,
		setQuery,
		data,
		isLoading,
		isFetching: searchQuery.isFetching,
		error: searchQuery.error,
		isSuccess: searchQuery.isSuccess,
		refetch: searchQuery.refetch,
		clearSearch: () => {
			setQuery("");
		},
	};
}
