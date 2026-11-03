import { useEffect, useState } from "react";

import {
	searchTessEmployees,
	type TessEmployee,
} from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export function useSearchTessEmployees(
	searchTerm: string,
	limit: number = 25,
	debounceMs: number = 250,
) {
	const [debounced, setDebounced] = useState(searchTerm);

	useEffect(() => {
		const id = setTimeout(() => setDebounced(searchTerm), debounceMs);
		return () => clearTimeout(id);
	}, [searchTerm, debounceMs]);

	const trimmed = debounced.trim();

	const query = useQuery<TessEmployee[]>({
		queryKey: ["tessEmployees", trimmed, limit],
		queryFn: () => searchTessEmployees(trimmed, limit),
		enabled: trimmed.length > 0,
		staleTime: 30 * 1000,
	});

	return {
		results: query.data ?? [],
		isLoading: query.isLoading && trimmed.length > 0,
		isFetching: query.isFetching && trimmed.length > 0,
		error: query.error,
	};
}
