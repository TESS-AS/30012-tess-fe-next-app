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
	ageRange?: string,
): Promise<PaginatedResponse<GetAssetsResponse>> => {
	try {
		const params = new URLSearchParams();
		if (customerNumber) params.append("customerNumber", customerNumber);
		if (s1Code) params.append("s1Code", s1Code);
		params.append("page", page.toString());
		params.append("pageSize", pageSize.toString());
		params.append("ageRange", ageRange || "");

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

interface S1CodesResponse {
	data: S1Codes[];
	meta: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}

export const getS1Codes = async (
	page: number = 1,
	pageSize: number = 100,
): Promise<S1CodesResponse> => {
	try {
		const response = await axiosClient.get(
			`/asset/getS1?page=${page}&pageSize=${pageSize}`,
		);
		return (
			response.data || {
				data: [],
				meta: { page: 1, pageSize, total: 0, totalPages: 0 },
			}
		);
	} catch (error) {
		console.log(error);
		return { data: [], meta: { page: 1, pageSize, total: 0, totalPages: 0 } };
	}
};
