import { IProduct } from "@/types/product.types";
import { PriceResponse } from "@/types/search.types";
import { AxiosResponse } from "axios";

import axiosInstance from "./axiosClient";

interface WarehouseBalance {
	warehouseNumber: string;
	warehouseName: string;
	balance: number;
	companyName: string;
	itemNumber: string;
	parentProdNumber?: string;
}

export interface WarehouseBatch {
	itemNumber: string;
	warehouses: Array<{
		warehouseNumber: string;
		warehouseName: string;
		balance: number;
		companyNumber: string;
	}>;
}

/** BE category-hit hint added in PBI2940 (2026-09-10, `2fa7e88` in the
 *  20002 search-engine repo). `flag: true` = category was pre-filtered/active
 *  for this search based on hits in its assortments; `false` = category has
 *  hits but isn't part of the currently-active set. */
export interface InferredCategory {
	categoryNumber: string;
	nameNo: string;
	nameEn: string;
	productCount: number;
	flag: boolean;
}

export interface SearchListResponse {
	product: IProduct[];
	page: number;
	totalPages: number;
	categories?: InferredCategory[];
}

interface FilterValues {
	key: string;
	values: string[];
}

export async function productFetch(productName: string) {
	try {
		const url = `/searchResult/${encodeURIComponent(productName)}`;
		const response = await axiosInstance.get(url);
		return response.data;
	} catch (error) {
		console.error("Error fetching product:", error);
		throw error;
	}
}

export async function loadCategories(query: string) {
	try {
		const url = `/searchCategory/${encodeURIComponent(query)}`;
		const response: AxiosResponse = await axiosInstance.get(url);
		return response.data;
	} catch (error) {
		console.error("Error loading categories", error);
		return [];
	}
}

export async function loadItem(query?: string, language?: string | null) {
	try {
		const params = new URLSearchParams();
		if (query) params.append("st", query);
		if (language) params.append("lang", language);
		const url = `/proxy/search${params.toString() ? `?${params.toString()}` : ""}`;

		const response: AxiosResponse = await axiosInstance.get(url);
		return response.data;
	} catch (error) {
		console.error("Error loading category, using mock data", error);
		return null;
	}
}

export async function getItemCompanyBalance(
	itemNumber: string,
	companyNumber: string = "01",
): Promise<WarehouseBalance[]> {
	try {
		const response = await axiosInstance.get(
			`/item/company/balance?itemNumber=${encodeURIComponent(itemNumber)}&companyNumber=${encodeURIComponent(companyNumber)}`,
		);
		return response.data.result;
	} catch (error) {
		console.error("Error fetching item company balance:", error);
		throw error;
	}
}

export async function getProductCompanyBalance(
	productNumber: string,
	companyNumber: string = "01",
): Promise<WarehouseBalance[]> {
	try {
		const response = await axiosInstance.get(
			`/product/company/balance?productNumber=${encodeURIComponent(productNumber)}&companyNumber=${encodeURIComponent(companyNumber)}`,
		);
		return response.data.result;
	} catch (error) {
		console.error("Error fetching product company balance:", error);
		throw error;
	}
}

export async function getItemWarehouseBalance(
	itemNumber: string,
	companyNumber: string,
): Promise<WarehouseBalance> {
	try {
		const response = await axiosInstance.get(
			`/item/company/balance?itemNumber=${encodeURIComponent(itemNumber)}&companyNumber=${encodeURIComponent(companyNumber)}`,
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching item warehouse balance:", error);
		throw error;
	}
}

export async function getProductWarehouseBalance(
	productNumber: string,
	companyNumber: string,
	warehouseNumber: string,
): Promise<WarehouseBalance[]> {
	try {
		const response = await axiosInstance.get(
			`/product/company/balance?productNumber=${encodeURIComponent(productNumber)}&companyNumber=${encodeURIComponent(companyNumber)}&warehouseNumber=${encodeURIComponent(warehouseNumber)}`,
		);
		return response.data.result;
	} catch (error) {
		console.error("Error fetching product warehouse balance:", error);
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
	customerNumber: string,
	companyNumber: string,
) {
	try {
		const response = await axiosInstance.post(
			`/item/price/${encodeURIComponent(customerNumber)}/${encodeURIComponent(companyNumber)}`,
			request,
		);
		return response.data;
	} catch (error) {
		console.error("Error calculating item price:", error);
		throw error;
	}
}

export async function getProductPrice(
	customerNumber: string,
	companyNumber: string,
	productNumber: string,
	warehouseNumber: string,
): Promise<PriceResponse[]> {
	try {
		const response = await axiosInstance.get(
			`/product/price/${encodeURIComponent(customerNumber)}/${encodeURIComponent(companyNumber)}/${encodeURIComponent(productNumber)}/${encodeURIComponent(warehouseNumber)}`,
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching product price:", error);
		throw error;
	}
}

export async function getProductVariations(productNumber: string) {
	try {
		const response = await axiosInstance.get(`/item/variants/${encodeURIComponent(productNumber)}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching product variations:", error);
		throw error;
	}
}

export async function searchProducts(
	page: number = 1,
	pageSize: number = 9,
	searchTerm: string | null,
	// BE (PBI2940) now accepts comma-separated `categoryNumber` — a string is
	// passed through unchanged, an array is joined so multi-category selections
	// work end-to-end.
	categoryNumber: string | string[] | null,
	filters: FilterValues[] | null,
	sort?: string | null,
	language?: string | null,
): Promise<SearchListResponse> {
	try {
		const params = new URLSearchParams();
		const catValue = Array.isArray(categoryNumber)
			? categoryNumber.filter(Boolean).join(",")
			: categoryNumber;
		if (catValue) {
			params.append("cat", catValue);
		}
		if (searchTerm) {
			params.append("st", searchTerm);
		}
		if (sort) {
			params.append("sort", sort === " " ? "" : sort);
		}
		if (language) {
			params.append("lang", language);
		}

		const url = `/proxy/searchList/${page}/${pageSize}${params.toString() ? `?${params.toString()}` : ""}`;
		const response =
			filters && filters.length > 0
				? await axiosInstance.post(url, filters)
				: await axiosInstance.post(url);

		return response.data;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
}

export async function loadItemBalanceBatch(
	itemNumbers: string[],
): Promise<WarehouseBatch[]> {
	try {
		const url = `/item/balance/batch`;
		const response = await axiosInstance.post(url, { itemNumbers });
		return response.data;
	} catch (error) {
		console.error("Error loading item balance batch:", error);
		return [];
	}
}
