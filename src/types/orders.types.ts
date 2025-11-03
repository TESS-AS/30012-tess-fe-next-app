import { SalesOrderAddress } from "./user.types";

export interface Address {
	name: string;
	addressLine1: string;
	addressLine2: string;
	addressLine3: string;
	postalCode: string;
	partyQualifier: string;
	country: string;
}

export interface SalesOrderHeader {
	customerReference: string;
	customersOrderNumberEdifact: string;
	customerNumber: string;
	dispatchDate: string;
	orderType: string;
	customersOrderReference: string;
	warehouseNumber: string;
	termsOfDelivery: string;
	// termsOfPayment: string;
	paidAmount: number;
	cashRegister: string;
	text: string;
}

export interface OrderLines {
	warehouseNumber: string;
	orderType: string;
	itemCode: string;
	orderedQuantity: number;
	salesPrice: number;
	requestedDeliveryDate: string;
	accountPart3: string;
	accountPart4: string;
	accountPart5: string;
	text: string;
	customerOrderLine?: number;
}

export interface Order {
	documentControl: {
		companyCode: string;
	};
	salesOrderHeader: SalesOrderHeader;
	salesOrderAddresses: SalesOrderAddress[];
	salesOrderLines: OrderLines[];
}

export interface OrderResponse {
	data: string;
	order: {
		Ordrebekreftelse: {
			Ordrenummer: string;
			Dato: string;
			"Navn (Kontaktperson)": string;
			Firma: string | null;
			Addresse: Array<{
				name: string;
				addressLine1: string;
				addressLine2: string;
				addressLine4: string;
				postalCode: string;
				partyQualifier: string;
				country: string;
			}>;
			"E-post": string;
			Varelinjer: Array<{
				Varenummer: string;
				Varenavn: { itemName: string };
				Antall: number;
				Pris: number;
				"Dimensjon 3": string;
			}>;
		};
	};
}

export type PaymentMethod = "card" | "paypal" | "invoice";

export interface UserOrderResponse {
	orderNumber: string;
	status: string;
	order_id: number;
	requestDate: string;
	requestTime: string;
	totalOrderPrice: number;
	orderLines: Array<{
		lineId: number;
		itemNumber: string;
		quantity: number;
		unitPris: number;
		totalLinePrice: number;
	}>;
}
