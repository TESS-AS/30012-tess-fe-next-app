export type OrderStatus =
	| "Kansellert"
	| "Mottatt"
	| "Bekreftet"
	| "Plukket"
	| "Pakket"
	| "Under transport"
	| "Levert";

export const mapLineStatusToOrderStatus = (status: number): OrderStatus => {
	switch (status) {
		case 0:
			return "Kansellert";
		case 10:
			return "Mottatt";
		case 20:
			return "Bekreftet";
		case 30:
			return "Plukket";
		case 40:
			return "Pakket";
		case 45:
			return "Under transport";
		case 50:
		case 60:
			return "Levert";
		default:
			return "Kansellert";
	}
};

export function getStatusBadgeProps(status: OrderStatus) {
	switch (status) {
		case "Levert":
			return {
				variant: "secondary" as const,
				className: "text-green-600 border-green-600 bg-green-100",
			};
		case "Pakket":
			return {
				variant: "default" as const,
				className: "text-yellow-700 border-yellow-700 bg-yellow-100",
			};
		case "Under transport":
			return {
				variant: "default" as const,
				className: "text-indigo-700 border-indigo-700 bg-indigo-100",
			};
		case "Plukket":
			return {
				variant: "default" as const,
				className: "text-purple-700 border-purple-700 bg-purple-100",
			};
		case "Bekreftet":
			return {
				variant: "default" as const,
				className: "text-blue-700 border-blue-700 bg-blue-100",
			};
		case "Mottatt":
			return {
				variant: "default" as const,
				className: "text-green-700 border-green-700 bg-green-100",
			};
		case "Kansellert":
			return {
				variant: "destructive" as const,
				className: "text-red-700 border-red-700 bg-red-100",
			};
		default:
			return {
				variant: "default" as const,
				className: "text-gray-700 border-gray-700 bg-gray-100",
			};
	}
}

export interface OrderItems {
	id: number;
	orderNumber: string;
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
