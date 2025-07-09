import { Order } from "@/types/orders.types";

import axiosInstance from "./axiosClient";

interface SalesOrderResponse {
	data?: {
		message: string;
        data: {
            data: {
                resultCode: string;
                messages: string[];
            },
            status: number;
            statusText: string;
            message: string;
        }
	};
	confirmedOrder?: Order;
}

export async function salesOrder(payload: Order): Promise<SalesOrderResponse | string> {
	try {
		const response = await axiosInstance.post("/salesOrder", payload);
		return response.data;
	} catch (error) {
		console.error("Error fetching sales order:", error);
		throw error;
	}
}
