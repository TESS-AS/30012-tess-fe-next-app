import {
	CreateCustomerDimensions,
	CustomerDimension,
	SearchDimensionResponse,
	UserDimensionItem,
	DimensionLabel,
	CreateUserDimensions,
} from "@/types/dimensions.types";

import axiosInstance from "./axiosClient";

export async function createDimension(
	payload: CreateCustomerDimensions,
): Promise<{ success: boolean; data: object }> {
	try {
		const response = await axiosInstance.post(
			`/dimension/createDimension`,
			payload,
		);
		return response.data;
	} catch (error) {
		console.error("Error creating customer dimensions:", error);
		throw error;
	}
}

export const updateDimension = async (payload: {
	oldDimensionName: string;
	dimensionType: string;
	dimensionName: string;
	budget: number;
	customerNumber: string;
}): Promise<{ success: boolean; data: object }> => {
	try {
		const response = await axiosInstance.put(
			"/dimension/updateDimension",
			payload,
		);
		return response.data;
	} catch (error) {
		console.error("Error updating dimension:", error);
		throw error;
	}
};

export async function createUserDimensions(
	payload: CreateUserDimensions,
): Promise<{ success: boolean; data: object }> {
	try {
		const response = await axiosInstance.post(
			"/dimension/createUserDimension",
			payload,
		);
		return response.data;
	} catch (error) {
		console.error("Error creating user dimensions:", error);
		throw error;
	}
}

export const deleteCustomerDimensions = async (
	customerNumber: string,
	dimensionId: string,
	type: string,
): Promise<{ message: string }> => {
	try {
		const response = await axiosInstance.delete(
			`/dimension/deleteCustomerDimension/${customerNumber}`,
			{
				data: {
					dimensionId,
					type: Number(type),
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error deleting customer dimensions:", error);
		throw error;
	}
};

export const getCustomerDimensions = async (
	customerNumber: string,
): Promise<CustomerDimension[]> => {
	try {
		const response = await axiosInstance.get(
			`/dimension/getCustomerDimension/${customerNumber}`,
		);
		return response.data;
	} catch (error) {
		console.error("Error getting customer dimensions:", error);
		throw error;
	}
};

export const getUserDimensions = async (
	customerNumber?: string,
): Promise<UserDimensionItem[]> => {
	try {
		const response = await axiosInstance.get(
			`/dimension/getUserDimension${customerNumber ? `?customerNumber=${customerNumber}` : ""}`,
		);
		return response.data;
	} catch (error) {
		console.error("Error getting user dimensions:", error);
		throw error;
	}
};

export const updateUserDimensions = async (
	customerNumber: string,
	dimensionLabels: DimensionLabel,
): Promise<{ success: boolean; data: object }> => {
	try {
		const response = await axiosInstance.put(
			`/dimension/updateUserDimension/${customerNumber}`,
			dimensionLabels,
		);
		return response.data;
	} catch (error) {
		console.error("Error updating user dimensions:", error);
		throw error;
	}
};

export const searchDimensions = async (
	dimType: number,
	searchTerm?: string,
	parentId?: string,
): Promise<SearchDimensionResponse[]> => {
	try {
		const params = {
			dimType,
			searchTerm,
			parentId,
		};

		const response = await axiosInstance.get("/dimension/dimensionSearch", {
			params,
			paramsSerializer: (params) => {
				return Object.entries(params)
					.filter(([_, value]) => value !== undefined)
					.map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
					.join("&");
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error searching dimensions:", error);
		throw error;
	}
};
