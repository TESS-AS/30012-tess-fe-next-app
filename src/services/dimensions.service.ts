import {
	CreateCustomerDimensions,
	CreateUserDimensions,
	CustomerDimension,
	SearchDimensionResponse,
	UserDimensionItem,
} from "@/types/dimensions.types";

import axiosInstance from "./axiosClient";

export async function createCustomerDimensions(
	payload: CreateCustomerDimensions,
): Promise<{ success: boolean; data: object }> {
	try {
		const response = await axiosInstance.post(
			"/dimension/createCustomerDimension",
			payload,
		);
		return response.data;
	} catch (error) {
		console.error("Error creating customer dimensions:", error);
		throw error;
	}
}

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
): Promise<{ dimensionId: number; type: number }> => {
	try {
		const response = await axiosInstance.delete(
			`/dimension/deleteCustomerDimension/${customerNumber}`,
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
	userId: number,
	customerNumber: string,
	payload: Partial<CreateUserDimensions>,
): Promise<{ success: boolean; data: object }> => {
	try {
		const response = await axiosInstance.put(
			`/dimension/updateUserDimension/${userId}/${customerNumber}`,
			payload,
		);
		return response.data;
	} catch (error) {
		console.error("Error updating user dimensions:", error);
		throw error;
	}
};

export const searchDimensions = async (
	type: number,
	search: string,
): Promise<SearchDimensionResponse[]> => {
	try {
		const response = await axiosInstance.get(
			`/dimension/dimensionSearch/${type}/${search}`,
		);
		return response.data;
	} catch (error) {
		console.error("Error searching dimensions:", error);
		throw error;
	}
};
