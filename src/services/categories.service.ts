import { FilterValues } from "@/types/filter.types";
import { AxiosResponse } from "axios";

import axiosInstance from "./axiosClient";

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

export async function loadFilterFamily(params: {
	categoryNumber?: string | null;
	searchTerm?: string | null;
	language?: string | null;
	filters?: FilterValues[];
}): Promise<any> {
	const query = new URLSearchParams();
	if (params.categoryNumber) query.append("cat", params.categoryNumber);
	if (params.searchTerm) query.append("st", params.searchTerm);
	if (params.language) query.append("lang", params.language);

	const url = `/proxy/filter${query.toString() ? `?${query.toString()}` : ""}`;
	const response = await axiosInstance.post(url, params.filters ?? []);

	return response.data;
}



export async function loadCategoryTree(productNumber: string) {
	try {
		const url = `/categoryTree/${encodeURIComponent(productNumber)}`;
		const response: AxiosResponse = await axiosInstance.get(url);
		return response.data;
	} catch (error) {
		console.error("Error loading category tree", error);
		return [];
	}
}
