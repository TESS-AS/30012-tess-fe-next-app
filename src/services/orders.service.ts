import {
	deriveOrderStatusFromOrderLines,
	OrderItems,
} from "@/types/orderHistory.types";
import {
	Order,
	OpenConfirmationsResponse,
	OpenOrderLineItemResponse,
	OpenOrderLinesDetailResponse,
	UserOrderResponse,
} from "@/types/orders.types";

import axiosInstance from "./axiosClient";

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

export interface ExcelOrderConfirmationCartPayload {
	salesOrderHeader: {
		warehouseCode: string;
	};
	salesOrderLines: Array<{
		itemCode: string;
		orderedQuantity: number;
		salesPrice: number;
	}>;
}

export async function excelOrderConfirmationForCart(
	payload: ExcelOrderConfirmationCartPayload,
): Promise<{ blob: Blob; filename: string }> {
	try {
		const response = await axiosInstance.post(
			"/excelOrderConfirmation",
			payload,
			{
				responseType: "blob",
			},
		);

		const contentDisposition = response.headers["content-disposition"];
		let filename = `order_confirmation_${new Date().getTime()}.xlsx`;

		if (contentDisposition) {
			const filenameMatch = contentDisposition.match(
				/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
			);
			if (filenameMatch && filenameMatch[1]) {
				filename = filenameMatch[1].replace(/['"]/g, "");
			}
		}

		return {
			blob: response.data,
			filename,
		};
	} catch (error) {
		console.error("Error fetching Excel order confirmation:", error);
		throw error;
	}
}

export async function excelOrderConfirmation(
	payload: Order,
): Promise<{ blob: Blob; filename: string }> {
	try {
		const response = await axiosInstance.post(
			"/excelOrderConfirmation",
			payload,
			{
				responseType: "blob",
			},
		);

		const contentDisposition = response.headers["content-disposition"];
		let filename = `order_confirmation_${new Date().getTime()}.xlsx`;

		if (contentDisposition) {
			const filenameMatch = contentDisposition.match(
				/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
			);
			if (filenameMatch && filenameMatch[1]) {
				filename = filenameMatch[1].replace(/['"]/g, "");
			}
		}

		return {
			blob: response.data,
			filename,
		};
	} catch (error) {
		console.error("Error fetching Excel order confirmation:", error);
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

interface SearchOrderHistoryApiItem {
	orderId: number;
	orderNumber: string;
	customerOrderRef?: string;
	date: string;
	sum: number;
	orderLines: Array<{
		orderLineNumber: number;
		itemId: number;
		itemName: string;
		itemNumber: string;
		quantity: number;
		unit: string;
		netPrice: number;
		lineStatus: number;
		lineSum: number;
	}>;
}

interface SearchOrderHistoryApiResponse {
	data: SearchOrderHistoryApiItem[];
	meta: {
		page: number;
		pageSize: number;
		totalPages: number;
		totalItems: number;
	};
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
	status?: number | number[],
): Promise<OrderHistoryResponse> {
	try {
		const params: Record<string, string | number | number[]> = {
			page,
			pageSize,
		};
		if (search.trim()) {
			params.search = search.trim();
		}
		const hasStatus =
			status !== undefined &&
			(!Array.isArray(status) || status.length > 0);
		if (hasStatus) {
			params.status = status;
		}

		const response = await axiosInstance.get<SearchOrderHistoryApiResponse>(
			`/searchOrderHistory/${customerNumber}`,
			{
				params,
				paramsSerializer: (queryParams) =>
					Object.entries(queryParams)
						.filter(([, value]) => value !== undefined && value !== null)
						.flatMap(([key, value]) =>
							Array.isArray(value)
								? value.map(
										(item) =>
											`${key}=${encodeURIComponent(String(item))}`,
									)
								: [`${key}=${encodeURIComponent(String(value))}`],
						)
						.join("&"),
			},
		);

		const mapped: OrderItems[] = response.data.data.map((order) => {
			return {
				order_id: order.orderId,
				orderNumber: order.orderNumber,
				customerOrderRef: order.customerOrderRef ?? "",
				date: order.date,
				status: deriveOrderStatusFromOrderLines(order.orderLines),
				total: order.sum,
				items: order.orderLines,
			};
		});

		return {
			data: mapped,
			meta: response.data.meta,
		};
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

export async function getOpenConfirmations(
	page: number = 1,
	limit: number = 25,
): Promise<OpenConfirmationsResponse> {
	try {
		const response = await axiosInstance.get<OpenConfirmationsResponse>(
			"/edi/order/openOrders",
			{ params: { page, limit } },
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching open confirmations:", error);
		throw error;
	}
}

/** Single order lines with mismatches for the Avvikende ordre detail view. Returns lines plus optional supplier/date from API. */
export async function getOpenOrderLines(orderNumber: string): Promise<{
	lines: OpenOrderLineItemResponse[];
	supplier?: string;
	date?: string;
}> {
	try {
		const response = await axiosInstance.get<
			| OpenOrderLineItemResponse[]
			| OpenOrderLineItemResponse
			| OpenOrderLinesDetailResponse
		>(`/edi/order/openOrders/lines/${encodeURIComponent(orderNumber)}`);
		const data = response.data;

		if (Array.isArray(data)) {
			return { lines: data };
		}
		if (
			data &&
			typeof data === "object" &&
			"lines" in data &&
			Array.isArray(data.lines)
		) {
			return {
				lines: data.lines,
				supplier: data.supplier,
				date: data.date ?? data.orderDate,
			};
		}
		if (data && typeof data === "object" && "dbOrderLine" in data) {
			const single = data as OpenOrderLineItemResponse & {
				supplier?: string;
				date?: string;
				orderDate?: string;
			};
			return {
				lines: [single],
				supplier: single.supplier,
				date: single.date ?? single.orderDate,
			};
		}
		return { lines: [] };
	} catch (error) {
		console.error("Error fetching open order lines:", error);
		throw error;
	}
}

export async function updateOpenOrderStatus(
	orderNumber: string,
	approve: boolean,
): Promise<void> {
	try {
		await axiosInstance.patch(
			`/edi/order/openOrders/status/${encodeURIComponent(orderNumber)}`,
			{ approve },
		);
	} catch (error) {
		console.error("Error updating open order status:", error);
		throw error;
	}
}
