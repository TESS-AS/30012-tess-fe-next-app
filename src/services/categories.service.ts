import { AxiosResponse } from "axios";

import axiosInstance from "./axiosClient";

const filtersCache: {
	[key: string]: {
		data: any;
		timestamp: number;
	};
} = {};

const FILTERS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function loadCategories(locale: string) {
	try {
		const url = `/categories/${locale}`;
		const response: AxiosResponse = await axiosInstance.get(url);
		return response.data;
	} catch (error) {
		console.error("Error loading categories", error);
		return [];
	}
}

export async function loadFilters({
	categoryNumber,
	searchTerm,
	language,
}: {
	categoryNumber?: string | null;
	searchTerm?: string | null;
	language?: string | null;
}) {
	try {
		// Create cache key
		const cacheKey = `${categoryNumber || "none"}-${searchTerm || "none"}-${language || "none"}`;
		const now = Date.now();

		if (
			filtersCache[cacheKey] &&
			now - filtersCache[cacheKey].timestamp < FILTERS_CACHE_TTL
		) {
			return filtersCache[cacheKey].data;
		}

		const params = new URLSearchParams();
		if (categoryNumber) params.append("categoryNumber", categoryNumber);
		if (searchTerm) params.append("searchTerm", searchTerm);
		if (language) params.append("language", language);

		const url = `/attributeFilter/${params.toString() ? `?${params.toString()}` : ""}`;
		const response = await axiosInstance.get(url);
		console.log(response,"response")

		filtersCache[cacheKey] = {
			data: response.data,
			timestamp: now,
		};

		return response.data;
	} catch (error) {
		console.error("Error loading filters", error);
		return [];
	}
}

interface ProductAttributeResponse {
	results: Array<{
		productNumber: string;
		matchedAttributes: string[];
	}>;
}

export async function loadAttributes(query: string, productNumbers: string[]): Promise<ProductAttributeResponse> {
	try {
		const url = `/search/highlight/product?query=${encodeURIComponent(query)}&productNumbers=${encodeURIComponent(productNumbers.join(';'))}`;
		const response = await axiosInstance.get<ProductAttributeResponse>(url);
		return response.data;
	} catch (error) {
		console.error('Error loading product attributes:', error);
		return { results: [] };
	}
}
