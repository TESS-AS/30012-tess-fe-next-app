import { IProduct } from "@/types/product.types";
import axios, { AxiosResponse } from "axios";

import axiosInstance from "./axiosClient";

interface SearchListResponse {
	product: IProduct[];
	page: number;
	totalPages: number;
	filters?: FilterValues[];
}

interface FilterValues {
	key: string;
	values: string[];
}

const productsCache: {
	[key: string]: {
		data: any;
		timestamp: number;
	};
} = {};

const PRODUCTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function productFetch(productName: string) {
	try {
		const url = `/searchResult/${productName}`;
		const apires = await axiosInstance.get(url);

		return apires.data;
	} catch (error) {
		console.error("Error fetching product:", error);
		throw error;
	}
}

export async function loadCategories(query: string) {
	try {
		const url = `/searchCategory/${query}`;
		const response: AxiosResponse = await axiosInstance.get(url);
		return response.data;
	} catch (error) {
		console.error("Error loading categories", error);
		return [];
	}
}

export async function loadItem(query?: string) {
	try {
		const parsedQuery = query?.split(" ").join("%20");
		const url = `/search/${parsedQuery}`;

		const response: AxiosResponse = await axiosInstance.get(url);
		return response.data;
	} catch (error) {
		console.error("Error loading category, using mock data", error);
		return null;
	}
}

export async function searchProducts(
	page: number = 1,
	pageSize: number = 9,
	searchTerm: string | null,
	categoryNumber: string | null,
	filters: FilterValues[] | null,
	sort?: string | null,
): Promise<SearchListResponse> {
	try {
		console.time('product-api-call');

		// Create cache key
		const cacheKey = `${categoryNumber}-${page}-${pageSize}${searchTerm ? `-${searchTerm}` : ''}${
			filters ? `-${JSON.stringify(filters)}` : ''
		}${sort ? `-${sort}` : ''}`;
		const now = Date.now();

		// Check cache
		if (
			productsCache[cacheKey] &&
			now - productsCache[cacheKey].timestamp < PRODUCTS_CACHE_TTL
		) {
			return productsCache[cacheKey].data;
		}

		// Build query parameters
		const params = new URLSearchParams();
		if (categoryNumber) {
			params.append("categoryNumber", categoryNumber);
		}
		if (searchTerm) {
			params.append("searchTerm", searchTerm);
		}
		if (sort) {
			params.append("sort", sort === " " ? "" : sort);
		}

		// Construct URL with path parameters and query string
		const url = `/searchList/${page}/${pageSize}/${params.toString() ? `?${params.toString()}` : ""}`;
		console.log(url,"qokla url")
		// Make request with or without body based on filters
		const response =
			filters && filters.length > 0
				? await axiosInstance.post(url, { filters })
				: await axiosInstance.post(url);

		// Update cache
		productsCache[cacheKey] = {
			data: response.data,
			timestamp: now,
		};

		console.timeEnd('product-api-call');
		return response.data;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
}
