import axiosInstance from "./axiosClient";
import { CreateCustomerDimensions, CreateUserDimensions, UserDimensionsResponse, CustomerDimension } from "@/types/dimensions.types";

export async function createCustomerDimensions(payload: CreateCustomerDimensions): Promise<{ success: boolean; data: object }> {
    try {
        const response = await axiosInstance.post("/createCustomerDimension", payload);
        return response.data;
    } catch (error) {
        console.error("Error creating customer dimensions:", error);
        throw error;
    }
}

export async function createUserDimensions(payload: CreateUserDimensions): Promise<{ success: boolean; data: object }> {
    try {
        const response = await axiosInstance.post("/createUserDimension", payload);
        return response.data;
    } catch (error) {
        console.error("Error creating user dimensions:", error);
        throw error;
    }
}

export const deleteCustomerDimensions = async (customerNumber: string): Promise<{ dimensionId: number; type: number }> => {
    try {
        const response = await axiosInstance.delete(`/deleteCustomerDimension/${customerNumber}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting customer dimensions:", error);
        throw error;
    }
};

export const getCustomerDimensions = async (customerNumber: string): Promise<CustomerDimension[]> => {
    try {
        const response = await axiosInstance.get(`/getCustomerDimension/${customerNumber}`);
        return response.data;
    } catch (error) {
        console.error("Error getting customer dimensions:", error);
        throw error;
    }
};

export const getUserDimensions = async (userId: number, customerNumber: string): Promise<UserDimensionsResponse> => {
    try {
        const response = await axiosInstance.get(`/getUserDimension/${userId}/${customerNumber}`);
        return response.data;
    } catch (error) {
        console.error("Error getting user dimensions:", error);
        throw error;
    }
};

export const updateUserDimensions = async (
    userId: number,
    customerNumber: string,
    payload: Partial<CreateUserDimensions>
): Promise<{ success: boolean; data: object }> => {
    try {
        const response = await axiosInstance.put(`/updateUserDimension/${userId}/${customerNumber}`, payload);
        return response.data;
    } catch (error) {
        console.error("Error updating user dimensions:", error);
        throw error;
    }
};
