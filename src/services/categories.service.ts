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

export async function loadFiltersBasedOnCategory(
    categoryNumber: string,
    searchTerm: string | null = null
) {
	try {

		const params = new URLSearchParams();
        if (categoryNumber) {
            params.append('categoryNumber', categoryNumber);
        }
        if (searchTerm) {
            params.append('searchTerm', searchTerm);
        }

		const url = `/attributeFilter/${params.toString() ? `?${params.toString()}` : ''}`;
		const response = await axiosInstance.get(url);
		return response.data;
	} catch (error) {
		console.error("Error loading filters", error);
		return [];
	}
}
