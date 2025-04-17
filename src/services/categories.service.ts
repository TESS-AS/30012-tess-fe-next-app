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

export async function loadFiltersBasedOnCategory(id: string) {
	try {
		const url = `/attributeFilter/${id}`;
		const response: AxiosResponse = await axiosInstance.get(url);
		return response.data;
	} catch (error) {
		console.error("Error loading filters", error);
		return [];
	}
}
