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
	termsOfPayment: string;
	paidAmount: number;
	cashRegister: string;
	text: string;
}

interface OrderLines {
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
	salesOrderAddresses: Address[];
	salesOrderLines: OrderLines[];
}

export type PaymentMethod = "card" | "paypal" | "invoice";
