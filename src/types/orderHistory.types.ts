export type OrderStatus =
	| "Something Wrong"
	| "Written"
	| "Confirmed"
	| "Picked"
	| "Packed"
	| "Shipped"
	| "Invoiced";

export const mapLineStatusToOrderStatus = (status: number): OrderStatus => {
	switch (status) {
		case 0:
			return "Something Wrong";
		case 10:
			return "Written";
		case 20:
			return "Confirmed";
		case 30:
			return "Picked";
		case 40:
			return "Packed";
		case 45:
			return "Shipped";
		case 50:
		case 60:
			return "Invoiced";
		default:
			return "Something Wrong";
	}
};

export function getStatusBadgeProps(status: OrderStatus) {
	switch (status) {
		case "Invoiced":
			return {
				variant: "secondary" as const,
				className: "text-green-600 border-green-600 bg-green-100",
			};
		case "Packed":
			return {
				variant: "default" as const,
				className: "text-yellow-700 border-yellow-700 bg-yellow-100",
			};
		case "Shipped":
			return {
				variant: "default" as const,
				className: "text-indigo-700 border-indigo-700 bg-indigo-100",
			};
		case "Picked":
			return {
				variant: "default" as const,
				className: "text-purple-700 border-purple-700 bg-purple-100",
			};
		case "Confirmed":
			return {
				variant: "default" as const,
				className: "text-blue-700 border-blue-700 bg-blue-100",
			};
		case "Written":
			return {
				variant: "default" as const,
				className: "text-sky-700 border-sky-700 bg-sky-100",
			};
		case "Something Wrong":
			return {
				variant: "destructive" as const,
				className: "text-red-700 border-red-700 bg-red-100",
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
