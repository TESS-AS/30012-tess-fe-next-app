import { IProduct } from "@/types/product.types";
import axios, { AxiosResponse } from "axios";

import axiosInstance from "./axiosClient";
import { PriceResponse } from "@/types/search.types";

interface WarehouseBalance {
  warehouseNumber: string;
  warehouseName: string;
  balance: number;
  companyName: string;
  itemNumber: string;
  parentProdNumber?: string;
}

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

export async function getItemCompanyBalance(itemNumber: string, companyNumber: string = '01'): Promise<WarehouseBalance[]> {
  try {
    const response = await axiosInstance.get(`/item/company/balance?itemNumber=${itemNumber}&companyNumber=${companyNumber}`);
    return response.data.result;
  } catch (error) {
    console.error('Error fetching item company balance:', error);
    throw error;
  }
}

export async function getProductCompanyBalance(productNumber: string, companyNumber: string = '01'): Promise<WarehouseBalance[]> {
  try {
    const response = await axiosInstance.get(`/product/company/balance?productNumber=${productNumber}&companyNumber=${companyNumber}`);
    return response.data.result;
  } catch (error) {
    console.error('Error fetching product company balance:', error);
    throw error;
  }
}

export async function getItemWarehouseBalance(
  itemNumber: string,
  companyNumber: string = '01',
): Promise<WarehouseBalance> {
  try {
    const response = await axiosInstance.get(
      `/item/company/balance?itemNumber=${itemNumber}&companyNumber=${companyNumber}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching item warehouse balance:', error);
    throw error;
  }
}

export async function getProductWarehouseBalance(
  productNumber: string,
  companyNumber: string = '01',
  warehouseNumber: string = 'L01'
): Promise<WarehouseBalance[]> {
  try {
    const response = await axiosInstance.get(
      `/product/company/balance?productNumber=${productNumber}&companyNumber=${companyNumber}&warehouseNumber=${warehouseNumber}`
    );
    return response.data.result;
  } catch (error) {
    console.error('Error fetching product warehouse balance:', error);
    throw error;
  }
}

interface PriceRequest {
  itemNumber: string;
  quantity: number;
  warehouseNumber: string;
}

export async function calculateItemPrice(
  request: PriceRequest[],
  customerNumber: string = '169999',
  companyNumber: string = '01',
) {
  try {
    const response = await axiosInstance.post(
      `/item/price/${customerNumber}/${companyNumber}`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('Error calculating item price:', error);
    throw error;
  }
}

export async function getProductPrice(customerNumber: string = '169999', companyNumber: string = '01', productNumber: string, warehouseNumber: string = 'L01'): Promise<PriceResponse[]> {
	try {
		const response = await axiosInstance.get(`/product/price/${customerNumber}/${companyNumber}/${productNumber}/${warehouseNumber}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching product price:', error);
		throw error;
	}
}

export async function getProductVariations(
	productNumber: string, 
	warehouseNumber: string = 'L01', 
	companyNumber: string = '01'
) {
	try {
		const response = await axiosInstance.get(`/item/variants/${productNumber}/${warehouseNumber}/${companyNumber}`);
		return response.data;

	} catch (error) {
		console.error('Error fetching product variations:', error);
		throw error;
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
		// Create cache key
		const cacheKey = `${categoryNumber}-${page}-${pageSize}${searchTerm ? `-${searchTerm}` : ""}${
			filters ? `-${JSON.stringify(filters)}` : ""
		}${sort ? `-${sort}` : ""}`;
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

		return response.data;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
}
