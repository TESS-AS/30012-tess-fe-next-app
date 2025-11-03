import { Order, OrderLines, UserOrderResponse } from "@/types/orders.types";

import axiosInstance from "./axiosClient";
import { OrderItems } from "@/types/orderHistory.types";

interface SalesOrderResponse {
	data?: any; //TODO: Add response type
	order?: Order;
}

interface PostalCodeResponse {
	postal_code: string;
	city: string;
	municipalityId: string;
	municipality: string;
	county: string;
	po_box: boolean;
	latitude: string;
	longitude: string;
	street_address_latitude: string;
	street_address_longitude: string;
	postal_code_type: string;
}

export async function salesOrder(
	payload: Order,
): Promise<SalesOrderResponse | string> {
	try {
		const response = await axiosInstance.post("/salesOrder", payload);
		return response.data;
	} catch (error) {
		console.error("Error fetching sales order:", error);
		throw error;
	}
}

export async function getPostalCode(
	postalCode: string,
): Promise<PostalCodeResponse[]> {
	try {
		const response = await axiosInstance.get("/address/lookup/postalCode", {
			params: {
				postalCode,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching postal code:", error);
		throw error;
	}
}

export interface OrderHistoryResponse {
	data: OrderItems[];
	meta: {
		page: number;
		pageSize: number;
		totalPages: number;
		totalItems: number;
	};
}

export async function getOrderHistory(
	customerNumber: string,
	search: string,
	page: number,
	pageSize: number,
): Promise<OrderHistoryResponse> {
	try {
		const params: Record<string, any> = {
			page,
			pageSize,
		};

		if (search && search.trim()) {
			params.search = search;
		}

		const response = await axiosInstance.get(
			`/searchOrderHistory/${customerNumber}`,
			{
				params,
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching order history:", error);
		throw error;
	}
}

export async function getUserOrders(
	page: number,
	pageSize: number,
): Promise<UserOrderResponse[]> {
	try {
		const params: Record<string, any> = {
			page,
			pageSize,
		};
		const response = await axiosInstance.get("/userOrder", { params });
		return response.data;
	} catch (error) {
		console.error("Error fetching user orders:", error);
		throw error;
	}
}
