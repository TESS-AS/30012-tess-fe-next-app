import { Order } from "@/types/orders.types";

import axiosInstance from "./axiosClient";

interface SalesOrderResponse {
	data?: string;
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
