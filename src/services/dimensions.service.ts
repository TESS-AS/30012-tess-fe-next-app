import { CreateCustomerDimensions, CreateUserDimensions } from "@/types/dimensions.types";
import axiosInstance from "./axiosClient";

export async function createCustomerDimensions(payload: CreateCustomerDimensions): Promise<{ success: boolean, data: object }> {
    try {
        const response = await axiosInstance.post("/createCustomerDimension", payload);
        return response.data;
    } catch (error) {
        console.error("Error creating dimensions:", error);
        throw error;
    }
}

export async function createUserDimensions(payload: CreateUserDimensions): Promise<{ success: boolean, data: object }> {
    try {
        const response = await axiosInstance.post("/createUserDimension", payload);
        return response.data;
    } catch (error) {
        console.error("Error creating dimensions:", error);
        throw error;
    }
}

export const deleteCustomerDimensions = async (customerNumber: string): Promise<{ dimensionId: number, type: number }> => {
    try {
        const response = await axiosInstance.delete(`/deleteCustomerDimension/${customerNumber}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting dimensions:", error);
        throw error;
    }
}

export const getCustomerDimensions = async (customerNumber: string): Promise<{
    d1_id: number,
    d1_name: string,
    d2_id: number,
    d2_name: string,
    d3_id: number,
    d3_name: string
}[]> => {
    try {
        const response = await axiosInstance.get(`/getCustomerDimension/${customerNumber}`);
        return response.data;
    } catch (error) {
        console.error("Error getting dimensions:", error);
        throw error;
    }
}

export const getUserDimensions = async (userId: number, customerNumber: string): Promise<{
    userId: number,
    customerId: number,
    customerNumber: string,
    dimension1: {
      ids: number[],
      label: string,
      mode: boolean
    },
    dimension2: {
      ids: number[],
      label: string,
      mode: boolean
    },
    dimension3: {
      ids: number[],
      label: string,
      mode: boolean
    }
}> => {
    try {
        const response = await axiosInstance.get(`/getUserDimension/${userId}/${customerNumber}`);
        return response.data;
    } catch (error) {
        console.error("Error getting dimensions:", error);
        throw error;
    }
}

export const updateUserDimensions = async (userId: number, customerNumber: string, payload: {
    dimension_1_id: number[],
    dimension_2_id: number[],
    dimension_3_id: number[],
}): Promise<{ success: boolean, data: object }> => {
    try {
        const response = await axiosInstance.put(`/updateUserDimension/${userId}/${customerNumber}`, payload);
        return response.data;
    } catch (error) {
        console.error("Error updating dimensions:", error);
        throw error;
    }
}