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

export async function loadFiltersBasedOnCategory(
	categoryNumber: string | null,
	searchTerm: string | null = null,
) {
	try {
		console.time('filters-api-call');
		
		// Create cache key
		const cacheKey = `${categoryNumber}${searchTerm ? `-${searchTerm}` : ''}`;
		const now = Date.now();

		// Check cache
		if (
			filtersCache[cacheKey] &&
			now - filtersCache[cacheKey].timestamp < FILTERS_CACHE_TTL
		) {
			console.log('Using cached filters');
			console.timeEnd('filters-api-call');
			return filtersCache[cacheKey].data;
		}

		const params = new URLSearchParams();
		if (categoryNumber) {
			params.append("categoryNumber", categoryNumber);
		}
		if (searchTerm) {
			params.append("searchTerm", searchTerm);
		}

		const url = `/attributeFilter/${params.toString() ? `?${params.toString()}` : ""}`;
		const response = await axiosInstance.get(url);
		
		// Update cache
		filtersCache[cacheKey] = {
			data: response.data,
			timestamp: now,
		};

		console.timeEnd('filters-api-call');
		return response.data;
	} catch (error) {
		console.error("Error loading filters", error);
		return [];
	}
}
