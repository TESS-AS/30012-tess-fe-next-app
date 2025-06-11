import axiosInstance from "./axiosClient";
import { CreateCustomerDimensions, CreateUserDimensions, UserDimensionsResponse, CustomerDimension } from "@/types/dimensions.types";

type DimensionItem = {
    d1_id: number;
    d1_name: string;
    d2_id: number | null;
    d2_name: string | null;
    d3_id: number | null;
    d3_name: string | null;
};

export function formatDimensionsToHierarchy(dimensions: DimensionItem[]): Array<{ label: string; value: string }> {
    return dimensions.flatMap(dim => {
        const results = [{ label: dim.d1_name, value: dim.d1_name }];
        
        if (dim.d2_name) {
            results.push({ 
                label: `${dim.d1_name}<${dim.d2_name}`, 
                value: `${dim.d1_name}<${dim.d2_name}` 
            });
        }
        
        if (dim.d3_name) {
            results.push({ 
                label: `${dim.d1_name}<${dim.d2_name}<${dim.d3_name}`, 
                value: `${dim.d1_name}<${dim.d2_name}<${dim.d3_name}` 
            });
        }
        
        return results;
    });
}

export async function createCustomerDimensions(payload: CreateCustomerDimensions): Promise<{ success: boolean; data: object }> {
    try {
        const response = await axiosInstance.post("/dimension/createCustomerDimension", payload);
        return response.data;
    } catch (error) {
        console.error("Error creating customer dimensions:", error);
        throw error;
    }
}

export async function createUserDimensions(payload: CreateUserDimensions): Promise<{ success: boolean; data: object }> {
    try {
        const response = await axiosInstance.post("/dimension/createUserDimension", payload);
        return response.data;
    } catch (error) {
        console.error("Error creating user dimensions:", error);
        throw error;
    }
}

export const deleteCustomerDimensions = async (customerNumber: string): Promise<{ dimensionId: number; type: number }> => {
    try {
        const response = await axiosInstance.delete(`/dimension/deleteCustomerDimension/${customerNumber}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting customer dimensions:", error);
        throw error;
    }
};

export const getCustomerDimensions = async (customerNumber: string): Promise<CustomerDimension[]> => {
    try {
        const response = await axiosInstance.get(`/dimension/getCustomerDimension/${customerNumber}`);
        return response.data;
    } catch (error) {
        console.error("Error getting customer dimensions:", error);
        throw error;
    }
};

export const getUserDimensions = async (customerNumber: string): Promise<UserDimensionsResponse[]> => {
    try {
        const response = await axiosInstance.get(`/dimension/getUserDimension/${customerNumber}`);
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
        const response = await axiosInstance.put(`/dimension/updateUserDimension/${userId}/${customerNumber}`, payload);
        return response.data;
    } catch (error) {
        console.error("Error updating user dimensions:", error);
        throw error;
    }
};
