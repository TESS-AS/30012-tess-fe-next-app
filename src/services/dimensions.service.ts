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