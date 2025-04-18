import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { SearchResponse } from "@/types/search.types";

export function useSearch(query: string) {
	const [data, setData] = useState<SearchResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		if (!query) {
			setData(null);
			return;
		}

		const fetchSearch = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get<SearchResponse>(
					`/search/${query}`,
				);
				setData(response.data);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSearch();
	}, [query]);

	return { data, isLoading, error };
}
