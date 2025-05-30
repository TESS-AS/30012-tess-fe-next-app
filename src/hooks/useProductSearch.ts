import { useState, useCallback, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import { loadAttributes, ProductAttributeResponse } from '@/services/product.service';
import { SearchResponse } from '@/types/search.types';

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
	const [attributeResults, setAttributeResults] = useState<ProductAttributeResponse['results']>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	const fetchSearch = useCallback(async (searchQuery: string) => {
		if (!searchQuery) {
			setData(null);
			setAttributeResults([]);
			return;
		}

		try {
			setIsLoading(true);
			// 1) Fetch base search results
			const response = await axiosClient.get<SearchResponse>(
				`/search/${searchQuery}`,
			);
			const searchResults = response.data;
			setData(searchResults);

			// 2) If we have results, fetch their attributes
			if (searchResults?.productRes?.length > 0) {
				const productNumbers = searchResults.productRes.map((p) => p.productNumber);
				const attrResponse = await loadAttributes(searchQuery, productNumbers);
				setAttributeResults(attrResponse.results);
			} else {
				setAttributeResults([]);
			}
		} catch (err) {
			setError(err);
			setAttributeResults([]);
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
			setAttributeResults([]);
			return;
		}

		debouncedFetchSearch(query);

		return () => {
			// Cleanup any pending debounced calls when the component unmounts
			debouncedFetchSearch.cancel?.();
		};
	}, [query, debouncedFetchSearch]);

	return { data, attributeResults, isLoading, error };
}
