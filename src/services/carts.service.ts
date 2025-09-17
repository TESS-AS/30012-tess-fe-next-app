import {
	ArchiveCartResponse,
	CartLine,
	CartResponse,
	CartKitResponse,
	WarehouseBatch,
} from "@/types/carts.types";
import { AxiosResponse } from "axios";

import axiosClient from "./axiosClient";

export async function getCart(): Promise<CartKitResponse> {
	try {
		const url = `/cart`;
		const response: AxiosResponse<CartKitResponse> = await axiosClient.get(url);
		return response.data;
	} catch (error) {
		console.error("Error loading cart", error);
		return {
			cartKit: [],
			cart: [],
		};
	}
}

export async function addToCart(cartLine: CartLine): Promise<CartResponse> {
	try {
		const url = `/cart/addLine`;
		const response: AxiosResponse<CartResponse> = await axiosClient.post(
			url,
			cartLine,
		);
		return response.data;
	} catch (error) {
		console.error("Error adding to cart", error);
		return {
			message: "Error adding to cart",
			data: [],
		};
	}
}

export async function removeFromCart(
	id: number | string,
): Promise<CartResponse> {
	try {
		const url = typeof id === 'string' ? `/cart/cartKit/${id}` : `/cart/deleteLine/${id}`;
		const response: AxiosResponse<CartResponse> = await axiosClient.delete(url);
		return response.data;
	} catch (error) {
		console.error("Error removing from cart", error);
		return {
			message: "Error removing from cart",
			data: [],
		};
	}
}

export async function updateCart(
	cartLineId: number,
	payload: { itemNumber: string; quantity?: number; warehouseNumber?: string },
): Promise<CartLine[]> {
	try {
		const url = `/cart/updateLine/${cartLineId}`;
		const response: AxiosResponse<CartLine[]> = await axiosClient.patch(
			url,
			payload,
		);
		return response.data;
	} catch (error) {
		console.error("Error updating cart", error);
		return [];
	}
}

export async function archiveCart(): Promise<{ message: string }> {
	try {
		const url = `/cart/archiveCart/`;
		const response: AxiosResponse<{ message: string }> =
			await axiosClient.post(url);
		return response.data;
	} catch (error) {
		console.error("Error archiving cart", error);
		return { message: "Error archiving cart" };
	}
}

export async function getArchiveCart(
	page: number = 1,
	pageSize: number = 9,
	order: string = "desc",
): Promise<ArchiveCartResponse> {
	try {
		const params = new URLSearchParams();
		params.append("page", page.toString());
		params.append("pageSize", pageSize.toString());
		params.append("order", order);

		const url = `/cart/archiveCart/${params.toString() ? `?${params.toString()}` : ""}`;

		const response: AxiosResponse<ArchiveCartResponse> =
			await axiosClient.get(url);
		return response.data;
	} catch (error) {
		console.error("Error getting archive cart", error);
		return {
			currentPage: 0,
			totalPages: 0,
			data: [],
		};
	}
}

export async function updateWarehouseForCart({
	warehouseNumber,
	companyNumber,
	cartLines,
}: {
	warehouseNumber: string;
	companyNumber: string;
	cartLines: number[];
}): Promise<{ message: string }> {
	try {
		const url = `/cart/updateWarehouse`;
		const response: AxiosResponse<{ message: string }> = await axiosClient.put(
			url,
			{
				warehouseNumber,
				companyNumber,
				cartLines,
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error updating warehouse", error);
		return { message: "Error updating warehouse" };
	}
}

export async function getItemBalanceArray(
	itemNumber: string[],
	warehouseNumber: string[],
	companyNumber: string,
): Promise<WarehouseBatch[]> {
	try {
		const url = `/item/balance/array`;
		const response = await axiosClient.post(url, {
			itemNumber,
			warehouseNumber,
			companyNumber,
		});
		return response.data;
	} catch (error) {
		console.error("Error getting item balance array", error);
		return [];
	}
}

interface CartKitItem {
	hexagonId: number;
	quantity: number;
	warehouseNumber: string;
	companyNumber: string;
}

export async function postCartKit(items: CartKitItem[]): Promise<CartLine[]> {
	try {
		const url = `/cart/cartKit`;
		const response: AxiosResponse<CartLine[]> = await axiosClient.post(
			url,
			items,
		);
		return response.data;
	} catch (error) {
		console.error("Error loading cart kit", error);
		return [];
	}
}
