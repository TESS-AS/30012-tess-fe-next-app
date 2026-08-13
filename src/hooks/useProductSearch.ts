import { useState, useCallback, useEffect } from "react";

import axiosClient from "@/services/axiosClient";
import { SearchResponse } from "@/types/search.types";

type DebouncedFunction<T extends (...args: any[]) => any> = {
	(...args: Parameters<T>): void;
	cancel: () => void;
};

function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number,
): DebouncedFunction<T> {
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
			const searchResults = response.data;
			setData(searchResults);
		} catch (err) {
			setError(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!query) {
			setData(null);
			return;
		}

		fetchSearch(query);
	}, [query, fetchSearch]);

	return { data, isLoading, error };
}
