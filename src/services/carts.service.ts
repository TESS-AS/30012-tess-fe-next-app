import { ArchiveCart, ArchiveCartResponse, CartLine, CartResponse } from "@/types/carts.types";
import axiosInstance from "./axiosClient";
import { AxiosResponse } from "axios";

export async function getCart(): Promise<CartLine[]> {
    try {
        const url = `/cart`;
        const response: AxiosResponse<CartLine[]> = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error("Error loading cart", error);
        return [];
    }
}

export async function addToCart(cartLine: CartLine): Promise<CartResponse> {
    try {
        const url = `/cart/addLine`;
        const response: AxiosResponse<CartResponse> = await axiosInstance.post(url, cartLine);
        return response.data;
    } catch (error) {
        console.error("Error adding to cart", error);
        return {
            message: "Error adding to cart",
            data: []
        };
    }
}

export async function removeFromCart(cartLineId: number): Promise<CartResponse> {
    try {
        const url = `/cart/deleteLine/${cartLineId}`;
        const response: AxiosResponse<CartResponse> = await axiosInstance.delete(url);
        return response.data;
    } catch (error) {
        console.error("Error removing from cart", error);
        return {
            message: "Error removing from cart",
            data: []
        };
    }
}

export async function updateCart(cartLineId: number, payload: { itemNumber: string; quantity: number }): Promise<CartLine[]> {
    try {
        const url = `/cart/updateLine/${cartLineId}`;
        const response: AxiosResponse<CartLine[]> = await axiosInstance.patch(url, payload);
        return response.data;
    } catch (error) {
        console.error("Error updating cart", error);
        return [];
    }
}

export async function archiveCart(payload: ArchiveCart[]): Promise<{ message: string }> {
    try {
        const url = `/cart/archiveCart/`;
        const response: AxiosResponse<{ message: string }> = await axiosInstance.post(url, payload);
        return response.data;
    } catch (error) {
        console.error("Error archiving cart", error);
        return { message: "Error archiving cart" };
    }
}
    
export async function getArchiveCart(page: number = 1, pageSize: number = 9, order: string = "desc"): Promise<ArchiveCartResponse> {
    try {

        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("pageSize", pageSize.toString());
        params.append("order", order);

        const url = `/cart/archiveCart/${params.toString() ? `?${params.toString()}` : ""}`;
        
        const response: AxiosResponse<ArchiveCartResponse> = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error("Error getting archive cart", error);
        return {
            currentPage: 0,
            totalPages: 0,
            data: []
        };
    }
}
    