import { AxiosResponse } from "axios";

import axiosInstance from "./axiosClient";

export async function productFetch(productName: string) {
	try {
		const editedProductName = productName.split(" ").join("%20");
		const url = `/searchResult/${editedProductName}`;
		const apires = await axiosInstance.get(url);
		console.log("api res searchResult: ", apires, "url: ", url);

		return apires.data;
	} catch (error) {
		console.error("Error fetching product:", error);
		return null;
	}
}

export async function loadSearchList(
	query: string,
	page: number,
	pageSize: number,
	categories?: string[],
) {
	try {
		const url = `/searchList/${query}/${page}/${pageSize}`;
		const response: AxiosResponse = await axiosInstance.post(url, categories);

		console.log("api res searchList: ", response.data);

		return response.data;
	} catch (error) {
		console.error("Error loading search list", error);
		return { items: [], total: 0 };
	}
}

export async function loadCategories(query: string) {
	try {
		const url = `/searchCategory/${query}`;
		const response: AxiosResponse = await axiosInstance.get(url);
		console.log(response.data);
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
		console.log("api res from search: ", response.data);
		return response.data;
	} catch (error) {
		console.error("Error loading category, using mock data", error);
		return null;
	}
}
