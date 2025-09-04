import { GetAssetsResponse, S1Codes } from "@/types/assets.types";

import axiosClient from "./axiosClient";

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
	};
}

export const getAssets = async (
	customerNumber?: string,
	s1Code?: string,
	page: number = 1,
	pageSize: number = 10,
): Promise<PaginatedResponse<GetAssetsResponse>> => {
	try {
		const params = new URLSearchParams();
		if (customerNumber) params.append("customerNumber", customerNumber);
		if (s1Code) params.append("s1Code", s1Code);
		params.append("page", page.toString());
		params.append("pageSize", pageSize.toString());

		const response = await axiosClient.get(
			`/asset/getHose?${params.toString()}`,
		);
		return response.data;
	} catch (error) {
		console.log(error);
		return {
			data: [],
			meta: {
				page: 1,
				pageSize: 10,
				totalItems: 0,
				totalPages: 0,
			},
		};
	}
};

export const getS1Codes = async (): Promise<S1Codes[]> => {
	try {
		const response = await axiosClient.get(`/asset/getS1`);
		return response.data;
	} catch (error) {
		console.log(error);
		return [];
	}
};
