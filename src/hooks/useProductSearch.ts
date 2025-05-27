import { useEffect, useState, useCallback } from "react";

import axiosClient from "@/services/axiosClient";
import { SearchResponse } from "@/types/search.types";

type DebouncedFunction<T extends (...args: any[]) => any> = {
	(...args: Parameters<T>): void;
	cancel: () => void;
}

function debounce<T extends (...args: any[]) => any>(func: T, delay: number): DebouncedFunction<T> {
	let timeoutId: NodeJS.Timeout;

	const debouncedFn = function (...args: Parameters<T>) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			func(...args);
		}, delay);
	} as DebouncedFunction<T>;

	debouncedFn.cancel = () => {
		clearTimeout(timeoutId);
	};

	return debouncedFn;
}

export function useSearch(query: string) {
	const [data, setData] = useState<SearchResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	const fetchSearch = useCallback(async (searchQuery: string) => {
		if (!searchQuery) {
			setData(null);
			return;
		}

		try {
			setIsLoading(true);
			const response = await axiosClient.get<SearchResponse>(
				`/search/${searchQuery}`,
			);
			setData(response.data);
		} catch (err) {
			setError(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const debouncedFetchSearch = useCallback(
		debounce((searchQuery: string) => fetchSearch(searchQuery), 100),
		[fetchSearch]
	);

	useEffect(() => {
		if (!query) {
			setData(null);
			return;
		}

		debouncedFetchSearch(query);

		return () => {
			// Cleanup any pending debounced calls when the component unmounts
			debouncedFetchSearch.cancel?.();
		};
	}, [query, debouncedFetchSearch]);

	return { data, isLoading, error };
}
