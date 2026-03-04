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

export type OrderConfirmationStatus = "Venter godkjenning" | "Godkjent" | "Avvist";

export interface OrderDifference {
	mismatches: Record<string, any>;
	orderLineNumber: number;
}

export interface OrderLine {
	orderLineId: number;
	orderLineNumber: number;
	itemNumber: string;
	itemName: string;
	quantity: number;
	unit: string;
	netPrice: number;
	lineStatus: number | null;
	lineSum: number;
	supplierItemNumber: string;
	globalTradeItemNumber: string | null;
	shipmentDate: string;
	arrivalDate: string;
}

export interface OrderInputLine {
	unit: string;
	itemid: number;
	lineSum: number;
	netPrice: number;
	quantity: number;
	itemNumber: string;
	lineStatus: number;
	arrivalDate: string;
	globalitemid: number | null;
	shipmentDate: string;
	supplieritemid: number;
	orderLineNumber: number;
	globalItemNumber: string | null;
	supplierItemNumber: string;
}

export interface OrderInput {
	lines: OrderInputLine[];
	order: {
		sum: number;
		currency: string;
		buyerName: string;
		surcharge: number;
		buyerNumber: string;
		customerRef: string;
		orderNumber: number;
		supplierName: string;
		createDateTime: string;
		supplierNumber: string;
		customerOrderRef: string;
	};
}

export interface OpenOrderConfirmationRaw {
	orderId: number;
	timestamp: string;
	message: string;
	status: number;
	orderNumber: number;
	createDateTime: string;
	customerOrderRef: string | null;
	customerRef: string;
	companyNumber: number;
	warehouseNumber: string;
	warehouseName: string;
	sum: number;
	shipperName: string | null;
	shipperDescription: string;
	paymentTermDescription: string;
	deliveryTermDescription: string;
	currency: string;
	buyerName: string;
	buyerNumber: string;
	surcharge: number | null;
	supplierNumber: string;
	handler: string | null;
	differences: OrderDifference[];
	input: OrderInput;
}

export interface OpenOrderConfirmation {
	orderId: string;
	supplier: string;
	date: string;
	deviation: number;
	status: OrderConfirmationStatus;
	handled: string | null;
}

export interface OpenConfirmationsResponse {
	page: number;
	limit: number;
	data: OpenOrderConfirmationRaw[];
}

/** One mismatch entry: field name -> database vs incoming value */
export interface OrderLineMismatch {
	database: string;
	incoming: string;
}

/** One block of differences for a line (orderLineNumber can be 0 for header-level) */
export interface OrderLineDifference {
	orderLineNumber: number;
	mismatches: Record<string, OrderLineMismatch>;
}

/** Incoming line from supplier (EDI) */
export interface IncomingLineItem {
	orderLineNumber: number;
	itemNumber: string;
	quantity: number;
	unit: string;
	netPrice: number;
	lineSum: number;
	lineStatus: number;
	shipmentDate: string;
	arrivalDate: string;
	itemid?: number;
	globalitemid?: number | null;
	globalItemNumber?: string | null;
	supplieritemid?: number;
	supplierItemNumber?: string;
}

/** Response shape for GET edi/order/openOrders/lines/:orderNumber (single line item) */
export interface OpenOrderLineItemResponse {
	dbOrderLine: {
		orderLineNumber: number;
		quantity: number;
		unit: string;
		netPrice: number;
		lineStatus: string;
		lineSum: number;
		shipmentDate: string;
		arrivalDate: string;
		itemNumber: string;
	};
	incomingLines: IncomingLineItem[];
	differences: OrderLineDifference[];
}

/** Wrapped response when API returns supplier/date at root with lines array */
export interface OpenOrderLinesDetailResponse {
	supplier?: string;
	date?: string;
	orderDate?: string;
	lines?: OpenOrderLineItemResponse[];
}
