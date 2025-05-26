export type OrderStatus = "Completed" | "In Progress" | "Failed";

export const mapLineStatusToOrderStatus = (status: number): OrderStatus => {
	if (status >= 60) return "Completed";
	if (status >= 40 && status < 60) return "In Progress";
	return "Failed";
};

export function getStatusBadgeProps(status: OrderStatus) {
	switch (status) {
		case "Completed":
			return {
				variant: "secondary" as const,
				className: "text-green-700 border-green-700",
			};
		case "In Progress":
			return {
				variant: "default" as const,
				className: "text-blue-600 border-blue-600",
			};
		case "Failed":
			return {
				variant: "destructive" as const,
				className: "text-red-600 border-red-600",
			};
		default:
			return { variant: "outline" as const };
	}
}

export interface OrderItems {
	id: number;
	date: string;
	status: OrderStatus;
	total: number;
	items: OrderLine[];
}
export interface OrderLine {
	orderLineNumber: number;
	itemId: number;
	itemName: string;
	itemNumber: string;
	quantity: number;
	unit: string;
	netPrice: number;
	lineStatus: number;
	lineSum: number;
}

export interface OrderResponse {
	orderId: number;
	orderNumber: string;
	date: string;
	customerNumber: string;
	customerOrderRef: string;
	customerRef: string;
	companyNumber: number;
	companyName: string;
	warehouseId: string;
	warehouseNumber: string;
	warehouseName: string;
	sum: number;
	orderAmendedDate: string;
	orderLines: OrderLine[];
}
