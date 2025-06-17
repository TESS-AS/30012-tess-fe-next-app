import { Order } from "@/types/orders.types";

import axiosInstance from "./axiosClient";

export async function salesOrder(payload: Order): Promise<string> {
	try {
		const response = await axiosInstance.post("/salesOrder", payload);
		return response.data;
	} catch (error) {
		console.error("Error fetching sales order:", error);
		throw error;
	}
}
