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
		const params = new URLSearchParams();
		if (categoryNumber) params.append("categoryNumber", categoryNumber);
		if (searchTerm) params.append("searchTerm", searchTerm);
		if (language) params.append("language", language);

		const url = `/attributeFilter/${params.toString() ? `?${params.toString()}` : ""}`;
		const response = await axiosInstance.get(url);

		return response.data;
	} catch (error) {
		console.error("Error loading filters", error);
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
	if (params.categoryNumber)
		query.append("categoryNumber", params.categoryNumber);
	if (params.searchTerm) query.append("searchTerm", params.searchTerm);
	if (params.language) query.append("language", params.language);

	const url = `/filterFamily${query.toString() ? `?${query.toString()}` : ""}`;
	const response = await axiosInstance.post(url, {
		filters: params.filters ?? [],
	});

	return response.data;
}



export async function loadCategoryTree(productNumber: string) {
	try {
		const url = `/categoryTree/${productNumber}`;
		const response: AxiosResponse = await axiosInstance.get(url);
		return response.data;
	} catch (error) {
		console.error("Error loading category tree", error);
		return [];
	}
}
